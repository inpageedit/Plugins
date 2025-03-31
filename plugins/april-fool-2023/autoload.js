mw.hook('InPageEdit').add(() => {
  mw.loader.load('https://ipe-plugins.js.org/plugins/april-fool-2023/main.js')
  mw.loader.load(
    'https://ipe-plugins.js.org/plugins/april-fool-2023/style.css',
    'text/css'
  )
})
