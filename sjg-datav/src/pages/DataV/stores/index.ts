import { create } from 'zustand'

interface DataVStore {
  // 数据状态
  poets: any[]
  poems: any[]
  spots: any[]
  dynasties: any[]

  // 加载状态
  loading: {
    poets: boolean
    poems: boolean
    spots: boolean
    dynasties: boolean
  }

  // 操作
  setPoets: (poets: any[]) => void
  setPoems: (poems: any[]) => void
  setSpots: (spots: any[]) => void
  setDynasties: (dynasties: any[]) => void
  setLoading: (key: keyof DataVStore['loading'], value: boolean) => void
}

export const useDataVStore = create<DataVStore>((set) => ({
  // 初始状态
  poets: [],
  poems: [],
  spots: [],
  dynasties: [],

  loading: {
    poets: false,
    poems: false,
    spots: false,
    dynasties: false
  },

  // 操作
  setPoets: (poets) => set({ poets }),
  setPoems: (poems) => set({ poems }),
  setSpots: (spots) => set({ spots }),
  setDynasties: (dynasties) => set({ dynasties }),
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  }))
}))
