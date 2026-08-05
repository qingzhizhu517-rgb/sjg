// ThemeProfile 入口：聚合两风格 profile + 资源 manifest。
// 消费方优先用 useTheme().themeProfile / resolveAsset / resolveContent；
// 本模块供不便走 composable 的场景（如构建期脚本、单测）直接调用。
import { profile as realProfile } from './real/profile'
import { profile as inkwashProfile } from './inkwash/profile'
import { resolveAsset, assetManifest } from './manifest'

const profiles = { real: realProfile, inkwash: inkwashProfile }

/** 取主题档案；非法值兜底 real */
export const resolveProfile = (theme) => profiles[theme] || realProfile

export const THEMES = Object.keys(profiles)

export { resolveAsset, assetManifest }
