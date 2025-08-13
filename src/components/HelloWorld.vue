<template>
    <div>
  <div class="editor-container" ref="editorContainer" style="height: 900px; width: 100%;"></div>

    </div>
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  name: 'MonacoEditorDemo',
  mounted() {
    this.editor = monaco.editor.create(this.$refs.editorContainer, {
      value: '// 请输入代码\nconsole.log("Hello Monaco!");',
      language: 'json',
      theme: 'vs-light',
      fontSize: 16,
      automaticLayout: true
    })
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.dispose()
    }
  }
}
</script>

<style scoped>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>