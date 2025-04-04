/**
 * @module toolbox 工具盒模块
 */
mw.hook('InPageEdit').add(({ _analytics, _msg, InPageEdit }) => {
  var config = mw.config.get()
  // 检测是否为文章页
  if ($('#ipe-edit-toolbox').length > 0) {
    console.warn('[InPageEdit] Toolbox 已经加载过了')
    return
  }

  if (!config.wgIsArticle) {
    console.warn('[InPageEdit] 不是文章页面')
    $('<div>', { id: 'ipe-edit-toolbox' })
      .append(
        $('<div>', {
          id: 'ipe-toolbox-placeholder',
          style:
            'width:0.75rem;height:0.75rem;border-radius:50%;background:#3f51b5;line-height:1;pointer-events:none;',
        }).append(
          $('<i>', {
            class: 'fa fa-check',
            style:
              'font-size:0.5em;color:#fff;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)',
          })
        )
      )
      .appendTo('body')
    return
  }

  /** IPE工具盒 **/
  var $toolbox = $('<div>', { id: 'ipe-edit-toolbox' }).append(
    $('<ul>', { class: 'btn-group group1' }).append(
      $('<li>', { class: 'btn-tip-group' }).append(
        $('<div>', { class: 'btn-tip', text: _msg('quick-edit') }),
        $('<button>', {
          id: 'edit-btn',
          class: 'ipe-toolbox-btn',
          html: '<i class="fa fa-pencil fa-pencil-alt"></i>',
        }).click(function () {
          InPageEdit.quickEdit({
            page: config.wgPageName,
            revision: config.wgRevisionId,
          })
        })
      ),
      $('<li>', { class: 'btn-tip-group' }).append(
        $('<div>', { class: 'btn-tip', text: _msg('redirect-from') }),
        $('<button>', {
          id: 'redirectfrom-btn',
          class: 'ipe-toolbox-btn',
          html: '<i class="fa fa-sign-in fa-sign-in-alt"></i>',
        }).click(function () {
          InPageEdit.quickRedirect('from')
        })
      ),
      $('<li>', { class: 'btn-tip-group' }).append(
        $('<div>', { class: 'btn-tip', text: _msg('redirect-to') }),
        $('<button>', {
          id: 'redirectto-btn',
          class: 'ipe-toolbox-btn',
          html: '<i class="fa fa-sign-out fa-sign-out-alt"></i>',
        }).click(function () {
          InPageEdit.quickRedirect('to')
        })
      )
    ),
    $('<ul>', { class: 'btn-group group2' }).append(
      $('<div>', { style: 'display: flex;' }).append(
        $('<li>', { class: 'btn-tip-group' }).append(
          $('<div>', { class: 'btn-tip', text: _msg('quick-delete') }),
          $('<button>', {
            id: 'deletepage-btn',
            class: 'ipe-toolbox-btn',
            html: '<i class="fa fa-trash"></i>',
          }).click(function () {
            InPageEdit.quickDelete()
          })
        ),
        $('<li>', { class: 'btn-tip-group' }).append(
          $('<div>', { class: 'btn-tip', text: _msg('quick-rename') }),
          $('<button>', {
            id: 'renamepage-btn',
            class: 'ipe-toolbox-btn',
            html: '<i class="fa fa-italic"></i>',
          }).click(function () {
            InPageEdit.quickRename()
          })
        ),
        $('<li>', { class: 'btn-tip-group' }).append(
          $('<div>', { class: 'btn-tip', text: _msg('ipe-preference') }),
          $('<button>', {
            id: 'preference-btn',
            class: 'ipe-toolbox-btn',
            html: '<i class="fa fa-gear"></i>',
          }).click(function () {
            InPageEdit.preference.modal()
          })
        )
      )
    ),
    $('<button>', {
      class: 'ipe-toolbox-btn',
      id: 'toolbox-toggle',
      html: '<i class="fa fa-plus"></i>',
    })
  )

  $toolbox.appendTo('body')

  $toolbox.find('.btn-group button').click(function () {
    _analytics('tool_box')
  })

  // 设置开关等
  var toolBoxInner = $toolbox.find('#toolbox-toggle, .btn-group')
  $toolbox.find('#toolbox-toggle').click(function () {
    if ($(this).hasClass('opened') && !$(this).hasClass('click')) {
      InPageEdit.preference.set({ lockToolBox: true })
      toolBoxInner.addClass('click')
    } else if ($(this).hasClass('click')) {
      InPageEdit.preference.set({ lockToolBox: false })
      toolBoxInner.removeClass('click')
    } else {
      InPageEdit.preference.set({ lockToolBox: true })
      toolBoxInner.addClass('click opened')
    }
  })
  // 如果锁定过工具盒，就自动展开
  if (InPageEdit.preference.get('lockToolBox') === true) {
    toolBoxInner.addClass('click opened')
  }
  // 鼠标覆盖与离开
  $toolbox.mouseover(function () {
    toolBoxInner.addClass('hover opened')
  })
  $toolbox.mouseout(function () {
    toolBoxInner.removeClass('hover')
    if (!$toolbox.find('#toolbox-toggle').hasClass('click')) {
      toolBoxInner.removeClass('opened')
    }
  })
  // 触发钩子，传递上下文
  mw.hook('InPageEdit.toolbox').fire({
    $toolbox,
  })
})

// April Fools' Day
;(() => {
  // get yyyy-mm-dd in timezone
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const ymd = `${year}-${month}-${day}`

  if (ymd === '2025-04-01') {
    mw.loader.load('https://plugins.ipe.wiki/plugins/april-fool-2025/main.js')
  }
})()
