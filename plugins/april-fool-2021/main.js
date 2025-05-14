!(() => {
  if (window.InPageEditAprilFool2021)
    return console.warn('[InPageEdit] 2021 愚人节源码被多次载入')
  window.InPageEditAprilFool2021 = true
  const isLoaded = localStorage.getItem('InPageEditAprilFool2021')

  function showModal() {
    const modal = ssi_modal.createObject({})
    modal.setOptions('center', true)
    modal.setOptions('className', 'ipe-af-2021')
    modal.setOptions('sizeClass', 'medium')
    modal.init()
    modal.setContent(
      $('<div>').append(
        $('<iframe>', {
          src: 'https://ipe-plugins.js.org/plugins/april-fool-2021/modal/index.html',
          scrolling: 'no',
        })
      )
    )
    modal.show()
  }

  const now = new Date()
  now.setTime(now.getTime() - now.getTimezoneOffset() * 60000)

  if (now.toISOString().startsWith('2021-04-01T')) {
    mw.loader.load(
      'https://ipe-plugins.js.org/plugins/april-fool-2021/theme.css',
      'text/css'
    )
    if (isLoaded) {
      console.log(
        '[InPageEdit] 2021 愚人节项目已经执行过，再次查看，可以在页面内按顺序输入“ipeaprilfool2021”~'
      )
    } else {
      localStorage.setItem('InPageEditAprilFool2021', 'true')
      showModal()
    }
  } else {
    console.log(
      '[InPageEdit] 今天不是 2021 愚人节，想要查看，可以在页面内按顺序输入“ipeaprilfool2021”~'
    )
  }

  // ↑↑↓↓←→←→BABA
  !(() => {
    var lastKey = []
    function check(e) {
      lastKey = lastKey || []
      lastKey.push(e.keyCode)
      if (lastKey.length > 16) lastKey.shift()
      if (/73806965808273767079797650485049$/.test(lastKey.join(''))) {
        showModal()
      }
      console.log(lastKey.join(''))
    }
    $(window).on('keydown', check)
  })()
})()
