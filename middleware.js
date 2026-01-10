import { NextResponse } from 'next/server';

// 允许访问的城市关键词
// 优先从环境变量获取，多个城市用逗号分隔，例如 "Beijing,Shanghai"
const ALLOWED_REGIONS = (process.env.ALLOWED_REGIONS || 'Beijing').split(',').map(r => r.trim());

export function middleware(request) {
  const { geo } = request;
  const city = geo?.city || 'Unknown';
  const region = geo?.region || 'Unknown';
  
  console.log(`User Location: ${city}, ${region}`);

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
