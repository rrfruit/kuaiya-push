export type Platform = {
  name: string;
  code: string;
  logoUrl: string;
};

export const xhongshu: Platform = {
  name: "小红书",
  code: "xhongshu",
  logoUrl: "https://www.xiaohongshu.com/favicon.ico",
};

export const douyin: Platform = {
  name: "抖音",
  code: "douyin",
  logoUrl: "https://www.douyin.com/favicon.ico",
};

export const tiktok: Platform = {
  name: "TikTok",
  code: "tiktok",
  logoUrl: "https://www.tiktok.com/favicon.ico",
};

export const kuaishou: Platform = {
  name: "快手",
  code: "kuaishou",
  logoUrl: "https://www.kuaishou.com/favicon.ico",
};

export const shipinhao: Platform = {
  name: "视频号",
  code: "shipinhao",
  logoUrl: "https://res.wx.qq.com/t/wx_fed/finder/helper/finder-helper-web/res/favicon-v2.ico",
};

export const platforms: Platform[] = [
  xhongshu,
  douyin,
  tiktok,
  kuaishou,
  shipinhao,
];

export default platforms;

