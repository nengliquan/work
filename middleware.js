import { NextResponse } from 'next/server';

  // 允许通过的关键词 (Cloudflare 传来的 Region 或 City 包含这些即视为“IP在北京”)
  const envRegions = process.env.ALLOWED_REGIONS || '';
  // 将字符串 "Beijing,Shanghai,Jinrongjie" 转换成数组 ['Beijing', 'Shanghai', 'Jinrongjie']
  // 并去除可能多余的空格
  const ALLOWED_TARGETS = envRegions.split(',').map(item => item.trim()).filter(Boolean);

export function middleware(request) {
  const { headers } = request;

  // 2. 获取位置信息 (优先读取 Cloudflare 规则传递的 Header)
  // 如果你在本地测试没有 CF，默认是 Unknown
  const city = headers.get('x-user-city') || 'Unknown';
  const region = headers.get('x-user-region') || 'Unknown';
  
  console.log(`[Middleware] Checking IP: Region=${region}, City=${city}`);

  // 3. 判断 IP 是否在北京
  const isIpInBeijing = ALLOWED_TARGETS.some(target => {
    return region.includes(target) || city.includes(target);
  });

  // 4. 决定跳转逻辑
  const url = request.nextUrl.clone();
  url.pathname = '/verification.html';
  
  // 将环境变量中的经纬度配置传递给前端页面 (默认值保持为北京范围)
  url.searchParams.set('lat_min', process.env.GEO_LAT_MIN || '39.3');
  url.searchParams.set('lat_max', process.env.GEO_LAT_MAX || '41.7');
  url.searchParams.set('lon_min', process.env.GEO_LON_MIN || '115.3');
  url.searchParams.set('lon_max', process.env.GEO_LON_MAX || '117.6');

  // 传递 IP 位置信息供后续页面显示
  url.searchParams.set('city', city);
  url.searchParams.set('region', region);

  if (!isIpInBeijing) {
    console.log('[Middleware] IP NOT in allowed region.');
    // ❌ 情况B：IP 不在北京 -> 重定向到验证页，并附带错误原因
    url.searchParams.set('tag', "环境风险提示");
    url.searchParams.set('msg', "系统检测到当前网络环境存在异常（IP_RISK）。为确保文稿安全，请授权环境认证以继续。");
    return NextResponse.redirect(url);
  } else {
    console.log('[Middleware] IP in allowed region. Enforcing strict check.');
    // ✅ 情况A：IP 在北京 -> 重定向到验证页 (使用页面默认的“精确核验”文案)
    return NextResponse.redirect(url);
  }
}

// 拦截规则：排除静态资源和 API
export const config = {
  matcher: [
    '/', 
    '/((?!api|_next/static|_next/image|favicon.ico|success.html|verification.html|blocked.html|.*\\.(?:html|jpg|png|gif|svg|css|js)).*)'
  ],
};