/**
 * @name color-preview 快速预览颜色
 * @author 机智的小鱼君
 */
!(function () {
  /**
   * @param {String} el Element selector
   */
  function loadColorPreview(el) {
    var $preview = $('<p>', { id: 'preview-color-sample' }),
      $color = $('<input>', { type: 'color', id: 'color-input' }),
      $text = $('<input>', { type: 'text', id: 'color-text-input', maxlength: '6' })
    var el = $(el) || $('#editform')
    el.prepend(
      $('<div>', { id: 'preview-color' }).append(
        $('<strong>', { text: '预览颜色' }),
        $('<div>', { id: 'color-area' }).append(
          $('<div>', { id: 'hex-input' }).append(
            $('<span>', { text: '#' }),
            $text
              .keyup(function () {
                updatePreview('#' + $(this).val())
              })
              .val('ffffff'),
            $('<div>', { id: 'bottom-line' }),
            $('<div>', { id: 'color-input-container' }).append(
              $color
                .change(function () {
                  updatePreview($(this).val())
                })
                .val('#ffffff')
            )
          )
        ),
        $preview
      )
    )
    function updatePreview(color) {
      $text.val(function () {
        return $text.val().replace('#', '')
      })
      $preview.html(function () {
        return $('<div>', { style: 'display: flex; text-align: center' }).append(
          $('<div>', { style: 'width: 25%; background-color: transparent' }).append($('<span>', { text: color }).css('color', color)),
          $('<div>', { style: 'width: 25%; background-color: #fff' }).append($('<span>', { text: color }).css('color', color)),
          $('<div>', { style: 'width: 25%; background-color: #000' }).append($('<span>', { text: color }).css('color', color)),
          $('<div>', { style: 'width: 25%; background-color: ' + color }).append(
            $('<span>', { text: '#ffffff' }).css('color', '#ffffff'),
            '&emsp;',
            $('<span>', { text: '#000000' }).css('color', '#000000')
          )
        )
      })
      $color.val(color)
      $text.val(color.replace(/#/g, ''))
    }
  }

  if (typeof mw !== 'undefined') {
    // Action Edit
    if (mw.config.get('wgAction') === 'edit') {
      loadColorPreview('#editform')
    }
    // IPE
    mw.hook('InPageEdit.quickEdit').add(({ $modalContent }) => {
      loadColorPreview($modalContent)
    })
  } else {
    loadColorPreview($('#app'))
  }

  // Style
  $('head').append(
    $('<style>', { 'data-ipe': 'style', 'data-plugin': 'color-preview.js' }).text(
      '#preview-color{font-size:18px;line-height:1.4;}#preview-color #color-area #hex-input{display:inline-block;position:relative}#preview-color #color-area #hex-input span{font-weight:bold;color:#bbbbbb;user-select:none}#preview-color #color-area #hex-input #bottom-line{background-color:#bbbbbb;position:absolute;height:2px;width:100%;bottom:0;left:0}#preview-color #color-area #hex-input #bottom-line::before{content:"";position:absolute;height:2px;width:100%;transform:scaleX(0);background-color:#008a00;transition:all ease .6s}#preview-color #color-area #hex-input #color-text-input{border:0 !important;background-color:transparent;box-shadow:none;padding:2px;width:120px}#preview-color #color-area #hex-input #color-text-input:focus+#bottom-line::before{transform:scaleX(1)}#preview-color #color-input-container{position:relative;display:inline-block;cursor:pointer;border:0;border-radius:50%;overflow:hidden;height:1rem;width:1rem;box-shadow:0 0 4px gray;}#preview-color #color-area #hex-input #color-input{padding:0;margin:0;width:1rem;height:1rem;border:0;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(5);}#preview-color #preview-color-sample{width:100%}'
    )
  )
})()
