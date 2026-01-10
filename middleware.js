import { NextResponse } from 'next/server';

// 允许访问的城市关键词
// 优先从环境变量获取，多个城市用逗号分隔，例如 "Beijing,Shanghai"
// 注意：如果启用高德 API，这里建议使用中文，例如 "北京"
const ALLOWED_REGIONS = (process.env.ALLOWED_REGIONS || 'Beijing').split(',').map(r => r.trim());

// 高德地图 API Key (需要在 Vercel 环境变量中配置 AMAP_KEY)
const AMAP_KEY = process.env.AMAP_KEY;

export async function middleware(request) {
  let city = 'Unknown';
  let region = 'Unknown';

  // 1. 尝试使用高德 API 获取位置 (如果配置了 Key)
  if (AMAP_KEY) {
    try {
      // 获取用户 IP (x-forwarded-for 可能包含多个 IP，取第一个)
      let ip = request.ip || request.headers.get('x-forwarded-for') || '';
      if (ip.includes(',')) ip = ip.split(',')[0].trim();

      if (ip) {
        const res = await fetch(`https://restapi.amap.com/v3/ip?ip=${ip}&key=${AMAP_KEY}`);
        const data = await res.json();

        // status '1' 表示成功
        if (data.status === '1') {
          // 高德返回的是中文，例如 province: "北京市", city: "北京市"
          region = data.province || 'Unknown';
          // 直辖市的 city 字段可能为空，用 province 兜底
          city = (data.city && typeof data.city === 'string' && data.city.length > 0) ? data.city : region;
          console.log(`Amap Location: ${city}, ${region} (IP: ${ip})`);
        }
      }
    } catch (error) {
      console.error('Amap API Error:', error);
    }
  }

  // 2. 如果高德未配置或获取失败，回退到 Vercel 原生 Geo
  if (city === 'Unknown') {
    const geo = request.geo || {};
    city = geo.city || request.headers.get('x-vercel-ip-city') || 'Unknown';
    region = geo.region || request.headers.get('x-vercel-ip-country-region') || 'Unknown';
    console.log(`Vercel Location: ${city}, ${region}`);
  }

  // 判断逻辑
  const isAuthorized = ALLOWED_REGIONS.some(loc => 
    (city && city.includes(loc)) || (region && region.includes(loc))
  );

  const url = request.nextUrl.clone();

  if (isAuthorized) {
    // 验证通过：指向 public/success.html
    url.pathname = '/success.html';
    return NextResponse.rewrite(url);
  } else {
    // 验证失败：指向 public/blocked.html
    url.pathname = '/blocked.html';
    return NextResponse.rewrite(url);
  }
}

// 拦截配置：拦截根路径，排除静态资源文件
export const config = {
  matcher: [
    '/', 
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:html|jpg|png|gif|svg|css|js)).*)'
  ],
};
