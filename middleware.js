import { NextResponse } from 'next/server';

export function middleware(request) {
  const { headers, cookies } = request;

  // 1. 【配置读取】从环境变量获取允许的区域
  // 如果后台没配置，默认给个 'Beijing' 防止报错
  const envRegions = process.env.ALLOWED_REGIONS;
  
  // 将字符串 "Beijing,Shanghai,Jinrongjie" 转换成数组 ['Beijing', 'Shanghai', 'Jinrongjie']
  // 并去除可能多余的空格
  const ALLOWED_TARGETS = envRegions.split(',').map(item => item.trim());

  // -------------------------------------------------------------

  // 2. 【特权通道】如果有 GPS 通行证 (Cookie)，直接放行
  if (cookies.get('gps_pass')?.value === '1') {
      const url = request.nextUrl.clone();
      // 防止循环重定向
      if (['/', '/router.html', '/verify.html'].includes(url.pathname)) {
          url.pathname = '/success.html';
          return NextResponse.rewrite(url);
      }
      return NextResponse.next();
  }

  // 3. 获取 Cloudflare 传来的位置信息
  const city = headers.get('x-user-city') || 'Unknown';
  const region = headers.get('x-user-region') || 'Unknown';
  
  console.log(`[Middleware Debug] Raw Headers -> x-user-city: ${headers.get('x-user-city')}, x-user-region: ${headers.get('x-user-region')}`);
  console.log(`[Geo] Detect: ${region} - ${city} | Allowed: ${ALLOWED_TARGETS}`);

  // 4. 判断 IP 是否在允许列表中
  const isIpAllowed = ALLOWED_TARGETS.some(target => {
    // 忽略大小写比对 (防止 beijing != Beijing)
    return region.toLowerCase().includes(target.toLowerCase()) || 
           city.toLowerCase().includes(target.toLowerCase());
  });

  const url = request.nextUrl.clone();

  let response;

  if (isIpAllowed) {
    console.log(`[Middleware Debug] Access GRANTED. Redirecting to /success.html`);
    // ✅ IP 符合要求 -> 去 success.html
    url.pathname = '/success.html';
    response = NextResponse.rewrite(url);
  } else {
    console.log(`[Middleware Debug] Access DENIED. Redirecting to /blocked.html`);
    // ❌ IP 不符合要求 -> 拦截去 blocked.html
    url.pathname = '/blocked.html';
    url.searchParams.set('reason', 'ip_error');
    // 把当前识别到的错误地点传过去
    url.searchParams.set('detected', `${region} ${city}`);
    response = NextResponse.rewrite(url);
  }

  // 将位置信息写入 Cookie，供前端页面读取显示 (设置 httpOnly: false 允许 JS 读取)
  response.cookies.set('detected_geo', `${region} - ${city}`, { path: '/', httpOnly: false });
  
  return response;
}

// 拦截规则
export const config = {
  matcher: [
    '/', 
    '/((?!api|_next/static|_next/image|favicon.ico|success.html|verify.html|blocked.html|.*\\.(?:html|jpg|png|gif|svg|css|js)).*)'
  ],
};