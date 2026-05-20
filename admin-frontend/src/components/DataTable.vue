<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <div>
        <el-input v-model="keyword" placeholder="搜索..." style="width: 240px; margin-right: 8px;" @keyup.enter="search" clearable />
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
      <div>
        <el-button @click="$emit('import')">批量导入</el-button>
        <el-button type="primary" @click="$emit('add')">新增</el-button>
      </div>
    </div>
    <el-table :data="data" v-loading="loading" border stripe>
      <slot />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="$emit('edit', row)">编辑</el-button>
          <el-popconfirm title="确定删除?" @confirm="$emit('delete', row)">
            <template #reference>
              <el-button type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 16px; justify-content: flex-end;"
      v-model:current-page="page"
      v-model:page-size="size"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @current-change="fetch"
      @size-change="fetch"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({ fetchFn: Function })
const emit = defineEmits(['add', 'edit', 'delete', 'import'])

const data = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)

const fetch = async () => {
  loading.value = true
  try {
    const result = await props.fetchFn(page.value, size.value, keyword.value)
    data.value = result.records
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const search = () => { page.value = 1; fetch() }

onMounted(fetch)

defineExpose({ fetch })
</script>
