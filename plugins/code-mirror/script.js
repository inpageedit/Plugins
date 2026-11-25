/**
 * @name code-mirror 语法高亮编辑器
 * @author 机智的小鱼君 <https://github.com/Dragon-Fish>
 * @author Bhsd <https://github.com/bhsd-harry>
 */
mw.hook('InPageEdit').add(({ InPageEdit }) =>
  (async () => {
    // Constants
    const CM_CDN = 'https://fastly.jsdelivr.net/npm/codemirror@5.65.1'
    const WMGH_CDN =
      'https://fastly.jsdelivr.net/gh/wikimedia/mediawiki-extensions-CodeMirror@REL1_37'
    const PLUGIN_CDN = (InPageEdit.endpoints || InPageEdit.api).pluginCDN
    const USING_LOCAL = mw.loader.getState('ext.CodeMirror') !== null
    const THEME =
      InPageEdit.preference.get('codeMirrorTheme') || 'solarized light'
    const conf = mw.config.get()

    // Local settings cache
    const ALL_SETTINGS_CACHE = JSON.parse(
      localStorage.getItem('InPageEditMwConfig') || '{}'
    )
    const SITE_ID = `${conf.wgServerName}${conf.wgScriptPath}`
    const SITE_SETTINGS = ALL_SETTINGS_CACHE[SITE_ID]

    const MODE_LIST = USING_LOCAL
      ? {
          css: ['ext.CodeMirror.lib.mode.css'],
          javascript: ['ext.CodeMirror.lib.mode.javascript'],
          lua: `${CM_CDN}/mode/lua/lua.min.js`,
          mediawiki: ['ext.CodeMirror.mode.mediawiki', 'ext.CodeMirror.data'],
          widget: [
            'ext.CodeMirror.lib.mode.htmlmixed',
            'ext.CodeMirror.mode.mediawiki',
            'ext.CodeMirror.data',
          ],
        }
      : {
          css: `${CM_CDN}/mode/css/css.min.js`,
          javascript: `${CM_CDN}/mode/javascript/javascript.min.js`,
          lua: `${CM_CDN}/mode/lua/lua.min.js`,
          mediawiki: `${WMGH_CDN}/resources/mode/mediawiki/mediawiki.min.js`,
          htmlmixed: `${CM_CDN}/mode/htmlmixed/htmlmixed.min.js`,
          xml: `${CM_CDN}/mode/xml/xml.min.js`,
          widget: [],
        }

    if (!USING_LOCAL) {
      mw.loader.load(`${CM_CDN}/lib/codemirror.min.css`, 'text/css')
    }
    mw.loader.load(`${PLUGIN_CDN}/plugins/code-mirror/style.css`, 'text/css')
    if (!InPageEdit.preference.get('codeMirrorThemeNoCSS')) {
      mw.loader.load(`${CM_CDN}/theme/${THEME.split(' ')[0]}.min.css`, 'text/css')
    }

    function getScript(url) {
      return typeof url === 'string'
        ? $.ajax({
            url,
            dataType: 'script',
            crossDomain: true,
            cache: true,
          })
        : mw.loader.using(url.flat())
    }

    // Load Code Mirror
    USING_LOCAL
      ? await mw.loader.using('ext.CodeMirror.lib')
      : await getScript(`${CM_CDN}/lib/codemirror.min.js`)
    // Load addons
    const ADDON_LIST = [
      'selection/active-line.min.js',
      'dialog/dialog.js',
      'search/searchcursor.js',
      'search/search.js',
    ]
    await Promise.all(ADDON_LIST.map((i) => getScript(`${CM_CDN}/addon/${i}`)))

    /** @type {Record<string, boolean>} */
    const LOADED_MODE = {}
    /**
     * 加载渲染器
     * @param {String} type
     */
    async function initMode(type) {
      // 已经加载过的渲染器
      if (LOADED_MODE[type] === true) {
        return true
      }
      // 加载渲染器
      if (MODE_LIST[type] === undefined) return false
      if (type === 'widget') {
        if (USING_LOCAL) {
          await getScript(MODE_LIST[type])
          LOADED_MODE.css = true
          LOADED_MODE.javascript = true
          LOADED_MODE.mediawiki = true
        } else {
          await Promise.all(
            ['css', 'javascript', 'mediawiki', 'htmlmixed', 'xml'].map(initMode)
          )
        }
        CodeMirror.defineMIME('widget', {
          name: 'htmlmixed',
          tags: {
            noinclude: [[null, null, 'mediawiki']],
          },
        })
      } else {
        if (type === 'mediawiki' && !USING_LOCAL) {
          mw.loader.load(
            `${WMGH_CDN}/resources/mode/mediawiki/mediawiki.min.css`,
            'text/css'
          )
        }
        await getScript(MODE_LIST[type])
      }
      LOADED_MODE[type] = true
      return true
    }

    /**
     * 加载codemirror的mediawiki模块需要的设置数据
     */
    const getMwConfig = async (type) => {
      if (!['mediawiki', 'widget'].includes(type)) {
        return
      }
      /** @type {{ tagModes: { pre: string, nowiki:string }, tags: Record<string, boolean>, doubleUnderscore: Record<string, boolean>[], functionSynonyms: Record<string, boolean>[], urlProtocols: string }} */
      let config = mw.config.get('extCodeMirrorConfig')
      if (config) {
        return config
      }
      if (SITE_SETTINGS?.time > Date.now() - 86400 * 1000 * 3) {
        config = SITE_SETTINGS.config
        mw.config.set('extCodeMirrorConfig', config)
        return config
      }
      config = {}

      const {
        query: { magicwords, extensiontags, functionhooks, variables },
      } = await new mw.Api().get({
        action: 'query',
        meta: 'siteinfo',
        siprop: 'magicwords|extensiontags|functionhooks|variables',
        format: 'json',
        formatversion: 2,
      })
      const getAliases = (words) => words.flatMap(({ aliases }) => aliases),
        getConfig = (aliases) =>
          Object.fromEntries(
            aliases.map((alias) => [alias.replace(/:$/, ''), true])
          )
      config.tagModes = {
        pre: 'mw-tag-pre',
        nowiki: 'mw-tag-nowiki',
      }
      config.tags = Object.fromEntries(
        extensiontags.map((tag) => [tag.slice(1, -1), true])
      )
      const realMagicwords = new Set([...functionhooks, ...variables]),
        allMagicwords = magicwords.filter(
          ({ name, aliases }) =>
            aliases.some((alias) => /^__.+__$/.test(alias)) ||
            realMagicwords.has(name)
        ),
        sensitive = getAliases(
          allMagicwords.filter((word) => word['case-sensitive'])
        ),
        insensitive = [
          ...getAliases(
            allMagicwords.filter((word) => !word['case-sensitive'])
          ).map((alias) => alias.toLowerCase()),
          'msg',
          'raw',
          'msgnw',
          'subst',
          'safesubst',
        ]
      config.doubleUnderscore = [
        getConfig(insensitive.filter((alias) => /^__.+__$/.test(alias))),
        getConfig(sensitive.filter((alias) => /^__.+__$/.test(alias))),
      ]
      config.functionSynonyms = [
        getConfig(insensitive.filter((alias) => !/^__.+__|^#$/.test(alias))),
        getConfig(sensitive.filter((alias) => !/^__.+__|^#$/.test(alias))),
      ]
      config.urlProtocols = conf.wgUrlProtocols
      mw.config.set('extCodeMirrorConfig', config)
      ALL_SETTINGS_CACHE[SITE_ID] = {
        config,
        time: Date.now(),
      }
      localStorage.setItem(
        'InPageEditMwConfig',
        JSON.stringify(ALL_SETTINGS_CACHE)
      )
      return config
    }

    /**
     * 检查页面语言类型
     * @param {string} page Page name
     */
    function getPageMode(page) {
      const escapeRegExp = mw.util.escapeRegExp || mw.RegExp.escape
      const NS_MODULE = conf.wgFormattedNamespaces[828] || 'Module'
      const NS_WIDGET = conf.wgFormattedNamespaces[214] || 'Widget'
      const NS_ANYSUBJECT = new RegExp(
        `^(?:${Object.entries(conf.wgFormattedNamespaces)
          .filter(([ns]) => ns % 2 === 0)
          .map(([, text]) => escapeRegExp(text))
          .join('|')}):`
      )
      if (page.endsWith('.css') && NS_ANYSUBJECT.test(page)) {
        return 'css'
      } else if (
        (page.endsWith('.js') || page.endsWith('.json')) &&
        NS_ANYSUBJECT.test(page)
      ) {
        return 'javascript'
      } else if (page.startsWith(`${NS_MODULE}:`) && !page.endsWith('/doc')) {
        return 'lua'
      } else if (page.startsWith(`${NS_WIDGET}:`) && !page.endsWith('/doc')) {
        return 'widget'
      } else {
        return 'mediawiki'
      }
    }

    /**
     * 渲染编辑器
     * @param {JQuery<HTMLTextAreaElement>} target 目标编辑框
     * @param {string} page 页面名
     */
    async function renderEditor(target, page) {
      // 防止抑郁
      const clearDiv = '<div style="clear: both"></div>'
      target.before(clearDiv)
      target.after(clearDiv)

      let mode = getPageMode(page)
      const [mwConfig] = await Promise.all([getMwConfig(mode), initMode(mode)])

      if (target.length) {
        const cm = CodeMirror.fromTextArea(target[0], {
          lineNumbers: true,
          lineWrapping: true,
          styleActiveLine: true,
          extraKeys: { 'Alt-F': 'findPersistent' },
          theme: THEME,
          mode,
          mwConfig,
        })
        cm.refresh()
        cm.on('change', function (_, { origin }) {
          if (origin == 'setValue') {
            return
          }
          target.trigger('input')
          target.trigger('change')
        })
        $.valHooks.textarea = {
          get: function (elem) {
            if (elem === target[0]) return cm.getValue()
            else return elem.value
          },
          set: function (elem, value) {
            if (elem === target[0]) cm.setValue(value)
            else elem.value = value
          },
        }
        /**
         * jQuery.textSelection overrides for CodeMirror.
         * See jQuery.textSelection.js for method documentation
         */
        if (mw.loader.getState('jquery.textSelection') !== 'ready') {
          return cm
        }
        const cmTextSelection = {
          getContents() {
            return cm.getValue()
          },
          setContents(content) {
            cm.setValue(content)
            return this
          },
          getSelection() {
            return cm.getSelection()
          },
          setSelection(options) {
            cm.setSelection(
              cm.posFromIndex(options.start),
              cm.posFromIndex(options.end)
            )
            cm.focus()
            return this
          },
          replaceSelection(value) {
            cm.replaceSelection(value)
            return this
          },
          getCaretPosition(options) {
            const caretPos = cm.indexFromPos(cm.getCursor(true)),
              endPos = cm.indexFromPos(cm.getCursor(false))
            if (options.startAndEnd) {
              return [caretPos, endPos]
            }
            return caretPos
          },
          scrollToCaretPosition() {
            cm.scrollIntoView(null)
            return this
          },
        }
        target.textSelection('register', cmTextSelection)
        return cm
      }
    }

    /**
     * 为 quickEdit 钩子添加函数
     */
    mw.hook('InPageEdit.quickEdit').add(({ $editArea, $modalTitle }) =>
      (async () => {
        const page = $modalTitle.find('.editPage').text()
        const cm = await renderEditor($editArea, page)
        mw.hook('InPageEdit.quickEdit.codemirror').fire({ $editArea, cm })
      })()
    )
  })()
)
