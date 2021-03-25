/**
 * @name IPE-quick-thank
 * @author Leranjun
 * @description 在toolbox添加快速感谢功能
 */
mw.hook('InPageEdit').add(({ _msg }) => {
  // I did not steal this code from Dragon-Fish. Not one bit.
  // Language pack
  var ipe = window.InPageEdit || {}
  ipe.i18n = ipe.i18n || {}
  const toolboxLanguagePack = {
    en: {
      thank_btn: 'Quick Thank',
      thank_title: 'Quick thank a revision',
      thank_label: 'Please enter a revision ID',
      thank_success: 'Thanked.',
      thank_error: 'Error while thanking: ',
    },
    'zh-hans': {
      thank_btn: '快速感谢',
      thank_title: '快速感谢任意修订版本',
      thank_label: '请指定修订版本ID',
      thank_success: '已感谢。',
      thank_error: '无法感谢：',
    },
  }
  ipe.i18n = $.extend({}, ipe.i18n, toolboxLanguagePack)
  window.InPageEdit = ipe

  // toolbox hook
  mw.hook('InPageEdit.toolbox').add(({ $toolbox }) => {
    $toolbox.find('.btn-group.group1').append(
      $('<li>', { class: 'btn-tip-group' }).append(
        $('<div>', { class: 'btn-tip', text: _msg('thank_btn') }),
        $('<button>', { class: 'ipe-toolbox-btn fa fa-smile-o' }).click(function () {
          ssi_modal.show({
            className: 'in-page-edit',
            sizeClass: 'dialog',
            center: true,
            outSideClose: false,
            title: _msg('thank_title'),
            content: $('<div>').append(
              $('<label>').append(
                $('<b>', { text: _msg('thank_label') }),
                $('<br>'),
                $('<input>', { id: 'thank-rev-id', style: 'width: 96%', value: mw.config.get('wgRevisionId') }).click(function () {
                  $(this).css('box-shadow', '')
                })
              )
            ),
            buttons: [
              {
                label: _msg('ok'),
                className: 'btn btn-primary IPE-thank-ok',
                keyPress: 13, // Enter
                method: function (a, modal) {
                  var rev = $('#thank-rev-id').val()
                  if (rev === '' || rev === undefined || isNaN(rev)) {
                    $('#thank-rev-id').css('box-shadow', '0 0 4px red')
                    return false
                  }
                  modal.close()
                  mw.loader.using('mediawiki.api').then(() => {
                    const api = new mw.Api()
                    api
                      .postWithToken('csrf', {
                        action: 'thank',
                        rev,
                        source: 'IPE-quickthank',
                        format: 'json',
                      })
                      .done(() =>
                        ssi_modal.notify('success', {
                          className: 'in-page-edit',
                          title: _msg('notify-success'),
                          content: _msg('thank_success'),
                        })
                      )
                      .catch(e =>
                        ssi_modal.notify('error', {
                          className: 'in-page-edit',
                          title: _msg('notify-error'),
                          content: _msg('thank_error') + '<code>' + e + '</code>',
                        })
                      )
                  })
                },
              },
              {
                label: _msg('cancel'),
                className: 'btn btn-secondary IPE-thank-cancel',
                keyPress: 27, // Esc
                method: function (a, modal) {
                  modal.close()
                },
              },
            ],
          })
        })
      )
    )
  })
})
