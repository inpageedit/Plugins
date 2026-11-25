;(() => {
  const container = document.getElementById('plugins-list')

  const table = document.createElement('table')
  const thead = document.createElement('thead')
  const tbody = document.createElement('tbody')

  thead.innerHTML = `
  <tr>
    <th>Plugin Name</th>
    <th>Plugin ID</th>
    <th>Author</th>
    <th>Description</th>
  </tr>
  `

  function add(key, { name, author, description }) {
    let listEl = document.createElement('tr')

    author = author || '-'
    if (author !== '-')
      author = `<a href="https://github.com/${author}" target="_blank">@${author}</a>`

    listEl.innerHTML = `
    <th><a href="plugins/${key}" target="_blank">${name}</a></th>
    <td><code>${key}</code></td>
    <td>${author}</td>
    <td>${description || ''}</td>
    `

    tbody.appendChild(listEl)
  }

  fetch('/index.json')
    .then((r) => {
      return r.json()
    })
    .then((json) => {
      Object.keys(json).forEach((k) => {
        add(k, json[k])
      })
    })

  table.appendChild(thead)
  table.appendChild(tbody)

  container.innerHTML = ''
  container.appendChild(table)
  return table
})()
