/**
 * @name IPE-edit-any-page
 * @author 机智的小鱼君
 * InPageEdit自定义plugin
 * 在toolbox添加一个可以编辑任何指定页面的按钮
 *
 * 这是一个开发 IPE plugin 很好的实例
 */
mw.hook('InPageEdit').add(({ _msg }) => {
  // Language pack
  const ipe = window.InPageEdit || {}
  ipe.i18n = ipe.i18n || {}
  const langPack = {
    en: {
      anypage_btn: 'Edit any page',
      anypage_title: 'Quick edit any page',
      anypage_label: 'Please enter the page name',
    },
    'zh-hans': {
      anypage_btn: '编辑任意页面',
      anypage_title: '快速编辑任意页面',
      anypage_label: '请指定页面名',
    },
  }
  $.each(langPack, (lang, str) => {
    ipe.i18n[lang] = ipe.i18n[lang] || {}
    ipe.i18n[lang] = {
      ...ipe.i18n[lang],
      ...str,
    }
  })

  // toolbox hook
  mw.hook('InPageEdit.toolbox').add(({ $toolbox }) => {
    $toolbox.find('.btn-group.group1').append(
      $('<li>', { class: 'btn-tip-group' }).append(
        $('<div>', { class: 'btn-tip', text: _msg('anypage_btn') }),
        $('<button>', { class: 'ipe-toolbox-btn fa fa-edit' }).click(
          function () {
            ssi_modal.show({
              className: 'in-page-edit',
              sizeClass: 'dialog',
              center: true,
              outSideClose: false,
              title: _msg('anypage_title'),
              content: $('<div>').append(
                $('<label>').append(
                  $('<b>', { text: _msg('anypage_label') }),
                  $('<br>'),
                  $('<input>', {
                    id: 'which-page',
                    style: 'width: 96%',
                    value: mw.config.get('wgPageName'),
                  }).click(function () {
                    $(this).css('box-shadow', '')
                  })
                )
              ),
              buttons: [
                {
                  label: _msg('ok'),
                  className: 'btn btn-primary IPE-anypage-ok',
                  keyPress: 'Enter',
                  keyPressBody: true,
                  method: function (a, modal) {
                    var page = $('#which-page').val()
                    if (page === '' || page === undefined) {
                      $('#which-page').css('box-shadow', '0 0 4px red')
                      return false
                    }
                    modal.close()
                    InPageEdit.quickEdit({
                      page: page,
                      reload: false,
                    })
                  },
                },
                {
                  label: _msg('cancel'),
                  className: 'btn btn-secondary IPE-anypage-cancel',
                  keyPressBody: true,
                  method: function (a, modal) {
                    modal.close()
                  },
                },
              ],
            })
          }
        )
      )
    )
  })
})
