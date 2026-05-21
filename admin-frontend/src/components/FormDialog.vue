<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑' : '新增'"
    @close="$emit('close')"
    width="620px"
    class="traditional-dialog"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="100px" class="traditional-form">
      <slot :form="form" />
    </el-form>
    <template #footer>
      <el-button class="btn-outline" @click="$emit('close')">取消</el-button>
      <el-button class="btn-zhu" type="primary" :loading="loading" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  initialData: { type: Object, default: () => ({}) },
  submitFn: Function,
})
const emit = defineEmits(['close', 'success'])

const form = ref({})
const loading = ref(false)

watch(() => props.visible, (val) => {
  if (val) form.value = { ...props.initialData }
})

const submit = async () => {
  loading.value = true
  try {
    await props.submitFn(form.value)
    emit('success')
    emit('close')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.traditional-dialog :deep(.el-dialog) {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.traditional-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid var(--border-light);
  background: #FAF6EF;
}

.traditional-dialog :deep(.el-dialog__title) {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-mo);
  letter-spacing: 2px;
}

.traditional-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.traditional-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  background: #FAF6EF;
}

.traditional-form :deep(.el-form-item__label) {
  font-family: var(--font-body);
  color: var(--text-secondary);
  font-size: 14px;
}

.traditional-form :deep(.el-input__wrapper) {
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
}

.traditional-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-jin) inset;
}

.traditional-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-zhu) inset;
}

.traditional-form :deep(.el-textarea__inner) {
  font-family: var(--font-body);
  border-radius: var(--radius-sm);
}

.traditional-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--color-zhu) inset;
}

.traditional-form :deep(.el-select) {
  width: 100%;
}
</style>
