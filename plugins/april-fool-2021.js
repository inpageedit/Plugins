!(() => {
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
          src: 'https://ipe-plugins.js.org/public/AprilFool2021/index.html',
          scrolling: 'no',
        })
      )
    )
    modal.show()
  }

  const now = new Date()
  if (isLoaded) {
    console.log(
      '[InPageEdit] 2021 愚人节项目已经执行过，再次查看，可以在页面内按顺序输入“ipeaprilfool2021”~'
    )
  } else if (
    now.getFullYear() === 2021 &&
    now.getMonth() === 4 &&
    now.getDate() === 1
  ) {
    showModal()
    localStorage.getItem('InPageEditAprilFool2021', 'true')
  } else {
    console.log(
      '[InPageEdit] 今天不是 2021 愚人节，想要查看，可以在页面内按顺序输入“ipeaprilfool2021”~'
    )
  }

  !(() => {
    var lastKey = []
    function check(e) {
      lastKey = lastKey || []
      lastKey.push(e.keyCode)
      if (lastKey.length > 16) lastKey.shift()
      if (/73806965808273767079797650485049$/.test(lastKey.join('')))
        showModal()
      console.log(lastKey.join(''))
    }
    $(window).on('keydown', check)
  })()
})()

mw.util.addCSS(`
.ipe-af-2021 {
  background: rgba(0, 0, 0, 0.8);
}
.ipe-af-2021 iframe {
  width: 100%;
  height: 420px;
  border: 0;
}
.ipe-af-2021 .ssi-modalWindow {
  padding: 0;
}
.ipe-af-2021 .ssi-modalContent {
  margin: 0;
  padding: 0;
}
`)
