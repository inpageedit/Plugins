/**
 * @name IPE-WikiEditor
 * @author Dragon-Fish
 * @desc Make InPageEdit use native wikiEditor instead of custom-editTools
 */
mw.hook('InPageEdit.quickEdit').add(({ $editArea, $modalContent }) =>
  // @TODO 老版本 MediaWiki 传入异步函数会出问题，所以只能传入一个自调用函数
  (async () => {
    await mw.loader.using('ext.wikiEditor')
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
  })()
)

// @TODO 必须保证 wikiEditor 提前加载
mw.loader.load('ext.wikiEditor')
