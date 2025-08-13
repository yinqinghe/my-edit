<template>
    <div id="app">
        <div class="button-container">
            <div class="left-buttons">
                <button @click="showDualEditorPanel">显示双编辑器面板</button>
                <button @click="showSingleEditorPanel">显示单编辑器面板</button>
            </div>
            <div class="right-buttons">
                <button @click="showDialog" class="dialog-button">parse log</button>
            </div>
        </div>

        <!-- 弹出对话框 -->
        <div v-if="dialogVisible" class="dialog-overlay" @click.self="hideDialog">
            <div class="dialog-box">
                <h3>输入log</h3>
                <textarea v-model="inputValue" placeholder="请输入内容..." class="dialog-input"
                    @keyup.ctrl.enter="confirmDialog" rows="20"></textarea>
                <div class="dialog-buttons">
                    <button @click="confirmDialog" class="confirm-btn">确认</button>
                    <button @click="hideDialog" class="cancel-btn">取消</button>
                </div>
            </div>
        </div>

        <div class="content-container">
            <!-- 双编辑器面板 -->
            <div v-show="showDualPanel" class="dual-editor-panel">
                <div class="editor-container" ref="editor1Container"></div>
                <div class="editor-container" ref="editor2Container"></div>
            </div>
            <!-- 单编辑器面板 -->
            <div v-show="showSinglePanel" class="single-editor-panel">
                <div class="editor-container" ref="editor3Container"></div>
            </div>
        </div>
    </div>
</template>

<script>
import * as monaco from 'monaco-editor';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { MDE } from '@/utils/mde.js';
export default {
    data() {
        return {
            showDualPanel: true,
            showSinglePanel: false,
            editor1_value: '{"hello":"world1"}',
            editor2_value: '{"hello":"world2"}',
            editor3_value: '{"hello":"world3"}',
            dialogVisible: false,
            inputValue: '',
        };
    },
    mounted() {
        // 设置 Monaco 环境
        self.MonacoEnvironment = {
            getWorker(_, label) {
                if (label === 'json') {
                    return new jsonWorker();
                }
                return new editorWorker();
            },
        };

        // 初始化编辑器
        this.initializeEditors();

        // 设置页面高度
        document.body.style.height = '99%';
    },
    methods: {
        initializeEditors() {
            // 创建双编辑器面板的编辑器
            if (this.$refs.editor1Container && !this.editor1) {
                this.editor1 = monaco.editor.create(this.$refs.editor1Container, {
                    value: this.editor1_value,
                    language: 'json',
                    theme: 'vs-light',
                    fontSize: 14,
                    readOnly: false,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                });
                this.editor1.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX, () => {
                    this.editor1.getAction('editor.action.formatDocument').run();
                });

            }
            if (this.$refs.editor2Container && !this.editor2) {
                this.editor2 = monaco.editor.create(this.$refs.editor2Container, {
                    value: this.editor2_value,
                    language: 'json',
                    theme: 'vs-light',
                    fontSize: 14,
                    readOnly: false,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'none',
                });
                this.editor2.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX, () => {
                    this.editor2.getAction('editor.action.formatDocument').run();
                });
            }


        },
        showDualEditorPanel() {
            this.showDualPanel = true;
            this.showSinglePanel = false;
        },
        showSingleEditorPanel() {
            this.showDualPanel = false;
            this.showSinglePanel = true;

            // 仅在单编辑器面板显示时创建 editor3
            if (this.showSinglePanel && this.$refs.editor3Container && !this.editor3) {
                this.$nextTick(() => {
                    this.editor3 = monaco.editor.create(this.$refs.editor3Container, {
                        value: this.editor3_value,
                        language: 'json',
                        theme: 'vs-light',
                        fontSize: 15,
                        readOnly: false,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        renderLineHighlight: 'none',
                    });
                    this.editor3.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX, () => {
                        this.editor3.getAction('editor.action.formatDocument').run();
                    });
                });
            }

        },
        showDialog() {
            this.dialogVisible = true;
            this.inputValue = '';
        },
        hideDialog() {
            this.dialogVisible = false;
            this.inputValue = '';
        },
        confirmDialog() {
            if (this.inputValue.trim()) {
                this.editor1.setValue(this.inputValue);
                this.editor1.getAction('editor.action.formatDocument').run();
                const parser = new MDE(this.inputValue);
                this.editor2.setValue(parser.parseLog());
                this.editor2.getAction('editor.action.formatDocument').run();

            }
            this.hideDialog();
        },

    },
    beforeUnmount() {
        // 销毁所有编辑器
        [this.editor1, this.editor2, this.editor3].forEach(editor => {
            if (editor) editor.dispose();
        });
    },
};
</script>

<style scoped>
#app {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-top: 10px;
}

.button-container {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left-buttons {
    display: flex;
}

.right-buttons {
    display: flex;
}

button {
    margin-right: 10px;
    padding: 8px 16px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: #fff;
    border-radius: 4px;
}

button:hover {
    background-color: #f5f5f5;
}

.dialog-button {
    background-color: #007acc;
    color: white;
    border: 1px solid #007acc;
}

.dialog-button:hover {
    background-color: #005a9e;
}

.content-container {
    flex: 1;
    position: relative;
}

.dual-editor-panel,
.single-editor-panel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
}

.dual-editor-panel {
    gap: 10px;
}

.editor-container {
    flex: 1;
    min-height: 400px;
    border: 1px solid #ccc;
}

/* 对话框样式 */
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog-box {
    background: white;
    border-radius: 8px;
    padding: 24px;
    min-width: 400px;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.dialog-box h3 {
    margin: 0 0 16px 0;
    color: #333;
}

.dialog-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 16px;
    box-sizing: border-box;
    resize: vertical;
    min-height: 120px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.5;
}

.dialog-input:focus {
    outline: none;
    border-color: #007acc;
}

.dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.dialog-buttons button {
    margin-right: 0;
}

.confirm-btn {
    background-color: #007acc;
    color: white;
    border: 1px solid #007acc;
}

.confirm-btn:hover {
    background-color: #005a9e;
}

.cancel-btn {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
}

.cancel-btn:hover {
    background-color: #e8e8e8;
}
</style>