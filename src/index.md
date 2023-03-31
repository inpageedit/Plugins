---
layout: page
title: Home
date: 2022-05-30 21:52:03
tags:
---

<div id="custom-header" style="text-align: center;">

<img src="https://ipe.js.org/images/logo/InPageEdit-v2.png" style="max-width: 100%; width: 460px; height: auto;">

</div>

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
    /* Plugin ID here */
  ],
  // ...
}
```

## Plugins list

<div id="plugins-list">
<div class="placeholder" style="text-align: center"><i class="fa fa-spinner fa-pulse fa-5x"></i><br>Loading</div>
</div>

<script src="assets/js/initPluginsList.js"></script>

## ✨ Special products

- [2021 April Fools' Day (IPE-1977)](./plugins/april-fool-2021/)
- [2023 April Fools' Day (My little IPE)](./plugins/april-fool-2023/)
