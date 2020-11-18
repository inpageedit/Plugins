!(async function () {
  mw.loader.load(
    'https://cdn.jsdelivr.net/npm/codemirror@5.58.2/lib/codemirror.min.css',
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
   * Wikitext highlight for CodeMirror
   *
   * @original https://zh.moegirl.org.cn/User:Nbdd0121/tools/wikihighlight.js
   * @author nbdd0121 <https://github.com/nbdd0121>
   * @licence CC BY-NC-SA 3.0
   */

  CodeMirror.defineMode('mediawiki', function () {
    function arrayRemove(array, object) {
      var index = array.indexOf(object)
      if (index !== -1) array.splice(index, 1)
    }

    var module = {}
    var config = {
      protocols: [
        'bitcoin:',
        'ftp://',
        'ftps://',
        'geo:',
        'git://',
        'gopher://',
        'http://',
        'https://',
        'irc://',
        'ircs://',
        'magnet:',
        'mailto:',
        'mms://',
        'news:',
        'nntp://',
        'redis://',
        'sftp://',
        'sip:',
        'sips:',
        'sms:',
        'ssh://',
        'svn://',
        'tel:',
        'telnet://',
        'urn:',
        'worldwind://',
        'xmpp:',
        // Note '//'' should not be included here
      ],
      linktrail: false,
    }

    var EXT_LINK_ADDR = /(?:[0-9.]+|\[[0-9a-fA-F:.]+\]|[^\]\[<>"\s])/ // Match host name, include IPv4, IPv6 and Domain name
    var EXT_LINK_PROTOCOL_NOREL = new RegExp(config.protocols.join('|'))
    var EXT_LINK_PROTOCOL = new RegExp(config.protocols.join('|') + '|//')
    var EXT_LINK_URL = /(?:[0-9.]+|\[[0-9a-fA-F:.]+\]|[^\]\[<>"\s])[^\]\[<>"\s]*/

    var ALLOWED_TAGS = {
      bdi: true,
      ins: true,
      u: true,
      font: true,
      big: true,
      small: true,
      sub: true,
      sup: true,
      h1: true,
      h2: true,
      h3: true,
      h4: true,
      h5: true,
      h6: true,
      cite: true,
      code: true,
      strike: true,
      tt: true,
      var: true,
      div: true,
      center: true,
      blockquote: true,
      ol: true,
      ul: true,
      dl: true,
      table: true,
      caption: true,
      pre: true,
      ruby: true,
      rb: true,
      rp: true,
      rt: true,
      rtc: true,
      p: true,
      span: true,
      abbr: true,
      dfn: true,
      kbd: true,
      samp: true,
      data: true,
      time: true,
      mark: true,
      br: false,
      wbr: false,
      hr: false,
      li: true,
      dt: true,
      dd: true,
      td: true,
      th: true,
      tr: true,
      // These tags are added here but they are not html
      noinclude: true,
      includeonly: true,
      onlyinclude: true,
    }

    function generateStyleMixinTagHandler(style) {
      return {
        open: function (stream, state) {
          state.mixinStyle.push(style)
        },
        close: function (stream, state) {
          var index = state.mixinStyle.indexOf(style)
          if (index !== -1) state.mixinStyle.splice(index, 1)
        },
      }
    }

    ALLOWED_TAGS['s'] = ALLOWED_TAGS['strike'] = ALLOWED_TAGS[
      'del'
    ] = generateStyleMixinTagHandler('strikethrough') // Alias
    ALLOWED_TAGS['b'] = ALLOWED_TAGS['strong'] = generateStyleMixinTagHandler(
      'strong'
    ) // Alias
    ALLOWED_TAGS['i'] = ALLOWED_TAGS['em'] = generateStyleMixinTagHandler('em') // Alias

    ALLOWED_TAGS['nowiki'] = {
      open: function (stream, state) {
        state.unclosedTags.pop()
        state.handler = parseNowikiTag
      },
      canSelfClose: true,
      // close never reached
    }

    ALLOWED_TAGS['pre'] = {
      open: function (stream, state) {
        state.mixinStyle.push('mw-pre')
        state.unclosedTags.pop()
        state.handler = parsePreTag
      },
      canSelfClose: true,
      // close never reached
    }

    // Extension:Cite
    ALLOWED_TAGS['ref'] = true
    ALLOWED_TAGS['references'] = false

    // Other extensions
    ALLOWED_TAGS['categorytree'] = true
    ALLOWED_TAGS['charinsert'] = true
    ALLOWED_TAGS['choose'] = true
    ALLOWED_TAGS['dynamicpagelist'] = true
    ALLOWED_TAGS['flashmp3'] = true
    ALLOWED_TAGS['gallery'] = true
    ALLOWED_TAGS['imagemap'] = true
    ALLOWED_TAGS['indicator'] = true
    ALLOWED_TAGS['inputbox'] = true
    ALLOWED_TAGS['poem'] = true
    ALLOWED_TAGS['poll'] = true
    ALLOWED_TAGS['sm2'] = true

    // Utility
    function tagCanSelfClose(tagname) {
      var tag = ALLOWED_TAGS[tagname]
      if (tag === false) {
        return true
      }
      if (typeof tag !== 'object') {
        return false
      }
      if ('canSelfClose' in tag) {
        return tag.canSelfClose
      }
      return false
    }

    function makeStyle(style, state) {
      if (state.bold) {
        style += ' strong'
      }
      if (state.italic) {
        style += ' em'
      }
      style += ' ' + state.mixinStyle.join(' ')
      return style
    }

    function parseWikitext(stream, state) {
      var sol = stream.sol()

      var match = stream.match(EXT_LINK_PROTOCOL_NOREL)
      if (match) {
        if (stream.match(EXT_LINK_ADDR, false)) {
          // The URL must looks like a URL
          state.stack.push(state.handler)
          state.handler = parseFreeExternalLink
          return 'mw-extlink'
        } else {
          // Does not look like URL, backUp
          stream.backUp(match[0].length)
        }
      }

      stream.backUp(1)
      var sow = !/\w/.exec(stream.next())

      if (sow) {
        match = stream.match(/(?:ISBN|RFC|PMID)\s+/)
        if (match) {
          if (match[0].startsWith('ISBN')) {
            var match2 = stream.match(
              /(?:97[89][- ]?)?(?:[0-9][- ]?){9}[0-9Xx]\b/
            )
            if (match2) {
              return 'mw-isbn'
            }
          } else {
            var match2 = stream.match(/[0-9]+\b/)
            if (match2) {
              if (match[0].startsWith('RFC')) {
                return 'mw-rfc'
              } else {
                return 'mw-pmid'
              }
            }
          }
          stream.backUp(match[0].length)
        }
      }

      if (sol) {
        // Table
        if (stream.match(/\s*(:*)\s*(?=\{\|)/)) {
          state.stack.push(state.handler)
          state.handler = parseTableStart
          return 'mw-ident'
        }
        switch (stream.peek()) {
          case '-':
            if (stream.match(/-{4,}/)) {
              return 'mw-hr'
            }
            break
          case '#': // TODO #REDIRECT
          case '*':
          case ';':
          case ':':
            stream.match(/[*#;:]*/)
            return 'mw-ident'
          case ' ':
            stream.next()
            return 'line-cm-mw-pre'
          case '=':
            match = stream.match(/(={1,6})(?=.+?\1\s*$)/)
            if (match) {
              state.handler = makeParseSectionHeader(match[1].length)
              return 'mw-section line-cm-mw-section-' + match[1].length
            }
            break
        }
      }

      switch (stream.peek()) {
        case "'":
          if (stream.match(/'+(?=''''')/)) {
            // more than 5 apostrophes, only last five are considered
            return makeStyle('', state)
          }
          if (stream.match(/'(?='''(?!'))/)) {
            // 4 apostrophes, only last three are considered
            return makeStyle('', state)
          }
          if (stream.match("'''")) {
            if (!state.bold) {
              state.bold = true
              return 'mw-bold-start'
            } else {
              state.bold = false
              return 'mw-bold-end'
            }
          } else if (stream.match("''")) {
            if (!state.italic) {
              state.italic = true
              return 'mw-italic-start'
            } else {
              state.italic = false
              return 'mw-italic-end'
            }
          }
          // TODO Mismatch Recovery
          break
        case '~':
          var match = stream.match(/~{3,5}/)
          if (match) {
            return 'mw-signature'
          }
          break
        case '_':
          if (sow) {
            var match = stream.match(/\b__[A-Z_]+?__/)
            if (match) {
              return 'mw-magic-word'
            }
          }
          break
        case '{':
          if (stream.match('{{')) {
            state.stack.push(state.handler)
            state.handler = parseTemplateName
            return 'mw-template-start'
          }
          break
        case '[':
          if (stream.match('[[')) {
            if (!stream.match(/[^\|\[\]]+(?:\|.*?)?\]\]/, false)) {
              // Not a link
              return makeStyle('', state)
            }
            state.stack.push(state.handler)
            state.handler = parseLinkTarget
            return 'mw-link-start'
          } else {
            stream.next()
            var match = stream.match(EXT_LINK_PROTOCOL)
            if (match) {
              if (
                stream.match(EXT_LINK_ADDR, false) &&
                stream.match(/.+?]/, false)
              ) {
                // The URL must looks like a URL
                state.stack.push(state.handler)
                state.handler = parseExternalLink
                // Still have to back up the URL, rendered differently
                stream.backUp(match[0].length)
                return 'mw-extlink-start'
              } else {
                // Does not look like URL, backUp
                stream.backUp(match[0].length)
              }
            }
            // Bug reported by AnnAngela
            // [{{}} does not render correctly
            return makeStyle('', state)
          }
          break
        case '&':
          return parseEntityOnly(stream, state)
        case '<':
          if (stream.match('<!--')) {
            state.stack.push(state.handler)
            state.handler = parseComment
            return 'mw-comment'
          }
          stream.next() // eat <
          var closing = !!stream.eat('/')
          var tagname = stream.match(/\w+/)
          if (!tagname || !(tagname[0] in ALLOWED_TAGS)) {
            // The eaten ones are treated as plain text if this is not a tag or not allowed
            return makeStyle('', state)
          }
          tagname = tagname[0]
          var match = stream.match(/[^<]*?(\/)?>/, false)
          if (!match) {
            // No closing >, treat as text
            return makeStyle('', state)
          }
          var selfClose = false
          if (match[1]) {
            // Self-closing tag processing
            if (!closing && !tagCanSelfClose(tagname)) {
              // Not self-closing tag, treat as text
              return makeStyle('', state)
            }
            selfClose = true
          }

          if (closing) {
            var uc = state.unclosedTags.slice()
            while (uc.length) {
              if (uc.pop() === tagname) {
                break
              }
            }
            // If closing tag
            if (state.unclosedTags[uc.length] === tagname) {
              state.unclosedTags = uc
              if (stream.match(/[^<]*?>/)) {
                if (typeof ALLOWED_TAGS[tagname] === 'object')
                  ALLOWED_TAGS[tagname].close(stream, state)

                state.handler = state.stack.pop()
                return 'mw-tag-close'
              }
            }
            // Otherwise, treat as text
            return makeStyle('', state)
          } else {
            if (ALLOWED_TAGS[tagname] && !selfClose) {
              // If not self-closing
              state.unclosedTags.push(tagname)
            }
            state.stack.push(state.handler)
            state.handler = makeParseOpenTag(tagname, selfClose)
            return 'mw-tag-open'
          }
          break
      }

      stream.next()
      return makeStyle('', state)
    }

    function parseFreeExternalLink(stream, state) {
      var match = stream.match(EXT_LINK_URL)
      var text = match[0]

      // {{, ~~~, '' will start their effect, so detect and correct
      var match = /\{\{|~~~|''/.exec(text)
      if (match) {
        // Pushback the wrongly included part
        stream.backUp(text.length - match.index)
        text = text.substring(0, match.index)
      }

      // There are some symbols common in English, they are
      // not treated as part of URL if they are trailing.
      // If there is no left parenthesis,
      // we assume that right parenthese will then not be part of URL
      var regex = text.indexOf('(') !== -1 ? /[,;\\.:!?]+$/ : /[,;\\.:!?)]+$/
      var match = regex.exec(text)
      var detLength = match ? match[0].length : 0
      if (detLength !== 0) {
        stream.backUp(detLength)
      }

      state.handler = state.stack.pop()
      return 'mw-extlink'
    }

    function makeParseSectionHeader(count) {
      var regExp = new RegExp('={' + count + '}\\s*$')
      return function (stream, state) {
        if (stream.match(regExp)) {
          return 'mw-section'
        }
        return parseWikitext(stream, state)
      }
    }

    function parseComment(stream, state) {
      if (stream.match('-->')) {
        state.handler = state.stack.pop()
      } else {
        stream.next()
      }
      return 'mw-comment'
    }

    function parseTableStart(stream, state) {
      stream.match('{|')
      state.handler = state.stack.pop()
      return 'mw-table-start'
    }

    function makeParseOpenTag(tagname, selfClose) {
      return function (stream, state) {
        if (stream.match(/\/?>/)) {
          if (!selfClose) {
            state.handler = parseWikitext
            if (typeof ALLOWED_TAGS[tagname] === 'object') {
              ALLOWED_TAGS[tagname].open(stream, state)
            }
          } else {
            state.handler = state.stack.pop()
          }
          return 'mw-tag-open'
        } else {
          stream.next()
          return 'mw-tag-attr'
        }
      }
    }

    function parseEntityOnly(stream, state) {
      if (stream.next() === '&') {
        var success
        if (stream.eat('#')) {
          if (stream.eat('x')) {
            success = stream.eatWhile(/[a-fA-F\d]/)
          } else {
            success = stream.eatWhile(/[\d]/)
          }
        } else {
          success = stream.eatWhile(/[\w\.\-:]/)
        }
        if (success) {
          success = stream.eat(';')
        }
        if (success) {
          return makeStyle('mw-entity', state)
        }
      }
      return makeStyle('', state)
    }

    /* Internal link parsing */

    function parseLinkTarget(stream, state) {
      stream.match(/.+?(?=\||\]\])/)
      if (stream.peek() === '|') {
        state.handler = parseLinkPipe
      } else {
        state.handler = parseLinkEnd
      }
      return 'mw-link-target'
    }

    function parseLinkEnd(stream, state) {
      stream.match(']]')
      if (config.linktrail) {
        state.handler = parseLinkTrail
      } else {
        state.handler = state.stack.pop()
      }
      return 'mw-link-end'
    }

    function parseLinkTrail(stream, state) {
      stream.match(/\w*/)
      state.handler = state.stack.pop()
      return 'mw-link-trail'
    }

    function parseLinkPipe(stream, state) {
      stream.match('|')
      state.handler = parseLinkText
      return 'mw-link-pipe'
    }

    function parseLinkText(stream, state) {
      if (stream.match(']]', false)) {
        // Maybe just return directly?
        state.handler = parseLinkEnd
        return ''
      }
      var ret = parseWikitext(stream, state)
      return ret + ' mw-link-text'
    }

    // External link parsing
    function parseExternalLink(stream, state) {
      var match = stream.match(EXT_LINK_URL)
      var text = match[0]

      // {{, ~~~, '' will start their effect, so detect and correct
      var match = new RegExp("\\{\\{|~~~|''").exec(text)
      if (match) {
        // Pushback the wrongly included part
        stream.backUp(text.length - match.index)
        text = text.substring(0, match.index)
      }

      state.handler = parseExternalLinkText
      return 'mw-extlink-target'
    }

    function parseExternalLinkText(stream, state) {
      if (stream.eat(']')) {
        state.handler = state.stack.pop()
        return 'mw-extlink-end'
      }
      var ret = parseWikitext(stream, state)
      return ret + ' mw-link-text'
    }

    // Template

    function parseTemplateName(stream, state) {
      if (stream.eat('|')) {
        if (stream.match(/[^\|\{\}]*=/, false)) {
          state.handler = parseTemplateArgName
        } else {
          state.handler = parseTemplateArg
        }
        return 'mw-template-pipe'
      }
      if (stream.match('}}')) {
        state.handler = state.stack.pop()
        return 'mw-template-end'
      }
      stream.next()
      return 'mw-template-name'
    }

    function parseTemplateArg(stream, state) {
      if (stream.eat('|')) {
        if (stream.match(/[^\|\{\}]*=/, false)) {
          state.handler = parseTemplateArgName
        }
        return 'mw-template-pipe'
      }
      if (stream.match('}}')) {
        state.handler = state.stack.pop()
        return 'mw-template-end'
      }
      var ret = parseWikitext(stream, state)
      return ret + ' mw-template-arg'
    }

    function parseTemplateArgName(stream, state) {
      if (stream.eat('=')) {
        state.handler = parseTemplateArg
        return 'mw-template-assign'
      }
      // The below two cases are rare cases, where simple regex for detecting = fails
      if (stream.eat('|')) {
        if (!stream.match(/[^\|\{\}]*=/, false)) {
          state.handler = parseTemplateArg
        }
        return 'mw-template-pipe'
      }
      if (stream.match('}}')) {
        state.handler = state.stack.pop()
        return 'mw-template-end'
      }
      var ret = parseWikitext(stream, state)
      return ret + ' mw-template-argname'
    }

    // Tag handlers

    function parseNowikiTag(stream, state) {
      if (stream.match(/<\/nowiki\s*>/)) {
        state.handler = state.stack.pop()
        return 'mw-tag-close'
      }
      return parseEntityOnly(stream, state)
    }

    function parsePreTag(stream, state) {
      if (stream.match(/<\/pre\s*>/)) {
        state.handler = state.stack.pop()
        arrayRemove(state.mixinStyle, 'mw-pre')
        return 'mw-tag-close'
      }
      return parseEntityOnly(stream, state)
    }

    module.startState = function () {
      return {
        handler: parseWikitext,
        bold: false,
        italic: false,
        mixinStyle: [],
        unclosedTags: [],
        stack: [],
      }
    }

    module.copyState = function (state) {
      return {
        handler: state.handler,
        bold: state.bold,
        italic: state.italic,
        mixinStyle: state.mixinStyle.slice(),
        unclosedTags: state.unclosedTags.slice(),
        stack: state.stack.slice(),
      }
    }

    module.token = function (stream, state) {
      if (stream.sol()) {
        state.bold = false
        state.italic = false
      }
      try {
        return state.handler(stream, state)
      } catch (e) {
        stream.next()
        state.handler = parseWikitext
        console.error('Error in WikiHighlight', e.stack || e)
        return null
      }
    }

    return module
  })

  /**
   * render
   * @param {Object} target
   */
  function renderEditor(target) {
    target = $(target)
    var clearDiv = '<div style="clear: both"></div>'
    target.before(clearDiv)
    target.after(clearDiv)

    if (target.length) {
      var cm = CodeMirror.fromTextArea(target[0], {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'mediawiki',
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

  mw.hook('InPageEdit.quickEdit').add(({ $editArea }) => {
    renderEditor($editArea)
  })
})()
