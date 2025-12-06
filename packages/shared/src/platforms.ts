export type Platform = {
  name: string;
  code: string;
  logoUrl: string;
  url: string;
};

export const xhongshu: Platform = {
  name: "小红书",
  code: "xhongshu",
  logoUrl: "https://www.xiaohongshu.com/favicon.ico",
  url: "https://www.xiaohongshu.com",
};

export const douyin: Platform = {
  name: "抖音",
  code: "douyin",
  logoUrl: "https://www.douyin.com/favicon.ico",
  url: "https://www.douyin.com",
};

export const tiktok: Platform = {
  name: "TikTok",
  code: "tiktok",
  logoUrl: "https://www.tiktok.com/favicon.ico",
  url: "https://www.tiktok.com",
};

export const kuaishou: Platform = {
  name: "快手",
  code: "kuaishou",
  logoUrl: "https://www.kuaishou.com/favicon.ico",
  url: "https://www.kuaishou.com",
};

export const shipinhao: Platform = {
  name: "视频号",
  code: "shipinhao",
  logoUrl:
    "https://res.wx.qq.com/t/wx_fed/finder/helper/finder-helper-web/res/favicon-v2.ico",
  url: "https://channels.weixin.qq.com",
};

export const platforms: Platform[] = [
  xhongshu,
  douyin,
  tiktok,
  kuaishou,
  shipinhao,
];

export default platforms;
