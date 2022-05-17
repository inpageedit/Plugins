/**
 * @name InPageEdit_plugin_demo
 * @description This is a demo script.
 */

/** Let's add some additional edit notice to quickEdit modal */
// Using quickEdit hook
mw.hook('InPageEdit.quickEdit')
  // Get context
  .add(({ $modalWindow, $modalContent }) => {
    // Show "showEditNotice" button
    $modalWindow.find('.showEditNotice').show()
    // Get original edit notice
    var editNotice = $modalContent.data('editNotice') || ''
    // Add additional edit notice
    editNotice += '<div>Hello world!</div>'
    // Set edit notice
    $modalContent.data('editNotice', editNotice)
  })
