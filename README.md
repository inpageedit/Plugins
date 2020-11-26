# InPageEdit-Plugins

InPageEdit Official Plugins Store

## How to use

### Via InPageEdit preference

Check mark the plugin you want.

### Via JS code

```js
/**
 * @variable InPageEdit.myPreference.plugins {Array}
 */
InPageEdit = window.InPageEdit || {} // Keep these line
InPageEdit.myPreference = {
  // ...
  plugins: [
    /* pluginKey here */
  ],
  // ...
}
```

## Plugins list

<div id="pluginsList">Loading...</div>

<script>
!(() => {
  var div = document.getElementById('pluginsList')
  fetch('/index.json').then(r => {
    return r.json()
  }).then(json => {
    div.innerHTML = `<pre>${JSON.stringify(json, null, 4)}</pre>`
  })
})()
</script>
