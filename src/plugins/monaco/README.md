# InPageEdit Monaco Editor

This plugin adds a Monaco Editor to the InPageEdit.

## Supported content models

- Wikitext
- CSS
- JavaScript
- JSON
- Lua
- Widgets

## Compatibility

Don't use this plugin with the `CodeMirror` extension, as it may cause conflicts.

## Hooks

### `InPageEdit.monaco`

This hook is called just after the global `monaco` object is loaded.

```ts
interface HookInPageEditMonaco {
  (monaco: typeof import('monaco-editor')): void
}
```

### `InPageEdit.monaco.editor`

This hook is called just after an monaco editor instance is mounted.

```ts
interface HookInPageEditMonacoEditor {
  (payload: {
    container: HTMLElement
    editor: import('monaco-editor').editor.IStandaloneCodeEditor
    model: import('monaco-editor').editor.ITextModel
    // Utility functions, see below
    addExtraLib: (
      monaco: any,
      model: any,
      libSource: string,
      fileName?: string | null
    ) => void
    addExternalExtraLib: (
      monaco: any,
      model: any,
      libUrl: string,
      fileName: string | null
    ) => Promise<void>
  }): void
}
```

## Add extra libraries

You can add extra libraries to the monaco editor using the `addExtraLib` and `addExternalExtraLib` utility functions.

**Example:**

```ts
mw.hook('InPageEdit.monaco.editor').add(
  /**
   * @param {{ monaco: monaco; editor: monaco.editor.IStandaloneCodeEditor; model: monaco.editor.ITextModel; addExtraLib: (content: string, filePath?: string) => void; addExternalExtraLib: (url: string, filePath?: string) => void; }} ctx
   */
  function (ctx) {
    // 添加 d.ts 源文件
    ctx.addExtraLib('declare const foo: "bar"', 'MyLib.d.ts')
    // 语法糖：从 url 加载 d.ts
    ctx.addExternalExtraLib('https://unpkg.com/@types/jquery/JQuery.d.ts')
  }
)
```

**Predefined libraries:**

- [`@wikimedia/types-wikimedia`](https://cdn.jsdelivr.net/npm/@wikimedia/types-wikimedia@0.4.2/MediaWiki.d.ts)
- [`JQuery`](https://cdn.jsdelivr.net/npm/@types/jquery/JQuery.d.ts)
- [`JQueryStatic`](https://cdn.jsdelivr.net/npm/@types/jquery/JQueryStatic.d.ts)
