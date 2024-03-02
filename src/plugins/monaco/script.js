/**
 * MediaWiki Gadget MonacoEditor
 * @author Dragon-Fish <dragon-fish@qq.com>
 * @license MIT
 */
mw.hook('InPageEdit.quickEdit').add(
  ({ $editArea, $modalContent, $modalTitle }) => {
    ;(async () => {
      await mw.loader.using(['mediawiki.Title', 'mediawiki.util'])

      /** @type {HTMLTextAreaElement} */
      const textarea = $editArea.get(0)
      const language = getLangFromContentModel(
        $modalTitle.find('.editPage').text()
      )
      if (!textarea || !language) {
        return console.warn(
          'Missing textarea or language not supported yet.',
          textarea,
          language
        )
      }

      const initialValue = textarea.value
      const MONACO_CDN_BASE =
        window.MONACO_CDN_BASE ||
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min'
      const MONACO_EXTRA_LIBS = [
        ...[window.MONACO_EXTRA_LIBS || []],
        [
          'https://cdn.jsdelivr.net/npm/@wikimedia/types-wikimedia@0.4.2/MediaWiki.d.ts',
          'MediaWiki.d.ts',
        ],
        [
          'https://cdn.jsdelivr.net/npm/@types/jquery/JQuery.d.ts',
          'jquery/JQuery.d.ts',
        ],
        [
          'https://cdn.jsdelivr.net/npm/@types/jquery/JQueryStatic.d.ts',
          'jquery/JQueryStatic.d.ts',
        ],
        ['declare const $: JQueryStatic', 'jquery/JQueryGlobal.d.ts'],
      ]

      window.MonacoEnvironment = {
        ...window.MonacoEnvironment,
        baseUrl: MONACO_CDN_BASE,
        getWorkerUrl(workerId, label) {
          let path = 'base/worker/workerMain.js'

          if (label === 'json') {
            path = 'language/json/jsonWorker.js'
          } else if (label === 'css' || label === 'scss' || label === 'less') {
            path = 'language/css/cssWorker.js'
          } else if (
            label === 'html' ||
            label === 'handlebars' ||
            label === 'razor'
          ) {
            path = 'language/html/htmlWorker.js'
          } else if (label === 'typescript' || label === 'javascript') {
            path = 'language/typescript/tsWorker.js'
          }

          return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
self.MonacoEnvironment = {
    baseUrl: '${MONACO_CDN_BASE}'
}
importScripts('${MONACO_CDN_BASE}/vs/${path}')
        `)}`
        },
      }

      await loadScript(`${MONACO_CDN_BASE}/vs/loader.js`)
      const require = window.require
      require.config({
        paths: {
          vs: `${MONACO_CDN_BASE}/vs`,
        },
      })
      require(['vs/editor/editor.main'], () => {
        /**
         * @type {import('monaco-editor')}
         */
        const monaco = window.monaco
        mw.hook('InPageEdit.monaco').fire(monaco)

        const container = document.createElement('div')
        container.classList.add('inpageedit-monaco')
        container.style.width = '100%'
        container.style.height = '70vh'
        $modalContent.after(container)
        $modalContent.hide()

        const model = monaco.editor.createModel(initialValue, language)
        const editor = monaco.editor.create(container, {
          model,
          automaticLayout: true,
          theme: 'vs-dark',
          tabSize: 2,
        })

        // Initialize content from textarea
        let contentInitialized = !!initialValue
        if (!contentInitialized) {
          editor.updateOptions({ readOnly: true })
          const waitUntil = Date.now() + 10 * 1000
          const timer = setInterval(() => {
            if (Date.now() > waitUntil || textarea.value.trim()) {
              clearInterval(timer)
              editor.updateOptions({ readOnly: false })
              model.setValue(textarea.value)
              contentInitialized = true
            }
          }, 50)
        }
        model.onDidChangeContent(() => {
          textarea.value = model.getValue()
        })

        mw.hook('InPageEdit.monaco.editor').fire({
          container,
          editor,
          model,
          addExtraLib,
          addExternalExtraLib,
        })

        if (language === 'javascript') {
          addBatchExtraLibs(monaco, model, MONACO_EXTRA_LIBS)
        }
      })

      async function loadScript(src = '') {
        return new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = src
          document.body.appendChild(s)
          s.addEventListener('load', resolve)
          s.addEventListener('error', reject)
        })
      }

      function getLangFromContentModel(given = '') {
        const title = new mw.Title(given)
        const nsNumber = title.getNamespaceId()
        const pageName = title.getMainText()
        const ext = title.getExtension()
        // const contentModel = mw.config.get('wgPageContentModel', '').toLowerCase()
        if (ext === 'js') {
          return 'javascript'
        } else if (ext === 'css') {
          return 'css'
        }
        // NS_MODULE
        else if (nsNumber === 828 && !pageName.endsWith('/doc')) {
          return 'lua'
        }
        // NS_WIDGET
        else if (nsNumber === 274) {
          return 'html'
        } else if (ext === 'json') {
          return 'json'
        }
        return null
      }

      /**
       * @param monaco
       * @param model
       * @param {string} libSource
       * @param {string?} fileName
       */
      function addExtraLib(monaco, model, libSource, fileName = '') {
        const URI_NS = 'ts:mw'
        fileName = fileName || `${crypto.randomUUID()}.d.ts`
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          libSource,
          `${URI_NS}/${fileName}`
        )
        model.updateOptions({
          uri: monaco.Uri.parse(`${URI_NS}/main.js`),
        })
      }
      /**
       * @param monaco
       * @param model
       * @param {string} libUrl
       * @param {string?} fileName
       */
      async function addExternalExtraLib(monaco, model, libUrl, fileName) {
        const libSource = await fetch(libUrl).then((i) => i.text())
        fileName = fileName || libSource.split('/').pop()?.split('?')[0]
        return addExtraLib(monaco, model, libSource, fileName)
      }
      /**
       * internal helper function
       * @param {(string | [string, string])[]} libs
       */
      async function addBatchExtraLibs(monaco, model, libs = []) {
        return Promise.all(
          libs.map((lib) => {
            if (typeof lib === 'string') {
              lib = [lib]
            }
            if (!Array.isArray(lib)) return Promise.resolve(null)
            if (typeof lib?.[0] !== 'string') return Promise.resolve(null)
            const helper = lib[0]?.startsWith('http')
              ? addExternalExtraLib
              : addExtraLib
            return helper(monaco, model, lib[0], lib[1])
          })
        )
      }
    })()
  }
)
