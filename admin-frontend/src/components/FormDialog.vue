<template>
  <el-dialog :model-value="visible" :title="isEdit ? '编辑' : '新增'" @close="$emit('close')" width="600px">
    <el-form :model="form" label-width="100px">
      <slot :form="form" />
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
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
