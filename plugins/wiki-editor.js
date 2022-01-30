/**
 * @name IPE-WikiEditor
 * @author Dragon-Fish
 * @desc Make InPageEdit use native wikiEditor instead of custom-editTools
 */
mw.hook('InPageEdit.quickEdit').add(({ $editArea, $editTools }) =>
  // @TODO 老版本 MediaWiki 传入异步函数会出问题，所以只能传入一个自调用函数
  (async () => {
    if (mw.loader.getState('ext.wikiEditor') !== 'loaded' || !$.fn.wikiEditor) {
      await mw.loader.using('ext.wikiEditor')
    }

    // Hide original toolbar
    $editTools?.hide()

    // Set toolbars
    $editArea.wikiEditor('addModule', {
      toolbar: {
        // Main section
        main: {
          type: 'toolbar',
          groups: {
            format: {
              tools: {
                bold: {
                  labelMsg: 'wikieditor-toolbar-tool-bold',
                  type: 'button',
                  oouiIcon: 'bold',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: "'''",
                      periMsg: 'wikieditor-toolbar-tool-bold-example',
                      post: "'''",
                    },
                  },
                },
                italic: {
                  section: 'main',
                  group: 'format',
                  id: 'italic',
                  labelMsg: 'wikieditor-toolbar-tool-italic',
                  type: 'button',
                  oouiIcon: 'italic',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: "''",
                      periMsg: 'wikieditor-toolbar-tool-italic-example',
                      post: "''",
                    },
                  },
                },
                link: {
                  section: 'main',
                  group: 'format',
                  id: 'link',
                  labelMsg: 'wikieditor-toolbar-tool-link',
                  type: 'button',
                  oouiIcon: 'link',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '[[',
                      periMsg:
                        'wikieditor-toolbar-help-content-ilink-description',
                      post: ']]',
                    },
                  },
                },
                file: {
                  labelMsg: 'wikieditor-toolbar-tool-file',
                  type: 'button',
                  oouiIcon: 'image',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '[[File:',
                      periMsg: 'wikieditor-toolbar-tool-file-example',
                      post: '|thumb]]',
                    },
                  },
                },
                reference: {
                  labelMsg: 'wikieditor-toolbar-tool-reference',
                  filters: ['body.ns-subject'],
                  type: 'button',
                  oouiIcon: 'book',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '<ref>',
                      periMsg: 'wikieditor-toolbar-tool-reference-text',
                      post: '</ref>',
                    },
                  },
                },
              },
            },
          },
        },
        // Format section
        advanced: {
          labelMsg: 'wikieditor-toolbar-section-advanced',
          type: 'toolbar',
          groups: {
            heading: {
              tools: {
                heading: {
                  labelMsg: 'wikieditor-toolbar-tool-heading',
                  type: 'select',
                  list: {
                    'heading-2': {
                      labelMsg: 'wikieditor-toolbar-tool-heading-2',
                      action: {
                        type: 'encapsulate',
                        options: {
                          pre: '== ',
                          periMsg: 'wikieditor-toolbar-tool-heading-example',
                          post: ' ==',
                          regex: /^(\s*)(={1,6})(.*?)\2(\s*)$/,
                          regexReplace: '$1==$3==$4',
                          ownline: true,
                        },
                      },
                    },
                    'heading-3': {
                      labelMsg: 'wikieditor-toolbar-tool-heading-3',
                      action: {
                        type: 'encapsulate',
                        options: {
                          pre: '=== ',
                          periMsg: 'wikieditor-toolbar-tool-heading-example',
                          post: ' ===',
                          regex: /^(\s*)(={1,6})(.*?)\2(\s*)$/,
                          regexReplace: '$1===$3===$4',
                          ownline: true,
                        },
                      },
                    },
                    'heading-4': {
                      labelMsg: 'wikieditor-toolbar-tool-heading-4',
                      action: {
                        type: 'encapsulate',
                        options: {
                          pre: '==== ',
                          periMsg: 'wikieditor-toolbar-tool-heading-example',
                          post: ' ====',
                          regex: /^(\s*)(={1,6})(.*?)\2(\s*)$/,
                          regexReplace: '$1====$3====$4',
                          ownline: true,
                        },
                      },
                    },
                    'heading-5': {
                      labelMsg: 'wikieditor-toolbar-tool-heading-5',
                      action: {
                        type: 'encapsulate',
                        options: {
                          pre: '===== ',
                          periMsg: 'wikieditor-toolbar-tool-heading-example',
                          post: ' =====',
                          regex: /^(\s*)(={1,6})(.*?)\2(\s*)$/,
                          regexReplace: '$1=====$3=====$4',
                          ownline: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            format: {
              labelMsg: 'wikieditor-toolbar-group-format',
              tools: {
                ulist: {
                  labelMsg: 'wikieditor-toolbar-tool-ulist',
                  type: 'button',
                  oouiIcon: 'listBullet',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '* ',
                      periMsg: 'wikieditor-toolbar-tool-ulist-example',
                      post: '',
                      ownline: true,
                      splitlines: true,
                    },
                  },
                },
                olist: {
                  labelMsg: 'wikieditor-toolbar-tool-olist',
                  type: 'button',
                  oouiIcon: 'listNumbered',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '# ',
                      periMsg: 'wikieditor-toolbar-tool-olist-example',
                      post: '',
                      ownline: true,
                      splitlines: true,
                    },
                  },
                },
                nowiki: {
                  labelMsg: 'wikieditor-toolbar-tool-nowiki',
                  type: 'button',
                  oouiIcon: 'noWikiText',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '<nowiki>',
                      periMsg: 'wikieditor-toolbar-tool-nowiki-example',
                      post: '</nowiki>',
                    },
                  },
                },
                newline: {
                  labelMsg: 'wikieditor-toolbar-tool-newline',
                  type: 'button',
                  oouiIcon: 'newline',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '<br>\n',
                    },
                  },
                },
              },
            },
            size: {
              tools: {
                superscript: {
                  labelMsg: 'wikieditor-toolbar-tool-superscript',
                  type: 'button',
                  oouiIcon: 'superscript',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '<sup>',
                      periMsg: 'wikieditor-toolbar-tool-superscript-example',
                      post: '</sup>',
                    },
                  },
                },
                subscript: {
                  labelMsg: 'wikieditor-toolbar-tool-subscript',
                  type: 'button',
                  oouiIcon: 'subscript',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '<sub>',
                      periMsg: 'wikieditor-toolbar-tool-subscript-example',
                      post: '</sub>',
                    },
                  },
                },
              },
            },
            insert: {
              labelMsg: 'wikieditor-toolbar-group-insert',
              tools: {
                gallery: {
                  labelMsg: 'wikieditor-toolbar-tool-gallery',
                  type: 'button',
                  oouiIcon: 'imageGallery',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '<gallery>\n',
                      periMsg: [
                        'wikieditor-toolbar-tool-gallery-example',
                        'File:',
                      ],
                      post: '\n</gallery>',
                      ownline: true,
                    },
                  },
                },
                redirect: {
                  labelMsg: 'wikieditor-toolbar-tool-redirect',
                  type: 'button',
                  oouiIcon: 'articleRedirect',
                  action: {
                    type: 'encapsulate',
                    options: {
                      pre: '#REDIRECT [[',
                      periMsg: 'wikieditor-toolbar-tool-redirect-example',
                      post: ']]',
                      ownline: true,
                    },
                  },
                },
              },
            },
          },
        },
        // Help
        help: {
          labelMsg: 'wikieditor-toolbar-section-help',
          type: 'booklet',
          deferLoad: true,
          pages: {
            format: {
              labelMsg: 'wikieditor-toolbar-help-page-format',
              layout: 'table',
              headings: [
                { textMsg: 'wikieditor-toolbar-help-heading-description' },
                { textMsg: 'wikieditor-toolbar-help-heading-syntax' },
                { textMsg: 'wikieditor-toolbar-help-heading-result' },
              ],
              rows: [
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-italic-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-italic-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-italic-result',
                  },
                },
                {
                  description: {
                    htmlMsg: 'wikieditor-toolbar-help-content-bold-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-bold-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-bold-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-bolditalic-description',
                  },
                  syntax: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-bolditalic-syntax',
                  },
                  result: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-bolditalic-result',
                  },
                },
              ],
            },
            link: {
              labelMsg: 'wikieditor-toolbar-help-page-link',
              layout: 'table',
              headings: [
                { textMsg: 'wikieditor-toolbar-help-heading-description' },
                { textMsg: 'wikieditor-toolbar-help-heading-syntax' },
                { textMsg: 'wikieditor-toolbar-help-heading-result' },
              ],
              rows: [
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-ilink-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-ilink-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-ilink-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-xlink-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-xlink-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-xlink-result',
                  },
                },
              ],
            },
            heading: {
              labelMsg: 'wikieditor-toolbar-help-page-heading',
              layout: 'table',
              headings: [
                { textMsg: 'wikieditor-toolbar-help-heading-description' },
                { textMsg: 'wikieditor-toolbar-help-heading-syntax' },
                { textMsg: 'wikieditor-toolbar-help-heading-result' },
              ],
              rows: [
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-heading2-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading2-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading2-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-heading3-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading3-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading3-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-heading4-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading4-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading4-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-heading5-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading5-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-heading5-result',
                  },
                },
              ],
            },
            list: {
              labelMsg: 'wikieditor-toolbar-help-page-list',
              layout: 'table',
              headings: [
                { textMsg: 'wikieditor-toolbar-help-heading-description' },
                { textMsg: 'wikieditor-toolbar-help-heading-syntax' },
                { textMsg: 'wikieditor-toolbar-help-heading-result' },
              ],
              rows: [
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-ulist-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-ulist-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-ulist-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-olist-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-olist-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-olist-result',
                  },
                },
              ],
            },
            file: {
              labelMsg: 'wikieditor-toolbar-help-page-file',
              layout: 'table',
              headings: [
                { textMsg: 'wikieditor-toolbar-help-heading-description' },
                { textMsg: 'wikieditor-toolbar-help-heading-syntax' },
                { textMsg: 'wikieditor-toolbar-help-heading-result' },
              ],
              rows: [
                {
                  description: {
                    htmlMsg: 'wikieditor-toolbar-help-content-file-description',
                  },
                  syntax: {
                    htmlMsg: [
                      'wikieditor-toolbar-help-content-file-syntax',
                      'File',
                      'thump',
                      mw
                        .message('wikieditor-toolbar-help-content-file-caption')
                        .text(),
                    ],
                  },
                  result: {
                    html:
                      '<div class="thumbinner" style="width: 102px;">' +
                      '<a class="image">' +
                      '<img alt="" src="' +
                      $.wikiEditor.imgPath +
                      'toolbar/example-image.png" width="100" height="50" class="thumbimage"/>' +
                      '</a>' +
                      '<div class="thumbcaption"><div class="magnify">' +
                      '<a title="' +
                      mw.message('thumbnail-more').escaped() +
                      '" class="internal"></a>' +
                      '</div>' +
                      mw
                        .message('wikieditor-toolbar-help-content-file-caption')
                        .escaped() +
                      '</div>' +
                      '</div>',
                  },
                },
              ],
            },
            reference: {
              labelMsg: 'wikieditor-toolbar-help-page-reference',
              layout: 'table',
              headings: [
                { textMsg: 'wikieditor-toolbar-help-heading-description' },
                { textMsg: 'wikieditor-toolbar-help-heading-syntax' },
                { textMsg: 'wikieditor-toolbar-help-heading-result' },
              ],
              rows: [
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-reference-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-reference-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-reference-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-named-reference-description',
                  },
                  syntax: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-named-reference-syntax',
                  },
                  result: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-named-reference-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-rereference-description',
                  },
                  syntax: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-rereference-syntax',
                  },
                  result: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-rereference-result',
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-showreferences-description',
                  },
                  syntax: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-showreferences-syntax',
                  },
                  result: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-showreferences-result',
                  },
                },
              ],
            },
            discussion: {
              labelMsg: 'wikieditor-toolbar-help-page-discussion',
              layout: 'table',
              headings: [
                { textMsg: 'wikieditor-toolbar-help-heading-description' },
                { textMsg: 'wikieditor-toolbar-help-heading-syntax' },
                { textMsg: 'wikieditor-toolbar-help-heading-result' },
              ],
              rows: [
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-signaturetimestamp-description',
                  },
                  syntax: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-signaturetimestamp-syntax',
                  },
                  result: {
                    htmlMsg: [
                      'wikieditor-toolbar-help-content-signaturetimestamp-result',
                      mw.config.get('wgFormattedNamespaces')[2],
                      mw.config.get('wgFormattedNamespaces')[3],
                    ],
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-signature-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-signature-syntax',
                  },
                  result: {
                    htmlMsg: [
                      'wikieditor-toolbar-help-content-signature-result',
                      mw.config.get('wgFormattedNamespaces')[2],
                      mw.config.get('wgFormattedNamespaces')[3],
                    ],
                  },
                },
                {
                  description: {
                    htmlMsg:
                      'wikieditor-toolbar-help-content-indent-description',
                  },
                  syntax: {
                    htmlMsg: 'wikieditor-toolbar-help-content-indent-syntax',
                  },
                  result: {
                    htmlMsg: 'wikieditor-toolbar-help-content-indent-result',
                  },
                },
              ],
            },
          },
        },
      },
      dialogs: {
        titleMsg: 'wikieditor-toolbar-tool-replace-title',
        id: 'wikieditor-toolbar-replace-dialog',
        // htmlTemplate: 'dialogReplace.html',
        init: function () {
          $(this).html(`<div id="wikieditor-toolbar-replace-message">
          <div id="wikieditor-toolbar-replace-nomatch" rel="wikieditor-toolbar-tool-replace-nomatch"></div>
          <div id="wikieditor-toolbar-replace-success"></div>
          <div id="wikieditor-toolbar-replace-emptysearch" rel="wikieditor-toolbar-tool-replace-emptysearch"></div>
          <div id="wikieditor-toolbar-replace-invalidregex"></div>
        </div>
        <fieldset>
          <div class="wikieditor-toolbar-field-wrapper">
            <label for="wikieditor-toolbar-replace-search" rel="wikieditor-toolbar-tool-replace-search"></label>
            <input type="text" id="wikieditor-toolbar-replace-search"/>
          </div>
          <div class="wikieditor-toolbar-field-wrapper">
            <label for="wikieditor-toolbar-replace-replace" rel="wikieditor-toolbar-tool-replace-replace"></label>
            <input type="text" id="wikieditor-toolbar-replace-replace"/>
          </div>
          <div class="wikieditor-toolbar-field-wrapper">
            <input type="checkbox" id="wikieditor-toolbar-replace-case"/>
            <label for="wikieditor-toolbar-replace-case" rel="wikieditor-toolbar-tool-replace-case"></label>
          </div>
          <div class="wikieditor-toolbar-field-wrapper">
            <input type="checkbox" id="wikieditor-toolbar-replace-word"/>
            <label for="wikieditor-toolbar-replace-word" rel="wikieditor-toolbar-tool-replace-word"></label>
          </div>
          <div class="wikieditor-toolbar-field-wrapper">
            <input type="checkbox" id="wikieditor-toolbar-replace-regex"/>
            <label for="wikieditor-toolbar-replace-regex" rel="wikieditor-toolbar-tool-replace-regex"></label>
          </div>
        </fieldset>`)

          $(this)
            .find('[rel]')
            .each(function () {
              // eslint-disable-next-line mediawiki/msg-doc
              $(this).text(mw.msg($(this).attr('rel')))
            })

          // TODO: Find a cleaner way to share this function
          $(this).data('replaceCallback', function (mode) {
            var offset,
              textRemainder,
              regex,
              searchStr,
              replaceStr,
              flags,
              matchCase,
              matchWord,
              isRegex,
              $textarea,
              text,
              match,
              actualReplacement,
              start,
              end

            $(
              '#wikieditor-toolbar-replace-nomatch, #wikieditor-toolbar-replace-success, #wikieditor-toolbar-replace-emptysearch, #wikieditor-toolbar-replace-invalidregex'
            ).hide()

            // Search string cannot be empty
            searchStr = $('#wikieditor-toolbar-replace-search').val()
            if (searchStr === '') {
              $('#wikieditor-toolbar-replace-emptysearch').show()
              return
            }

            // Replace string can be empty
            replaceStr = $('#wikieditor-toolbar-replace-replace').val()

            // Prepare the regular expression flags
            flags = 'm'
            matchCase = $('#wikieditor-toolbar-replace-case').is(':checked')
            if (!matchCase) {
              flags += 'i'
            }
            isRegex = $('#wikieditor-toolbar-replace-regex').is(':checked')
            if (!isRegex) {
              searchStr = mw.util.escapeRegExp(searchStr)
            }
            matchWord = $('#wikieditor-toolbar-replace-word').is(':checked')
            if (matchWord) {
              searchStr = '\\b(?:' + searchStr + ')\\b'
            }
            if (mode === 'replaceAll') {
              flags += 'g'
            }

            try {
              regex = new RegExp(searchStr, flags)
            } catch (e) {
              $('#wikieditor-toolbar-replace-invalidregex')
                .text(
                  mw.msg(
                    'wikieditor-toolbar-tool-replace-invalidregex',
                    e.message
                  )
                )
                .show()
              return
            }

            $textarea = $(this).data('context').$textarea
            text = $textarea.textSelection('getContents')
            match = false
            if (mode !== 'replaceAll') {
              if (mode === 'replace') {
                offset = $(this).data('matchIndex')
              } else {
                offset = $(this).data('offset')
              }
              textRemainder = text.substr(offset)
              match = textRemainder.match(regex)
            }
            if (!match) {
              // Search hit BOTTOM, continuing at TOP
              // TODO: Add a "Wrap around" option.
              offset = 0
              textRemainder = text
              match = textRemainder.match(regex)
            }

            if (!match) {
              $('#wikieditor-toolbar-replace-nomatch').show()
            } else if (mode === 'replaceAll') {
              $textarea.textSelection(
                'setContents',
                text.replace(regex, replaceStr)
              )
              $('#wikieditor-toolbar-replace-success')
                .text(
                  mw.msg(
                    'wikieditor-toolbar-tool-replace-success',
                    mw.language.convertNumber(match.length)
                  )
                )
                .show()
              $(this).data('offset', 0)
            } else {
              if (mode === 'replace') {
                if (isRegex) {
                  // If backreferences (like $1) are used, the actual actual replacement string will be different
                  actualReplacement = match[0].replace(regex, replaceStr)
                } else {
                  actualReplacement = replaceStr
                }

                if (match) {
                  // Do the replacement
                  $textarea.textSelection('encapsulateSelection', {
                    peri: actualReplacement,
                    replace: true,
                    selectionStart: offset + match.index,
                    selectionEnd: offset + match.index + match[0].length,
                    selectPeri: true,
                  })
                  // Reload the text after replacement
                  text = $textarea.textSelection('getContents')
                }

                // Find the next instance
                offset = offset + match.index + actualReplacement.length
                textRemainder = text.substr(offset)
                match = textRemainder.match(regex)

                if (match) {
                  start = offset + match.index
                  end = start + match[0].length
                } else {
                  // If no new string was found, try searching from the beginning.
                  // TODO: Add a "Wrap around" option.
                  textRemainder = text
                  match = textRemainder.match(regex)
                  if (match) {
                    start = match.index
                    end = start + match[0].length
                  } else {
                    // Give up
                    start = 0
                    end = 0
                  }
                }
              } else {
                start = offset + match.index
                end = start + match[0].length
              }

              $(this).data('matchIndex', start)

              $textarea.textSelection('setSelection', {
                start: start,
                end: end,
              })
              $textarea.textSelection('scrollToCaretPosition')
              $(this).data('offset', end)
              $textarea[0].focus()
            }
          })
        },
      },
    })

    // Add dialog triggers
    $editArea.wikiEditor('addToToolbar', {
      section: 'advanced',
      groups: {
        search: {
          tools: {
            replace: {
              labelMsg: 'wikieditor-toolbar-tool-replace',
              type: 'button',
              oouiIcon: 'articleSearch',
              action: {
                type: 'dialog',
                module: 'search-and-replace',
              },
            },
          },
        },
      },
    })

    // Add dialog actions
    $editArea.wikiEditor('addModule', {
      dialogs: {
        'search-and-replace': {
          titleMsg: 'wikieditor-toolbar-tool-replace-title',
          id: 'wikieditor-toolbar-replace-dialog',
          htmlTemplate: 'dialogReplace.html',
          init: function () {
            $(this)
              .find('[rel]')
              .each(function () {
                // eslint-disable-next-line mediawiki/msg-doc
                $(this).text(mw.msg($(this).attr('rel')))
              })

            // TODO: Find a cleaner way to share this function
            $(this).data('replaceCallback', function (mode) {
              var offset,
                textRemainder,
                regex,
                searchStr,
                replaceStr,
                flags,
                matchCase,
                matchWord,
                isRegex,
                $textarea,
                text,
                match,
                actualReplacement,
                start,
                end

              $(
                '#wikieditor-toolbar-replace-nomatch, #wikieditor-toolbar-replace-success, #wikieditor-toolbar-replace-emptysearch, #wikieditor-toolbar-replace-invalidregex'
              ).hide()

              // Search string cannot be empty
              searchStr = $('#wikieditor-toolbar-replace-search').val()
              if (searchStr === '') {
                $('#wikieditor-toolbar-replace-emptysearch').show()
                return
              }

              // Replace string can be empty
              replaceStr = $('#wikieditor-toolbar-replace-replace').val()

              // Prepare the regular expression flags
              flags = 'm'
              matchCase = $('#wikieditor-toolbar-replace-case').is(':checked')
              if (!matchCase) {
                flags += 'i'
              }
              isRegex = $('#wikieditor-toolbar-replace-regex').is(':checked')
              if (!isRegex) {
                searchStr = mw.util.escapeRegExp(searchStr)
              }
              matchWord = $('#wikieditor-toolbar-replace-word').is(':checked')
              if (matchWord) {
                searchStr = '\\b(?:' + searchStr + ')\\b'
              }
              if (mode === 'replaceAll') {
                flags += 'g'
              }

              try {
                regex = new RegExp(searchStr, flags)
              } catch (e) {
                $('#wikieditor-toolbar-replace-invalidregex')
                  .text(
                    mw.msg(
                      'wikieditor-toolbar-tool-replace-invalidregex',
                      e.message
                    )
                  )
                  .show()
                return
              }

              $textarea = $(this).data('context').$textarea
              text = $textarea.textSelection('getContents')
              match = false
              if (mode !== 'replaceAll') {
                if (mode === 'replace') {
                  offset = $(this).data('matchIndex')
                } else {
                  offset = $(this).data('offset')
                }
                textRemainder = text.substr(offset)
                match = textRemainder.match(regex)
              }
              if (!match) {
                // Search hit BOTTOM, continuing at TOP
                // TODO: Add a "Wrap around" option.
                offset = 0
                textRemainder = text
                match = textRemainder.match(regex)
              }

              if (!match) {
                $('#wikieditor-toolbar-replace-nomatch').show()
              } else if (mode === 'replaceAll') {
                $textarea.textSelection(
                  'setContents',
                  text.replace(regex, replaceStr)
                )
                $('#wikieditor-toolbar-replace-success')
                  .text(
                    mw.msg(
                      'wikieditor-toolbar-tool-replace-success',
                      mw.language.convertNumber(match.length)
                    )
                  )
                  .show()
                $(this).data('offset', 0)
              } else {
                if (mode === 'replace') {
                  if (isRegex) {
                    // If backreferences (like $1) are used, the actual actual replacement string will be different
                    actualReplacement = match[0].replace(regex, replaceStr)
                  } else {
                    actualReplacement = replaceStr
                  }

                  if (match) {
                    // Do the replacement
                    $textarea.textSelection('encapsulateSelection', {
                      peri: actualReplacement,
                      replace: true,
                      selectionStart: offset + match.index,
                      selectionEnd: offset + match.index + match[0].length,
                      selectPeri: true,
                    })
                    // Reload the text after replacement
                    text = $textarea.textSelection('getContents')
                  }

                  // Find the next instance
                  offset = offset + match.index + actualReplacement.length
                  textRemainder = text.substr(offset)
                  match = textRemainder.match(regex)

                  if (match) {
                    start = offset + match.index
                    end = start + match[0].length
                  } else {
                    // If no new string was found, try searching from the beginning.
                    // TODO: Add a "Wrap around" option.
                    textRemainder = text
                    match = textRemainder.match(regex)
                    if (match) {
                      start = match.index
                      end = start + match[0].length
                    } else {
                      // Give up
                      start = 0
                      end = 0
                    }
                  }
                } else {
                  start = offset + match.index
                  end = start + match[0].length
                }

                $(this).data('matchIndex', start)

                $textarea.textSelection('setSelection', {
                  start: start,
                  end: end,
                })
                $textarea.textSelection('scrollToCaretPosition')
                $(this).data('offset', end)
                $textarea[0].focus()
              }
            })
          },
          dialog: {
            width: 500,
            dialogClass: 'wikiEditor-toolbar-dialog',
            modal: false,
            buttons: {
              'wikieditor-toolbar-tool-replace-button-findnext': function (e) {
                $(this).closest('.ui-dialog').data('dialogaction', e.target)
                $(this).data('replaceCallback').call(this, 'find')
              },
              'wikieditor-toolbar-tool-replace-button-replace': function (e) {
                $(this).closest('.ui-dialog').data('dialogaction', e.target)
                $(this).data('replaceCallback').call(this, 'replace')
              },
              'wikieditor-toolbar-tool-replace-button-replaceall': function (
                e
              ) {
                $(this).closest('.ui-dialog').data('dialogaction', e.target)
                $(this).data('replaceCallback').call(this, 'replaceAll')
              },
              'wikieditor-toolbar-tool-replace-close': function () {
                $(this).dialog('close')
              },
            },
            open: function () {
              var $dialog,
                context,
                $textbox,
                that = this
              $(this).data('offset', 0)
              $(this).data('matchIndex', 0)

              $('#wikieditor-toolbar-replace-search').trigger('focus')
              $(
                '#wikieditor-toolbar-replace-nomatch, #wikieditor-toolbar-replace-success, #wikieditor-toolbar-replace-emptysearch, #wikieditor-toolbar-replace-invalidregex'
              ).hide()
              if (!$(this).data('onetimeonlystuff')) {
                $(this).data('onetimeonlystuff', true)
                // Execute the action associated with the first button
                // when the user presses Enter
                $(this)
                  .closest('.ui-dialog')
                  .on('keypress', function (e) {
                    var $button
                    if ((e.keyCode || e.which) === 13) {
                      $button =
                        $(this).data('dialogaction') ||
                        $(this).find('button').first()
                      $button.trigger('click')
                      e.preventDefault()
                    }
                  })
                // Make tabbing to a button and pressing
                // Enter do what people expect
                $(this)
                  .closest('.ui-dialog')
                  .find('button')
                  .on('focus', function () {
                    $(this).closest('.ui-dialog').data('dialogaction', this)
                  })
              }
              $dialog = $(this).closest('.ui-dialog')
              that = this
              context = $(this).data('context')
              $textbox = context.$textarea

              $textbox.on('keypress.srdialog', function (e) {
                var $button
                if (e.which === 13) {
                  // Enter
                  $button =
                    $dialog.data('dialogaction') ||
                    $dialog.find('button').first()
                  $button.trigger('click')
                  e.preventDefault()
                } else if (e.which === 27) {
                  // Escape
                  $(that).dialog('close')
                }
              })
            },
            close: function () {
              var context = $(this).data('context'),
                $textbox = context.$textarea
              $textbox.off('keypress.srdialog')
              $(this).closest('.ui-dialog').data('dialogaction', false)
            },
          },
        },
      },
    })
  })()
)

// @TODO 一个兼容问题，必须保证 wikiEditor 在 CodeMirror 之前加载
mw.hook('InPageEdit').add(({ InPageEdit }) => {
  if (InPageEdit.preference.get('plugins').find(i => /code-mirror/i.test(i))) {
    mw.loader.using('ext.wikiEditor')
  }
})
