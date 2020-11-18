/**
 * @name code-mirror 语法高亮编辑器
 * @author 机智的小鱼君
 */
!(async function () {
  const libs = {
    css: 'https://cdn.jsdelivr.net/npm/codemirror@5.58.2/mode/css/css.min.js',
    javascript:
      'https://cdn.jsdelivr.net/npm/codemirror@5.58.2/mode/javascript/javascript.min.js',
    lua: 'https://cdn.jsdelivr.net/npm/codemirror@5.58.2/mode/lua/lua.min.js',
    mediawiki:
      'https://cdn.jsdelivr.net/gh/wjghj-project/inpageedit-plugins@master/plugins/code-mirror/wikitext.min.js',
  }
  // Cache loaded libs
  var loadedLibs = {}

  mw.loader.load(
    'https://cdn.jsdelivr.net/npm/codemirror@5.58.2/lib/codemirror.min.css',
    'text/css'
  )
  mw.loader.load(
    'https://cdn.jsdelivr.net/npm/codemirror@5.58.2/theme/solarized.min.css',
    'text/css'
  )
  mw.loader.load(
    'https://cdn.jsdelivr.net/gh/wjghj-project/inpageedit-plugins@master/plugins/code-mirror/style.css',
    'text/css'
  )

  await $.ajax({
    url: 'https://cdn.jsdelivr.net/npm/codemirror@5.58.2/lib/codemirror.min.js',
    dataType: 'script',
    crossDomain: true,
    cache: true,
  })

  /**
   * 加载渲染器
   * @param {String} type
   */
  async function getLib(type) {
    // 已经加载过的渲染器
    if (loadedLibs[type] === true) {
      return true
    }
    // 加载渲染器
    if (libs[type] === undefined) return false
    await $.ajax({
      url: libs[type],
      dataType: 'script',
      crossDomain: true,
      cache: true,
    })
    loadedLibs[type] = true
    return true
  }

  /**
   * 检查页面语言类型
   * @param {String} page PageName
   */
  function checkType(page) {
    var moduleNS = mw.config.get('wgFormattedNamespaces')[828] || 'Module',
      isModule = new RegExp('^(' + moduleNS + ':|Module:).+?(?<!/doc)$', 'i')
    if (/\.css$/i.test(page)) return 'css'
    if (/\.js$/i.test(page) || /\.json$/i.test(page)) return 'javascript' // js 以及 json 均使用 javascript 渲染器
    if (isModule.test(page)) return 'lua' // 以 Module 名字空间开头，不以 /doc 结尾，判定为 Lua
    return 'mediawiki' // 否则返回 wikitext 格式
  }

  /**
   * 渲染编辑器
   * @param {Object} target 目标编辑框
   * @param {String} page 页面名
   */
  async function renderEditor(target, page) {
    target = $(target)

    // 防止抑郁
    var clearDiv = '<div style="clear: both"></div>'
    target.before(clearDiv)
    target.after(clearDiv)

    var mode = checkType(page)

    await getLib(mode)

    if (target.length) {
      var cm = CodeMirror.fromTextArea(target[0], {
        lineNumbers: true,
        lineWrapping: true,
        theme: 'inpageedit',
        mode,
      })
      cm.on('change', function () {
        target.trigger('input')
      })
      $.valHooks['textarea'] = {
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
    }
  }

  /**
   * 为 quickEdit 钩子添加函数
   */
  mw.hook('InPageEdit.quickEdit').add(({ $editArea, $modalTitle }) => {
    const page = $modalTitle.find('.editPage').text()
    renderEditor($editArea, page)
  })
})()
