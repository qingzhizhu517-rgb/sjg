export function useImage() {
  const getImageUrl = (url, isAnime = false) => {
    if (!url) return getPlaceholder(isAnime)
    
    // Clean and replace OSS prefix
    let localPath = url.replace('https://shandong-lit-landscape.oss-cn-beijing.aliyuncs.com', '/images')
    
    // Normalize extensions to .jpg for local assets
    localPath = localPath.replace('.png', '.jpg')
    
    // Check if we have the file locally
    const availableFiles = [
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
    ]
    
    // If it's anime theme, try to get the anime version
    if (isAnime) {
      let animePath = localPath
      if (!animePath.includes('_anime')) {
        animePath = animePath.replace('.jpg', '_anime.jpg')
      }
      if (availableFiles.includes(animePath)) {
        return animePath
      }
    } else {
      // If it's real theme, try to get the real version
      let realPath = localPath.replace('_anime.jpg', '.jpg')
      if (availableFiles.includes(realPath)) {
        return realPath
      }
    }
    
    // Check if original/normalized path is available directly
    if (availableFiles.includes(localPath)) {
      return localPath
    }
    
    // Fallback logic for missing assets to maintain gorgeous visual exhibition
    if (localPath.includes('/poets/')) {
      return isAnime ? '/images/poets/li_bai_anime.jpg' : '/images/poets/li_bai.jpg'
    } else if (localPath.includes('/spots/')) {
      return isAnime ? '/images/spots/baotu_spring_anime.jpg' : '/images/spots/baotu_spring.jpg'
    }
    
    return localPath
  }

  const getPlaceholder = (isAnime = false) => {
    return isAnime ? '/images/poets/li_bai_anime.jpg' : '/images/poets/li_bai.jpg'
  }

  return { getImageUrl }
}
