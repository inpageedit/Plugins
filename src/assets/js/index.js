!(() => {
  var div = document.getElementById('pluginsList')

  var table = document.createElement('table')
  var thead = document.createElement('thead')
  var tbody = document.createElement('tbody')

  thead.innerHTML = `
  <tr>
    <th>Plugin name</th>
    <th>pluginKey</th>
    <th>Author</th>
    <th>Description</th>
  </tr>
  `

  function add(key, { name, author, description }) {
    var listEl = document.createElement('tr')

    author = author || '-'
    if (author !== '-') author = `<a href="https://github.com/${author}" target="_blank">@${author}</a>`

    listEl.innerHTML = `
    <th><a href="plugins/${key}" target="_blank">${name}</a></th>
    <td><code>${key}</code></td>
    <td>${author}</td>
    <td>${description || ''}</td>
    `

    tbody.appendChild(listEl)
  }

  fetch('/index.json')
    .then(r => {
      return r.json()
    })
    .then(json => {
      Object.keys(json).forEach(k => {
        add(k, json[k])
      })
    })

  table.appendChild(thead)
  table.appendChild(tbody)

  div.innerHTML = ''
  div.appendChild(table)
})()
