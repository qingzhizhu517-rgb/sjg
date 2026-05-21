<template>
  <div class="data-table-wrapper fade-in-up">
    <div class="table-toolbar">
      <div class="search-group">
        <el-input
          v-model="keyword"
          placeholder="搜索..."
          style="width: 260px;"
          @keyup.enter="search"
          clearable
          prefix-icon="Search"
        />
        <el-button class="btn-outline" @click="search">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
      <div class="action-group">
        <el-button class="btn-outline" @click="$emit('import')">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button class="btn-zhu" type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </div>
    </div>

    <el-table :data="data" v-loading="loading" stripe class="traditional-table">
      <slot />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link class="action-link edit" @click="$emit('edit', row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-popconfirm title="确定删除此条记录？" @confirm="$emit('delete', row)" confirm-button-text="确定" cancel-button-text="取消">
            <template #reference>
              <el-button type="danger" link class="action-link delete">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="traditional-pagination"
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

<style scoped>
.traditional-table :deep(.el-table__header th) {
  background: #FAF6EF !important;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.traditional-table :deep(.el-table__row td) {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-primary);
}

.traditional-table :deep(.el-table__row:hover > td) {
  background: #FDF9F2 !important;
}

.traditional-pagination {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
  justify-content: flex-end;
}
</style>
