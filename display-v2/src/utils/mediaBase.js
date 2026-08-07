// 解析媒体资源 base 前缀。
// dev：恒用本地 public/ 路径——新素材未上 OSS 前（P2-M9），.env 里的
// VITE_OSS_BUCKET_URL 不应把本地开发指向不存在的远端文件。
// prod：有 OSS 配置则走 OSS（bucket 内与 public/media 同构）。
export const resolveMediaBase = ({ dev, ossUrl }) => {
  if (dev) return ''
  return ossUrl || ''
}
