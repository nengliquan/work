import { NextResponse } from 'next/server';

  // 允许通过的关键词 (Cloudflare 传来的 Region 或 City 包含这些即视为“IP在北京”)
  const envRegions = process.env.ALLOWED_REGIONS；
  // 将字符串 "Beijing,Shanghai,Jinrongjie" 转换成数组 ['Beijing', 'Shanghai', 'Jinrongjie']
  // 并去除可能多余的空格
  const ALLOWED_TARGETS = envRegions.split(',').map(item => item.trim());

export function middleware(request) {
  const { headers, cookies } = request;

  // 2. 获取位置信息 (优先读取 Cloudflare 规则传递的 Header)
  // 如果你在本地测试没有 CF，默认是 Unknown
  const city = headers.get('x-user-city') || 'Unknown';
  const region = headers.get('x-user-region') || 'Unknown';
  
  // 3. 判断 IP 是否在北京
  const isIpInBeijing = ALLOWED_TARGETS.some(target => {
    return region.includes(target) || city.includes(target);
  });

  const url = request.nextUrl.clone();

  if (isIpInBeijing) {
    // ✅ 情况A：IP 显示在北京
    // 策略：不要直接去 success，而是去 router.html
    // 原因：我们要区分“电脑”还是“手机4G”，防止手机4G漂移
    url.pathname = '/router.html';
    return NextResponse.rewrite(url);
  } else {
    // ❌ 情况B：IP 不在北京 (可能是外地，也可能是漂移严重的4G)
    // 策略：直接拦截，送去 GPS 强制验证
    url.pathname = '/verify.html';
    url.searchParams.set('reason', 'ip_error');
    url.searchParams.set('detected', `${region} ${city}`);
    return NextResponse.rewrite(url);
  }
}

// 拦截规则：排除静态资源和 API
export const config = {
  matcher: [
    '/', 
    '/((?!api|_next/static|_next/image|favicon.ico|success.html|verify.html|blocked.html|.*\\.(?:html|jpg|png|gif|svg|css|js)).*)'
  ],
};