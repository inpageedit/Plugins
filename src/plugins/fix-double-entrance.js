/**
 * @name fix-double-entrance
 * @desc Fix https://github.com/inpageedit/inpageedit-v2/issues/146
 */
mw.hook('InPageEdit').add(() => {
  $('.mw-editsection').each((_, item) => {
    $(item)
      .find('.in-page-edit-article-link-group')
      .each((index, item) => {
        if (index > 0) $(item).hide()
      })
  })
})
