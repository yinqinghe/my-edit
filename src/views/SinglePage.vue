<template>
  <button @click="test">test</button>
  <div id="app">
    <div class="editor-container" ref="editorContainer"></div>

  </div>
</template>

<script>
import * as monaco from 'monaco-editor';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

export default {
  methods: {
    test() {
      console.log('===test',)
      this.editor.setValue('mike');

    }
  },
  name: 'MonacoEditorDemo',
  mounted() {
    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === 'json') {
          return new jsonWorker();
        }
        return new editorWorker();
      },
    };
    this.editor = monaco.editor.create(this.$refs.editorContainer, {
      value: '// 请输入代码\nconsole.log("Hello Monaco!");',
      language: 'plaintext',
      theme: 'vs-light',
      fontSize: 16,
      readOnly: false,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none', // 优化渲染
    });
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX, () => {
      this.editor.getAction('editor.action.formatDocument').run();
    });
    document.addEventListener("DOMContentLoaded", function () {
      document.body.style.height = "99%";
    });
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.dispose();
    }
  },
};
</script>

<style scoped>
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  height: 100vh;
  max-height: 99%;
  box-sizing: border-box;
  overflow: hidden;
}
</style>