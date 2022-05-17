# Home

[InPageEdit](https://ipe.js.org) is a powerful frontend JavaScript Plugin for MediaWiki written with jQuery.

It also has many plugins that make it more powerful.

## How to install plugins

### Via InPageEdit preference

1. Locate the "InPageEdit Toolbox™" in the lower right corner
2. Click the "preference" button ("gear" button)
3. Switch to the "plugin" tab
4. Check mark the plugins you want
5. Click save button
6. Refresh the web page
7. Enjoy

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

<script src="assets/js/index.js"></script>
