import MonacoEditor from 'monaco-editor'

declare global {
  const monaco: typeof MonacoEditor
  let MonacoEnvironment: MonacoEditor.Environment
  interface Window {
    monaco: typeof MonacoEditor
    MonacoEditor: typeof MonacoEditor
  }
}
