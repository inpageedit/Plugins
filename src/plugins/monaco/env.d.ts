import monaco from 'monaco-editor'

// declare const monaco: typeof monaco

declare global {
  const monaco: typeof monaco
  const MonacoEnvironment: monaco.Environment
}
