/**
 * @name code-mirror 语法高亮编辑器
 * @author 机智的小鱼君 <https://github.com/Dragon-Fish>
 * @author Bhsd <https://github.com/bhsd-harry>
 */
;(async () => {
  const MODE_LIST = {
    css: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.1/mode/css/css.min.js',
    javascript:
      'https://cdn.jsdelivr.net/npm/codemirror@5.65.1/mode/javascript/javascript.min.js',
    lua: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.1/mode/lua/lua.min.js',
    mediawiki:
      'https://cdn.jsdelivr.net/gh/wikimedia/mediawiki-extensions-CodeMirror@REL1_37/resources/mode/mediawiki/mediawiki.min.js',
  }

  mw.loader.load(
    'https://cdn.jsdelivr.net/npm/codemirror@5.65.1/lib/codemirror.min.css',
    'text/css'
  )
  // mw.loader.load(
  //   'https://ipe-plugins.js.org/plugins/code-mirror/style.css',
  //   'text/css'
  // )

  function getScript(url) {
    return $.ajax({
      url,
      dataType: 'script',
      crossDomain: true,
      cache: true,
    })
  }

  // Load Code Mirror
  await getScript(
    'https://cdn.jsdelivr.net/npm/codemirror@5.65.1/lib/codemirror.min.js'
  )
  // Load addons
  await Promise.all([
    getScript(
      'https://cdn.jsdelivr.net/npm/codemirror@5.65.1/addon/selection/active-line.min.js'
    ),
  ])

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
    if (type === 'mediawiki') {
      mw.loader.load(
        'https://cdn.jsdelivr.net/gh/wikimedia/mediawiki-extensions-CodeMirror@REL1_37/resources/mode/mediawiki/mediawiki.min.css',
        'text/css'
      )
    }
    await getScript(MODE_LIST[type])
    LOADED_MODE[type] = true
    return true
  }

  /**
   * 加载codemirror的mediawiki模块需要的设置数据
   */
  const getMwConfig = (() => {
    /** @type {{ tagModes: { pre: string, nowiki:string }, tags: Record<string, boolean>, doubleUnderscore: Record<string, boolean>[], functionSynonyms: Record<string, boolean>[], urlProtocols: string }} */
    const config = {}
    const _already = false
    return async () => {
      if (_already) {
        return config
      }

      const {
        query: { magicwords, extensiontags },
      } = await new mw.Api().get({
        action: 'query',
        meta: 'siteinfo',
        siprop: 'magicwords|extensiontags',
        format: 'json',
        formatversion: 2,
      })
      const getAliases = words => words.map(({ aliases }) => aliases).flat(),
        getConfig = aliases =>
          Object.fromEntries(aliases.map(alias => [alias, true]))
      config.tagModes = {
        pre: 'mw-tag-pre',
        nowiki: 'mw-tag-nowiki',
      }
      config.tags = Object.fromEntries(
        extensiontags.map(tag => [tag.slice(1, -1), true])
      )
      const sensitive = getAliases(
          magicwords.filter(word => word['case-sensitive'])
        ),
        insensitive = getAliases(
          magicwords.filter(word => !word['case-sensitive'])
        )
      config.doubleUnderscore = [
        getConfig(insensitive.filter(alias => /^__.+__$/.test(alias))),
        getConfig(sensitive.filter(alias => /^__.+__$/.test(alias))),
      ]
      config.functionSynonyms = [
        getConfig(insensitive.filter(alias => !/^__.+__$/.test(alias))),
        getConfig(sensitive.filter(alias => !/^__.+__$/.test(alias))),
      ]
      config.urlProtocols = mw.config.get('wgUrlProtocols')
      _already = true
      mw.config.set('extCodeMirrorConfig', config)
      return config
    }
  })()

  /**
   * 检查页面语言类型
   * @param {string} page Page name
   */
  function getPageMode(page) {
    const NS_MODULE = mw.config.get('wgFormattedNamespaces')[828] || 'Module'
    if (page.endsWith('.css')) {
      return 'css'
    } else if (page.endsWith('.js') || page.endsWith('.json')) {
      return 'javascript'
    } else if (page.startsWith(`${NS_MODULE}:`) && !page.endsWith('/doc')) {
      return 'lua'
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

    const mode = getPageMode(page)
    const [mwConfig] = await Promise.all([getMwConfig(), initMode(mode)])

    if (target.length) {
      const cm = CodeMirror.fromTextArea(target[0], {
        lineNumbers: true,
        lineWrapping: true,
        styleActiveLine: true,
        // autoRefresh: true,
        theme: 'inpageedit light',
        mode,
        mwConfig,
      })
      cm.on('change', function () {
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
      var origTextSelection = $.fn.textSelection
      $.fn.textSelection = function (command, options) {
        if (cm.getTextArea() !== this[0]) {
          return origTextSelection.call(this, command, options)
        }
        var fn, retval

        fn = {
          /**
           * Get the contents of the textarea
           */
          getContents: function () {
            return cm.doc.getValue()
          },

          setContents: function (newContents) {
            cm.doc.setValue(newContents)
          },

          /**
           * Get the currently selected text in this textarea. Will focus the textarea
           * in some browsers (IE/Opera)
           */
          getSelection: function () {
            return cm.doc.getSelection()
          },

          /**
           * Inserts text at the beginning and end of a text selection, optionally
           * inserting text at the caret when selection is empty.
           */
          encapsulateSelection: function (options) {
            return this.each(function () {
              var insertText,
                selText,
                selectPeri = options.selectPeri,
                pre = options.pre,
                post = options.post,
                startCursor = cm.doc.getCursor(true),
                endCursor = cm.doc.getCursor(false)

              if (options.selectionStart !== undefined) {
                // fn[command].call( this, options );
                fn.setSelection({
                  start: options.selectionStart,
                  end: options.selectionEnd,
                }) // not tested
              }

              selText = cm.doc.getSelection()
              if (!selText) {
                selText = options.peri
              } else if (options.replace) {
                selectPeri = false
                selText = options.peri
              } else {
                selectPeri = false
                while (selText.charAt(selText.length - 1) === ' ') {
                  // Exclude ending space char
                  selText = selText.substring(0, selText.length - 1)
                  post += ' '
                }
                while (selText.charAt(0) === ' ') {
                  // Exclude prepending space char
                  selText = selText.substring(1, selText.length)
                  pre = ' ' + pre
                }
              }

              /**
               * Do the splitlines stuff.
               *
               * Wrap each line of the selected text with pre and post
               */
              function doSplitLines(selText, pre, post) {
                var i,
                  insertText = '',
                  selTextArr = selText.split('\n')

                for (i = 0; i < selTextArr.length; i++) {
                  insertText += pre + selTextArr[i] + post
                  if (i !== selTextArr.length - 1) {
                    insertText += '\n'
                  }
                }
                return insertText
              }

              if (options.splitlines) {
                selectPeri = false
                insertText = doSplitLines(selText, pre, post)
              } else {
                insertText = pre + selText + post
              }

              if (options.ownline) {
                if (startCursor.ch !== 0) {
                  insertText = '\n' + insertText
                  pre += '\n'
                }

                if (cm.doc.getLine(endCursor.line).length !== endCursor.ch) {
                  insertText += '\n'
                  post += '\n'
                }
              }

              cm.doc.replaceSelection(insertText)

              if (selectPeri) {
                cm.doc.setSelection(
                  cm.doc.posFromIndex(
                    cm.doc.indexFromPos(startCursor) + pre.length
                  ),
                  cm.doc.posFromIndex(
                    cm.doc.indexFromPos(startCursor) +
                      pre.length +
                      selText.length
                  )
                )
              }
            })
          },

          /**
           * Get the position (in resolution of bytes not necessarily characters)
           * in a textarea
           */
          getCaretPosition: function (options) {
            var caretPos = cm.doc.indexFromPos(cm.doc.getCursor(true)),
              endPos = cm.doc.indexFromPos(cm.doc.getCursor(false))
            if (options.startAndEnd) {
              return [caretPos, endPos]
            }
            return caretPos
          },

          setSelection: function (options) {
            return this.each(function () {
              cm.doc.setSelection(
                cm.doc.posFromIndex(options.start),
                cm.doc.posFromIndex(options.end)
              )
            })
          },

          /**
           * Scroll a textarea to the current cursor position. You can set the cursor
           * position with setSelection()
           */
          scrollToCaretPosition: function () {
            return this.each(function () {
              cm.scrollIntoView(null)
            })
          },
        }

        switch (command) {
          // case 'getContents': // no params
          // case 'setContents': // no params with defaults
          // case 'getSelection': // no params
          case 'encapsulateSelection':
            options = $.extend(
              {
                pre: '', // Text to insert before the cursor/selection
                peri: '', // Text to insert between pre and post and select afterwards
                post: '', // Text to insert after the cursor/selection
                ownline: false, // Put the inserted text on a line of its own
                replace: false, // If there is a selection, replace it with peri instead of leaving it alone
                selectPeri: true, // Select the peri text if it was inserted (but not if there was a selection and replace==false, or if splitlines==true)
                splitlines: false, // If multiple lines are selected, encapsulate each line individually
                selectionStart: undefined, // Position to start selection at
                selectionEnd: undefined, // Position to end selection at. Defaults to start
              },
              options
            )
            break
          case 'getCaretPosition':
            options = $.extend(
              {
                // Return [start, end] instead of just start
                startAndEnd: false,
              },
              options
            )
            // FIXME: We may not need character position-based functions if we insert markers in the right places
            break
          case 'setSelection':
            options = $.extend(
              {
                // Position to start selection at
                start: undefined,
                // Position to end selection at. Defaults to start
                end: undefined,
                // Element to start selection in (iframe only)
                startContainer: undefined,
                // Element to end selection in (iframe only). Defaults to startContainer
                endContainer: undefined,
              },
              options
            )

            if (options.end === undefined) {
              options.end = options.start
            }
            if (options.endContainer === undefined) {
              options.endContainer = options.startContainer
            }
            // FIXME: We may not need character position-based functions if we insert markers in the right places
            break
          case 'scrollToCaretPosition':
            options = $.extend(
              {
                force: false, // Force a scroll even if the caret position is already visible
              },
              options
            )
            break
        }

        retval = fn[command].call(this, options)

        return retval
      }
      return cm
    }
  }

  /**
   * 为 quickEdit 钩子添加函数
   */
  mw.hook('InPageEdit.quickEdit').add(({ $editArea, $modalTitle }) => {
    const page = $modalTitle.find('.editPage').text()
    const cm = renderEditor($editArea, page)
    mw.hook('InPageEdit.quickEdit.codemirror').fire({ $editArea, cm })
  })
})()
