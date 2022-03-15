/**
 * @name IPE-WikiEditor
 * @author Dragon-Fish
 * @desc Make InPageEdit use native wikiEditor
 */
mw.hook('InPageEdit.quickEdit').add(({ $editArea, $modalContent }) => {
  const { dialogs } = $.wikiEditor.modules,
    { api } = dialogs,
    { openDialog } = api
  if (openDialog.name !== 'ipeOpenDialog') {
    // eslint-disable-next-line func-names
    api.openDialog = function ipeOpenDialog(context, mod) {
      openDialog(context, mod)
      if (mod in dialogs.modules) {
        const { id } = dialogs.modules[mod]
        $(document.getElementById(id)).data('context', context)
      }
    }
  }
  if (typeof mw.addWikiEditor === 'function') {
    mw.addWikiEditor($editArea)
  } else {
    $editArea.wikiEditor('addModule', {
      ...$.wikiEditor.modules.toolbar.config.getDefaultConfig(),
      ...dialogs.config.getDefaultConfig(),
    })
    dialogs.config.replaceIcons($editArea)
  }
  $modalContent.find('#wikiEditor-ui-toolbar .tab > .current').click()
})

// @TODO 必须保证 wikiEditor 提前加载
mw.hook('InPageEdit').add(() => {
  mw.loader.load('ext.wikiEditor')
})
