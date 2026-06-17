<template>
  <div class="video-upload-multi">
    <!-- 已上传的视频缩略图列表 -->
    <div v-for="(url, index) in videoList" :key="index" class="video-card" @click="openPreview(index)">
      <video :src="url" class="video-thumb" preload="metadata" />
      <div class="video-play-icon">
        <el-icon><VideoPlay /></el-icon>
      </div>
      <div class="video-overlay">
        <el-icon class="overlay-btn" @click.stop="openPreview(index)"><ZoomIn /></el-icon>
        <el-icon class="overlay-btn" @click.stop="confirmRemove(index)"><Delete /></el-icon>
      </div>
    </div>

    <!-- 上传按钮 -->
    <el-upload
      :show-file-list="false"
      :http-request="handleUpload"
      accept="video/*"
    >
      <div class="add-card" v-loading="uploading" :element-loading-text="loadingText">
        <el-icon><Plus /></el-icon>
        <span>上传视频</span>
        <span class="hint">支持 mp4 等格式，最大 200MB</span>
      </div>
    </el-upload>

    <!-- 视频预览对话框 -->
    <el-dialog v-model="previewVisible" title="视频预览" width="70%" :close-on-click-modal="true" destroy-on-close @closed="pauseVideo">
      <div class="preview-wrap">
        <video
          ref="previewPlayer"
          :src="previewUrl"
          controls
          autoplay
          style="width:100%;max-height:65vh;border-radius:8px;background:#000;"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const props = defineProps({
  modelValue: { type: [String, Array], default: '' },
  directory: { type: String, default: 'videos' },
})

const emit = defineEmits(['update:modelValue'])
const uploading = ref(false)
const uploadProgress = ref(0)
const videoList = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')
const previewPlayer = ref(null)

const parseVideos = (val) => {
  if (!val || val === '[]' || val === '') return []
  if (Array.isArray(val)) return val.filter(v => v)
  if (typeof val === 'string') {
    try {
      const arr = JSON.parse(val)
      if (Array.isArray(arr)) return arr.filter(v => v)
    } catch {
      return val ? [val] : []
    }
  }
  return []
}

watch(() => props.modelValue, (val) => {
  videoList.value = parseVideos(val)
}, { immediate: true })

const emitUpdate = () => {
  emit('update:modelValue', JSON.stringify(videoList.value))
}

const loadingText = computed(() => {
  return uploadProgress.value > 0 ? `上传中 ${uploadProgress.value}%` : '上传中...'
})

const handleUpload = async ({ file }) => {
  if (file.size > 200 * 1024 * 1024) {
    ElMessage.error('视频文件不能超过 200MB')
    return
  }
  uploading.value = true
  uploadProgress.value = 0
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('directory', props.directory)
    const { url } = await api.post('/admin/upload', formData, {
      timeout: 300000,
      onUploadProgress: (e) => {
        if (e.total) uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    videoList.value.push(url)
    emitUpdate()
    ElMessage.success('视频上传成功')
  } catch (e) {
    ElMessage.error('视频上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const openPreview = (index) => {
  previewUrl.value = videoList.value[index]
  previewVisible.value = true
}

const pauseVideo = () => {
  if (previewPlayer.value) {
    previewPlayer.value.pause()
    previewPlayer.value.currentTime = 0
  }
}

const confirmRemove = (index) => {
  ElMessageBox.confirm('确定要删除这个视频吗？删除后不可恢复。', '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
  }).then(() => {
    videoList.value.splice(index, 1)
    emitUpdate()
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style scoped>
.video-upload-multi {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.video-card {
  position: relative;
  width: 200px;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-light);
  cursor: pointer;
}

.video-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255,255,255,0.85);
  font-size: 32px;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.video-card:hover .video-overlay {
  opacity: 1;
}

.video-card:hover .video-play-icon {
  opacity: 0.6;
}

.overlay-btn {
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.overlay-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.add-card {
  width: 200px;
  height: 120px;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: #FAFAF5;
  color: var(--text-muted);
  font-size: 13px;
}

.add-card:hover {
  border-color: var(--color-zhu);
  background: #FDF9F2;
  color: var(--color-zhu);
}

.add-card .el-icon {
  font-size: 24px;
}

.add-card .hint {
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.7;
}

.preview-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
