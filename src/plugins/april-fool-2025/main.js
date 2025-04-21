'use strict'
;(async () => {
  const __loaded = Symbol.for('ipe-april-fool-2025')
  if (window[__loaded]) {
    return
  }
  window[__loaded] = true

  const IPE_PROGRESS_TARGETS = ['.ipe-progress', '.ipe-progress-overlay']

  /**
   * 绘制一个假的 CAPTCHA 进度条
   * @returns {HTMLDivElement}
   */
  const FoolProgressBar = () => {
    const div = document.createElement('div')
    div.className = 'ipe-progress-april-fool-2025'
    const template = `
<div class="moe-captcha" style="font-size: 14px; width: 320px; border: 1px solid #aaa; background: #f8f8f8; color: #222; border-radius: 0.5em; display: inline-flex; gap: 1em; align-items: center; padding: 0.5em;">
  <div class="moe-captcha-spin">
    <span class="loader"></span>
    <style>
      .loader {
        width: 42px;
        height: 42px;
        border: 5px dotted #02A54D;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        animation: rotation 3.6s linear infinite;
      }

      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    </style>
  </div>
  <div class="moe-captcha-text" style="flex: 1">
    <div style="margin: 0 0 0.5em 0; font-size: 1.25em; font-weight: 700;">
      我们怀疑你是人类
    </div>
    <div>
      请完成验证🐴后继续
    </div>
  </div>
  <div class="moe-captcha-image">
    <img src="https://r2.epb.wiki/-/2025/03/31/5d97bb8c0b7563552b0c178a800c1b358e3a8ab9.png" alt="CAPTCHA" style="width: 72px">
  </div>
</div>
    `
    div.innerHTML = template
    div.style.width = '100%'
    div.style.height = '100%'
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.justifyContent = 'center'
    return div
  }

  const observer = new MutationObserver(() => {
    const targets = document.querySelectorAll(IPE_PROGRESS_TARGETS.join(','))
    targets.forEach((target) => {
      const progressBarFake = FoolProgressBar()
      target.innerHTML = ''
      target.style.width = '100%'
      target.style.height = 'auto'
      target.style.border = 'none'
      target.appendChild(progressBarFake)
    })
  })
  observer.observe(document.body, {
    childList: true,
  })
})()
