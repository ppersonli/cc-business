// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import { create } from 'zustand'
import { openDB, type IDBPDatabase } from 'idb'

export interface Article {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

const DB_NAME = 'wemd-editor'
const DB_VERSION = 1
const STORE_NAME = 'articles'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('updatedAt', 'updatedAt')
        }
      },
    })
  }
  return dbPromise
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function extractTitle(content: string): string {
  const firstLine = content.split('\n').find((l) => l.trim()) || ''
  const match = firstLine.match(/^#{1,3}\s+(.+)/)
  if (match) return match[1].trim().slice(0, 50)
  return firstLine.trim().slice(0, 50) || '未命名文章'
}

interface HistoryState {
  articles: Article[]
  activeId: string | null
  isLoading: boolean
  loadArticles: () => Promise<void>
  createArticle: (content?: string) => Promise<string>
  deleteArticle: (id: string) => Promise<void>
  setActiveArticle: (id: string) => Promise<void>
  updateArticle: (id: string, content: string) => Promise<void>
  clearAll: () => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  articles: [],
  activeId: null,
  isLoading: true,

  loadArticles: async () => {
    try {
      const db = await getDB()
      const all = await db.getAll(STORE_NAME)
      const sorted = all.sort((a, b) => b.updatedAt - a.updatedAt)
      set({ articles: sorted, isLoading: false })

      // If no articles, create a default one
      if (sorted.length === 0) {
        const id = await get().createArticle()
        set({ activeId: id })
      } else if (!get().activeId) {
        set({ activeId: sorted[0].id })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  createArticle: async (content?: string) => {
    const id = generateId()
    const now = Date.now()
    const article: Article = {
      id,
      title: extractTitle(content || ''),
      content: content || '',
      createdAt: now,
      updatedAt: now,
    }
    try {
      const db = await getDB()
      await db.put(STORE_NAME, article)
      set((state) => ({
        articles: [article, ...state.articles],
        activeId: id,
      }))
    } catch {
      // IndexedDB unavailable
    }
    return id
  },

  deleteArticle: async (id: string) => {
    try {
      const db = await getDB()
      await db.delete(STORE_NAME, id)
      set((state) => {
        const remaining = state.articles.filter((a) => a.id !== id)
        const newActiveId =
          state.activeId === id
            ? remaining[0]?.id || null
            : state.activeId
        return { articles: remaining, activeId: newActiveId }
      })
    } catch {
      // IndexedDB unavailable
    }
  },

  setActiveArticle: async (id: string) => {
    set({ activeId: id })
    try {
      const db = await getDB()
      const article = await db.get(STORE_NAME, id)
      if (article) {
        const { useEditorStore } = await import('./editorStore')
        useEditorStore.getState().setContent(article.content)
      }
    } catch {
      // IndexedDB unavailable
    }
  },

  updateArticle: async (id: string, content: string) => {
    try {
      const db = await getDB()
      const article = await db.get(STORE_NAME, id)
      if (article) {
        article.content = content
        article.title = extractTitle(content)
        article.updatedAt = Date.now()
        await db.put(STORE_NAME, article)
        set((state) => ({
          articles: state.articles
            .map((a) => (a.id === id ? article : a))
            .sort((a, b) => b.updatedAt - a.updatedAt),
        }))
      }
    } catch {
      // IndexedDB unavailable
    }
  },

  clearAll: async () => {
    try {
      const db = await getDB()
      await db.clear(STORE_NAME)
      set({ articles: [], activeId: null })
    } catch {
      // IndexedDB unavailable
    }
  },
}))
