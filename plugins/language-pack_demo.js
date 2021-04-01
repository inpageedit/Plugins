/**
 * @name InPageEdit_plugin_demo
 * @description This is a language pack demo
 */
/** Let's define a custom language pack */
mw.hook('InPageEdit.init.before').add(() => {
  // Get InPageEdit data
  const ipe = window.InPageEdit || {}
  ipe.i18n = ipe.i18n || {}
  // Make language pack
  const langPack = {
    'zh-hans': {
      mypack_editCount: '你编辑了$1次',
    },
    en: {
      mypack_editCount: 'You have $1 {{PLURAL:$1|edit|edits}}',
    },
  }
  // Insert strings
  $.each(langPack, (lang, str) => {
    ipe.i18n[lang] = ipe.i18n[lang] || {}
    ipe.i18n[lang] = {
      ...ipe.i18n[lang],
      ...str,
    }
  })
})

// We can test it
mw.hook('InPageEdit').add(({ _msg }) => {
  console.log(_msg('mypack_editCount', 1), _msg('mypack_editCount', 10)) // => en: You have 1 edit, You have 10 edits
})
