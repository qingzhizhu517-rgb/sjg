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
      <div class="filter-group">
        <slot name="filters" />
      </div>
      <div class="action-group">
        <el-button v-if="showImport" class="btn-outline" @click="$emit('import')">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button v-if="showAdd" class="btn-zhu" type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </div>
    </div>

    <div v-if="errorMsg" class="table-state">
      <el-empty :description="errorMsg">
        <el-button class="btn-outline" @click="fetch">重新加载</el-button>
      </el-empty>
    </div>

    <el-table v-else :data="data" v-loading="loading" stripe class="traditional-table" style="width: 100%; height: 100%">
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

    <div v-if="!loading && !errorMsg && data.length === 0" class="table-state compact">
      <el-empty :description="emptyText" />
    </div>

    <el-pagination
      v-if="!errorMsg"
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

const props = defineProps({
  fetchFn: Function,
  showImport: { type: Boolean, default: true },
  showAdd: { type: Boolean, default: true },
  emptyText: { type: String, default: '暂无数据' },
})
const emit = defineEmits(['add', 'edit', 'delete', 'import'])

const data = ref([])
const loading = ref(false)
const errorMsg = ref('')
const keyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)

const fetch = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await props.fetchFn(page.value, size.value, keyword.value)
    data.value = result.records || []
    total.value = result.total || 0
  } catch (err) {
    data.value = []
    total.value = 0
    errorMsg.value = err.message || '加载失败'
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

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.table-state {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-md);
  background: #FAF6EF;
}

.table-state.compact {
  min-height: 180px;
  margin-top: 12px;
}
</style>
