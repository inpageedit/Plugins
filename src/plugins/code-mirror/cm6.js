/* eslint-env browser, jquery */
/* eslint indent: [2, 2], semi: [2, "never"], operator-linebreak: 2, strict: 0 */
/* global mw, InPageEdit, CodeMirror6 */
/**
 * @name code-mirror 语法高亮编辑器
 * @author Bhsd <https://github.com/bhsd-harry>
 * @author 机智的小鱼君 <https://github.com/Dragon-Fish>
 */
mw.hook('InPageEdit').add(() =>
  (async () => {
    // Constants
    const CM_CDN = 'https://testingcf.jsdelivr.net/npm/@bhsd/codemirror-mediawiki'
    const PLUGIN_CDN = (InPageEdit.endpoints || InPageEdit.api).pluginCDN

    mw.loader.load(`${PLUGIN_CDN}/plugins/code-mirror/style.css`, 'text/css')

    await Promise.all([
      mw.loader.using('mediawiki.Title'),
      window.CodeMirror6 || import(`${CM_CDN}/dist/mw.min.js`),
    ])

    /**
     * 检查页面语言类型
     * @param page Page title
     */
    function getPageMode(page) {
      const {namespace, title} = page
      const ext = page.getExtension()?.toLowerCase()
      const isSubject = namespace % 2 === 0
      if (ext === 'css' && isSubject) {
        return [2, 8, 2300].includes(namespace) ? 'css' : 'sanitized-css'
      } else if (ext === 'js' && isSubject) {
        return 'javascript'
      } else if (ext === 'json' && isSubject) {
        return 'json'
      } else if (namespace === 828 && !title.endsWith('/doc')) {
        return 'lua'
      } else if (namespace === 274 && !title.endsWith('/doc')) {
        return 'html'
      }
      return 'mediawiki'
    }

    /**
     * 渲染编辑器
     * @param {JQuery<HTMLTextAreaElement>} target 目标编辑框
     * @param page Page title
     */
    async function renderEditor(target, page) {
      if (target.length) {
        // 防止抑郁
        const clearDiv = '<div style="clear: both"></div>'
        target.before(clearDiv)
        target.after(clearDiv)

        const mode = getPageMode(page)

        const wikiEditor = InPageEdit.preference
          .get('plugins')
          .some(i => /wiki-editor/.test(i))

        if (wikiEditor) {
          await new Promise(resolve => {
            target.on('wikiEditor-toolbar-doneInitialSections', resolve)
          })
        }

        const cm = await CodeMirror6.fromTextArea(target[0], mode, page.namespace)
        if (mode === 'mediawiki') {
          const config = mw.config.get('extCodeMirrorConfig')
          if (config?.urlProtocols.includes('\\:')) {
            config.urlProtocols = config.urlProtocols.replace(/\\:/g, ':')
            cm.setLanguage('mediawiki', config)
          }
        }
      }
    }

    /**
     * 为 quickEdit 钩子添加函数
     */
    mw.hook('InPageEdit.quickEdit').add(({ $editArea, $modalTitle }) =>
      (async () => {
        const page = new mw.Title($modalTitle.find('.editPage').text())
        const cm = await renderEditor($editArea, page)
        mw.hook('InPageEdit.quickEdit.codemirror6').fire({ $editArea, cm })
      })(),
    )
  })(),
)
