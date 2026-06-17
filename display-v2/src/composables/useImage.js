export function useImage() {
  const OSS_BASE = import.meta.env.VITE_OSS_BUCKET_URL || ''

  // 从 JSON 数组字符串或单值中提取第一个 URL
  const parseFirstUrl = (val) => {
    if (!val) return null
    if (typeof val === 'string') {
      // JSON 数组：'["https://oss.../a.jpg", "https://oss.../b.jpg"]'
      if (val.startsWith('[')) {
        try {
          const arr = JSON.parse(val)
          if (Array.isArray(arr) && arr.length > 0) return arr[0]
        } catch { /* fall through */ }
      }
      // 以 http 开头的裸 URL
      if (val.startsWith('https://') || val.startsWith('http://')) return val
      // 本地路径
      if (val.startsWith('/')) return val
    }
    return null
  }

  const getImageUrl = (url, isAnime = false) => {
    if (!url) return getPlaceholder(isAnime)

    // 解析可能的 JSON 数组格式
    const parsed = parseFirstUrl(url)
    if (!parsed) return getPlaceholder(isAnime)

    // OSS 完整 URL → 直接用
    if (parsed.startsWith('https://') || parsed.startsWith('http://')) {
      return parsed
    }

    // 本地 /images/ 相对路径 → 检查本地白名单
    const availableFiles = new Set([
      '/images/poets/li_bai.jpg',
      '/images/poets/li_bai_anime.jpg',
      '/images/poets/du_fu.jpg',
      '/images/poets/du_fu_anime.jpg',
      '/images/poets/li_qingzhao.jpg',
      '/images/poets/li_qingzhao_anime.jpg',
      '/images/poets/xin_qiji.jpg',
      '/images/poets/xin_qiji_anime.jpg',
      '/images/poets/pu_songling.jpg',
      '/images/poets/pu_songling_anime.jpg',
      '/images/poets/zhao_mengfu_anime.jpg',
      '/images/spots/baotu_spring.jpg',
      '/images/spots/baotu_spring_anime.jpg',
      '/images/spots/mount_tai.jpg',
      '/images/spots/mount_tai_anime.jpg',
      '/images/spots/daming_lake.jpg',
      '/images/spots/daming_lake_anime.jpg',
      '/images/spots/three_confucius_anime.jpg',
      '/images/spots/yellow_river_estuary_anime.jpg',
      '/images/spots/guangyue_tower_anime.jpg',
      '/images/spots/pu_manor_anime.jpg',
      '/images/spots/sulu_tomb_anime.jpg',
      '/images/spots/wei_manor_anime.jpg',
      '/images/spots/peony_garden_anime.jpg'
    ])

    let localPath = parsed.replace('.png', '.jpg')

    if (isAnime && !localPath.includes('_anime')) {
      localPath = localPath.replace('.jpg', '_anime.jpg')
    }

    if (availableFiles.has(localPath)) {
      return localPath
    }

    return getPlaceholder(isAnime)
  }

  const getPlaceholder = (isAnime = false) => {
    return isAnime ? '/images/poets/li_bai_anime.jpg' : '/images/poets/li_bai.jpg'
  }

  return { getImageUrl }
}
