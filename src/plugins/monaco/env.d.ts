import monaco from 'monaco-editor'

declare const monaco: typeof monaco
declare global {
  interface Window {
    monaco: typeof monaco
  }
}
declare const MonacoEnvironment: monaco.Environment
