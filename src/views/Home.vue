<template>
  <div class="app">
    <div class="tab-container">
      <div v-for="tab in tabs" :key="tab.id" class="tab" :class="{ active: tab.id === activeTabId }"
        @click="switchTab(tab.id)">
        {{ tab.name }}
        <span class="tab-close" @click.stop="closeTab(tab.id)">×</span>
      </div>
      <div class="add-tab" @click="addTab">+</div>
    </div>
    <div class="editor-container">
      <div v-for="tab in tabs" :key="tab.id" :id="`editor-${tab.id}`" class="editor"
        :class="{ active: tab.id === activeTabId }"></div>
      <div v-if="tabs.length === 0" class="editor active">
        <div class="no-file">无文件</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import * as monaco from 'monaco-editor'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
export default defineComponent({
  name: 'VSCodeEditor',
  data() {
    return {
      tabs: [
        {
          id: 1,
          name: '文件1',
          content: '{\n  "name": "文件1",\n  "value": 123\n}'
        }
      ],
      activeTabId: 1,
      tabCounter: 1,
      editors: {}
    }
  },
  mounted() {
    this.initializeEditors()
    // 确保 Monaco Worker 配置
    self.MonacoEnvironment = {
      getWorker(_, label) {
        switch (label) {
          case 'json':
            return new jsonWorker()
          default:
            return new editorWorker()
        }
      }
    }
    document.addEventListener("DOMContentLoaded", function () {
      document.body.style.height = "99%";
    });
  },
  beforeUnmount() {
    // 清理所有编辑器实例
    this.cleanupEditors()
  },
  methods: {
    initializeEditors() {
      this.tabs.forEach(tab => {
        if (tab.id === this.activeTabId) {
          this.createEditor(tab)
        }
      })
    },
    createEditor(tab) {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          const container = document.getElementById(`editor-${tab.id}`)
          if (container && !this.editors[tab.id]) {
            try {
              // 清空容器并确保可交互
              container.innerHTML = ''
              container.style.pointerEvents = 'auto'
              this.editors[tab.id] = monaco.editor.create(container, {
                value: tab.content,
                language: 'json',
                theme: 'vs-light',
                fontSize: 15,
                automaticLayout: true,
                readOnly: false, // 确保编辑器可编辑
                scrollBeyondLastLine: false,
              })
              this.editors[tab.id].addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX, () => {
                this.editors[tab.id].getAction('editor.action.formatDocument').run()
              })
              // 确保编辑器获取焦点
              this.editors[tab.id].focus()
              console.log(`编辑器创建成功 (tab ${tab.id})`)
              resolve()
            } catch (error) {
              console.error(`创建编辑器失败 (tab ${tab.id}):`, error)
              resolve()
            }
          } else if (!container) {
            console.error(`容器 editor-${tab.id} 未找到`)
            resolve()
          } else {
            console.warn(`编辑器已存在 (tab ${tab.id})`)
            resolve()
          }
        })
      })
    },
    addTab() {
      this.tabCounter++
      const newTab = {
        id: this.tabCounter,
        name: `文件${this.tabCounter}`,
        content: `{\n  "name": "文件${this.tabCounter}",\n  "value": ${this.tabCounter}\n}`
      }
      this.tabs.push(newTab)

      this.$nextTick(async () => {
        await this.createEditor(newTab)
        this.switchTab(newTab.id)
      })
    },
    closeTab(tabId) {
      const tabIndex = this.tabs.findIndex(tab => tab.id === tabId)
      if (tabIndex === -1) return

      const isActive = this.activeTabId === tabId

      // 清理编辑器实例
      if (this.editors[tabId]) {
        try {
          const editor = this.editors[tabId]
          const model = editor.getModel()
          if (model) {
            model.dispose()
          }
          editor.dispose()
          const container = document.getElementById(`editor-${tabId}`)
          if (container && container.parentNode) {
            container.parentNode.removeChild(container)
          }
          console.log(`编辑器销毁成功 (tab ${tabId})`)
        } catch (error) {
          console.error(`清理编辑器失败 (tab ${tabId}):`, error)
        }
        delete this.editors[tabId]
      }

      // 移除标签
      this.tabs.splice(tabIndex, 1)

      // 切换到其他标签
      if (isActive && this.tabs.length > 0) {
        const nextTab = this.tabs[Math.max(0, tabIndex - 1)]
        this.switchTab(nextTab.id)
        this.$nextTick(async () => {
          if (!this.editors[nextTab.id]) {
            await this.createEditor(nextTab)
          }
        })
      } else if (this.tabs.length === 0) {
        this.activeTabId = null
      }
    },
    switchTab(tabId) {
      this.activeTabId = tabId
      if (!this.editors[tabId]) {
        const tab = this.tabs.find(t => t.id === tabId)
        if (tab) {
          this.$nextTick(async () => {
            await this.createEditor(tab)
            this.editors[tabId]?.focus()
          })
        }
      } else {
        this.$nextTick(() => {
          this.editors[tabId]?.focus()
        })
      }
    },
    cleanupEditors() {
      Object.keys(this.editors).forEach(tabId => {
        try {
          const editor = this.editors[tabId]
          if (editor) {
            const model = editor.getModel()
            if (model) {
              model.dispose()
            }
            editor.dispose()
            const container = document.getElementById(`editor-${tabId}`)
            if (container && container.parentNode) {
              container.parentNode.removeChild(container)
            }
            console.log(`清理编辑器成功 (tab ${tabId})`)
          }
        } catch (error) {
          console.error(`清理编辑器失败 (tab ${tabId}):`, error)
        }
        delete this.editors[tabId]
      })
    }
  }
})
</script>


<style scoped>
.app {
  height: 100vh;
  width: 100vw;
  /* 修复宽度单位 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.tab-container {
  display: flex;
  background-color: #252526;
  height: 30px;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid #3c3c3c;
}

.tab-container::-webkit-scrollbar {
  height: 8px;
}

.tab-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.tab-container::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.tab-container::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.tab {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  height: 100%;
  color: #cccccc;
  background-color: #2d2d2d;
  /* 移除透明度 */
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background-color 0.2s;
}

.tab.active {
  background-color: #1e1e1e;
  color: #ffffff;
  border-bottom: 2px solid #007acc;
}

.tab:hover {
  background-color: #3a3a3a;
}

.tab-close {
  margin-left: 8px;
  font-size: 12px;
  color: #999999;
  cursor: pointer;
}

.tab-close:hover {
  color: #ffffff;
}

.add-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 100%;
  color: #cccccc;
  background-color: #252526;
  /* 移除透明度 */
  cursor: pointer;
  font-size: 16px;
}

.add-tab:hover {
  background-color: #3a3a3a;
}

.editor-container {
  height: calc(99% - 30px);
  position: relative;
  overflow: hidden;
}

.editor {
  visibility: hidden;
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.editor.active {
  visibility: visible;
  opacity: 1;
}

.no-file {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 16px;
}
</style>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>