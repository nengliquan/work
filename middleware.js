import { NextResponse } from 'next/server';

// 允许访问的城市或地区关键词 (支持拼音或英文)
// Vercel 返回的北京通常是 "Beijing"
const ALLOWED_REGIONS = ['Beijing'];

export function middleware(request) {
  // 获取 Vercel 识别到的地理位置信息
  const { geo } = request;
  const city = geo?.city || 'Unknown';
  const region = geo?.region || 'Unknown';
  
  console.log(`User Location: ${city}, ${region}`);

  // 判断是否包含北京
  // 逻辑：如果城市名或省份名里包含 Beijing
  const isAuthorized = ALLOWED_REGIONS.some(loc => 
    (city && city.includes(loc)) || (region && region.includes(loc))
  );

  // 如果是北京用户，放行，并给响应头打个标记
  if (isAuthorized) {
    const response = NextResponse.next();
    response.headers.set('x-user-loc', 'beijing');
    return response;
  }

  // 如果不是北京用户，重写路径到 /block 页面 (也可以直接拦截)
  // 为了简单，我们这里通过 URL 参数传递状态给前端
  const url = request.nextUrl.clone();
  url.pathname = '/blocked.html';
  return NextResponse.rewrite(url);
}

// 配置匹配拦截的路径：拦截所有页面，排除图片和资源文件
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|png|gif|svg|css|js)).*)',
  ],
};
