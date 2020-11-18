/**
 * Wikitext(MediaWiki) mode
 *
 * @url https://zh.moegirl.org.cn/User:Nbdd0121/tools/wikihighlight.js
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
