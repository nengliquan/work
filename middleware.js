import { NextResponse } from 'next/server';

// 预设城市经纬度范围配置 (涵盖全国主要城市)
const CITY_COORDINATES = {
  // 直辖市
  'Beijing':    { lat_min: 39.4, lat_max: 41.1, lon_min: 115.4, lon_max: 117.6 },
  'Shanghai':   { lat_min: 30.6, lat_max: 31.9, lon_min: 120.8, lon_max: 122.3 },
  'Tianjin':    { lat_min: 38.5, lat_max: 40.3, lon_min: 116.7, lon_max: 118.1 },
  'Chongqing':  { lat_min: 28.1, lat_max: 32.2, lon_min: 105.2, lon_max: 110.2 },
  
  // 港澳台
  'HongKong':   { lat_min: 22.1, lat_max: 22.6, lon_min: 113.8, lon_max: 114.5 },
  'Macau':      { lat_min: 22.1, lat_max: 22.3, lon_min: 113.5, lon_max: 113.6 },
  'Taipei':     { lat_min: 24.9, lat_max: 25.3, lon_min: 121.4, lon_max: 121.7 },
  'Kaohsiung':  { lat_min: 22.5, lat_max: 22.8, lon_min: 120.2, lon_max: 120.4 },
  'Taichung':   { lat_min: 24.0, lat_max: 24.5, lon_min: 120.5, lon_max: 120.8 },

  // 广东
  'Guangzhou':  { lat_min: 22.5, lat_max: 23.9, lon_min: 112.9, lon_max: 114.1 },
  'Shenzhen':   { lat_min: 22.4, lat_max: 22.9, lon_min: 113.7, lon_max: 114.7 },
  'Dongguan':   { lat_min: 22.6, lat_max: 23.2, lon_min: 113.5, lon_max: 114.2 },
  'Foshan':     { lat_min: 22.6, lat_max: 23.6, lon_min: 112.3, lon_max: 113.4 },
  'Zhuhai':     { lat_min: 21.8, lat_max: 22.5, lon_min: 113.0, lon_max: 113.7 },
  'Huizhou':    { lat_min: 22.5, lat_max: 23.9, lon_min: 113.8, lon_max: 115.4 },
  'Zhongshan':  { lat_min: 22.1, lat_max: 22.9, lon_min: 113.1, lon_max: 113.7 },

  // 江苏
  'Nanjing':    { lat_min: 31.2, lat_max: 32.6, lon_min: 118.3, lon_max: 119.3 },
  'Suzhou':     { lat_min: 30.9, lat_max: 32.1, lon_min: 119.9, lon_max: 121.4 },
  'Wuxi':       { lat_min: 31.1, lat_max: 32.0, lon_min: 119.5, lon_max: 120.7 },
  'Changzhou':  { lat_min: 31.1, lat_max: 32.1, lon_min: 119.1, lon_max: 120.2 },
  'Nantong':    { lat_min: 31.6, lat_max: 32.7, lon_min: 120.2, lon_max: 121.9 },
  'Xuzhou':     { lat_min: 33.7, lat_max: 34.9, lon_min: 116.3, lon_max: 118.7 },
  'Yangzhou':   { lat_min: 32.1, lat_max: 33.4, lon_min: 119.0, lon_max: 119.9 },

  // 浙江
  'Hangzhou':   { lat_min: 29.1, lat_max: 30.6, lon_min: 118.3, lon_max: 120.8 },
  'Ningbo':     { lat_min: 28.8, lat_max: 30.6, lon_min: 120.9, lon_max: 122.2 },
  'Wenzhou':    { lat_min: 27.0, lat_max: 28.6, lon_min: 119.6, lon_max: 121.3 },
  'Jiaxing':    { lat_min: 30.2, lat_max: 31.1, lon_min: 120.3, lon_max: 121.3 },
  'Shaoxing':   { lat_min: 29.2, lat_max: 30.4, lon_min: 119.8, lon_max: 121.2 },
  'Jinhua':     { lat_min: 28.5, lat_max: 29.7, lon_min: 119.2, lon_max: 120.8 },

  // 福建
  'Fuzhou':     { lat_min: 25.2, lat_max: 26.6, lon_min: 118.1, lon_max: 120.0 },
  'Xiamen':     { lat_min: 24.4, lat_max: 24.9, lon_min: 117.8, lon_max: 118.4 },
  'Quanzhou':   { lat_min: 24.5, lat_max: 25.9, lon_min: 117.4, lon_max: 119.1 },

  // 山东
  'Jinan':      { lat_min: 36.0, lat_max: 37.5, lon_min: 116.2, lon_max: 117.9 },
  'Qingdao':    { lat_min: 35.5, lat_max: 37.1, lon_min: 119.5, lon_max: 121.0 },
  'Yantai':     { lat_min: 36.2, lat_max: 38.4, lon_min: 119.5, lon_max: 122.7 },
  'Weifang':    { lat_min: 35.6, lat_max: 37.4, lon_min: 118.1, lon_max: 120.0 },

  // 河北
  'Shijiazhuang': { lat_min: 37.4, lat_max: 38.8, lon_min: 113.5, lon_max: 115.5 },
  'Tangshan':     { lat_min: 38.9, lat_max: 40.5, lon_min: 117.5, lon_max: 119.3 },
  'Baoding':      { lat_min: 38.1, lat_max: 39.9, lon_min: 113.6, lon_max: 116.3 },
  'Xiongan':      { lat_min: 38.7, lat_max: 39.1, lon_min: 115.7, lon_max: 116.3 },

  // 河南
  'Zhengzhou':  { lat_min: 34.2, lat_max: 35.0, lon_min: 112.7, lon_max: 114.3 },
  'Luoyang':    { lat_min: 33.5, lat_max: 35.1, lon_min: 111.1, lon_max: 112.9 },

  // 湖北
  'Wuhan':      { lat_min: 29.9, lat_max: 31.4, lon_min: 113.6, lon_max: 115.1 },
  'Yichang':    { lat_min: 29.9, lat_max: 31.6, lon_min: 110.2, lon_max: 112.1 },

  // 湖南
  'Changsha':   { lat_min: 27.8, lat_max: 28.6, lon_min: 111.8, lon_max: 114.3 },
  'Zhuzhou':    { lat_min: 26.0, lat_max: 28.0, lon_min: 112.5, lon_max: 114.2 },

  // 四川
  'Chengdu':    { lat_min: 30.0, lat_max: 31.5, lon_min: 102.9, lon_max: 104.9 },
  'Mianyang':   { lat_min: 30.6, lat_max: 33.0, lon_min: 103.7, lon_max: 105.6 },

  // 安徽
  'Hefei':      { lat_min: 31.4, lat_max: 32.6, lon_min: 116.6, lon_max: 118.0 },
  'Wuhu':       { lat_min: 30.3, lat_max: 31.6, lon_min: 117.9, lon_max: 118.8 },

  // 辽宁
  'Shenyang':   { lat_min: 41.1, lat_max: 43.1, lon_min: 122.4, lon_max: 123.8 },
  'Dalian':     { lat_min: 38.7, lat_max: 40.2, lon_min: 120.9, lon_max: 123.5 },

  // 黑龙江
  'Harbin':     { lat_min: 44.0, lat_max: 46.7, lon_min: 125.7, lon_max: 130.2 },

  // 吉林
  'Changchun':  { lat_min: 43.0, lat_max: 45.3, lon_min: 124.3, lon_max: 127.1 },

  // 陕西
  'Xian':       { lat_min: 33.6, lat_max: 34.8, lon_min: 107.6, lon_max: 109.9 },

  // 山西
  'Taiyuan':    { lat_min: 37.4, lat_max: 38.3, lon_min: 111.5, lon_max: 113.1 },

  // 江西
  'Nanchang':   { lat_min: 28.1, lat_max: 29.2, lon_min: 115.4, lon_max: 116.6 },

  // 云南
  'Kunming':    { lat_min: 24.3, lat_max: 26.6, lon_min: 102.1, lon_max: 103.7 },

  // 贵州
  'Guiyang':    { lat_min: 26.1, lat_max: 27.4, lon_min: 106.0, lon_max: 107.6 },

  // 广西
  'Nanning':    { lat_min: 22.2, lat_max: 24.0, lon_min: 107.3, lon_max: 109.6 },
  'Guilin':     { lat_min: 24.2, lat_max: 26.4, lon_min: 109.6, lon_max: 111.5 },

  // 海南
  'Haikou':     { lat_min: 19.5, lat_max: 20.1, lon_min: 110.1, lon_max: 110.8 },
  'Sanya':      { lat_min: 18.1, lat_max: 18.7, lon_min: 108.9, lon_max: 109.8 },

  // 内蒙古
  'Hohhot':     { lat_min: 39.5, lat_max: 41.8, lon_min: 110.7, lon_max: 112.2 },
  'Baotou':     { lat_min: 40.2, lat_max: 42.7, lon_min: 109.2, lon_max: 111.2 },

  // 宁夏
  'Yinchuan':   { lat_min: 37.4, lat_max: 38.9, lon_min: 105.8, lon_max: 106.9 },

  // 甘肃
  'Lanzhou':    { lat_min: 35.5, lat_max: 37.0, lon_min: 102.5, lon_max: 104.6 },

  // 青海
  'Xining':     { lat_min: 36.2, lat_max: 37.5, lon_min: 100.8, lon_max: 102.0 },

  // 新疆
  'Urumqi':     { lat_min: 42.7, lat_max: 45.0, lon_min: 86.6, lon_max: 88.9 },

  // 西藏
  'Lhasa':      { lat_min: 29.2, lat_max: 30.5, lon_min: 90.1, lon_max: 92.1 },
};

export function middleware(request) {
  const { headers } = request;

  // 2. 获取位置信息 (优先读取 Cloudflare 规则传递的 Header)
  // 如果你在本地测试没有 CF，默认是 Unknown
  const city = headers.get('x-user-city') || 'Unknown';
  const region = headers.get('x-user-region') || 'Unknown';
  
  console.log(`[Middleware] Checking IP: Region=${region}, City=${city}`);

  // 4. 决定跳转逻辑
  const url = request.nextUrl.clone();
  url.pathname = '/verification.html';
  
  // 1. 获取目标城市 (环境变量 ALLOWED_REGIONS，默认为 Beijing)
  const targetCity = process.env.ALLOWED_REGIONS || 'Beijing';
  // 2. 根据城市获取经纬度配置，如果未找到则默认使用 Beijing
  const coords = CITY_COORDINATES[targetCity] || CITY_COORDINATES['Beijing'];

  url.searchParams.set('lat_min', coords.lat_min);
  url.searchParams.set('lat_max', coords.lat_max);
  url.searchParams.set('lon_min', coords.lon_min);
  url.searchParams.set('lon_max', coords.lon_max);

  // 传递 IP 位置信息供后续页面显示
  url.searchParams.set('city', city);
  url.searchParams.set('region', region);

  console.log('[Middleware] Redirecting to verification page.');
  return NextResponse.redirect(url);
}

// 拦截规则：排除静态资源和 API
export const config = {
  matcher: [
    '/', 
    '/((?!api|_next/static|_next/image|favicon.ico|success.html|verification.html|blocked.html|.*\\.(?:html|jpg|png|gif|svg|css|js)).*)'
  ],
};
