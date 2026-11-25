/**
 * @name IPE-quick-thank
 * @author Leranjun
 * @author 机智的小鱼君
 * @desc 在toolbox添加快速感谢功能
 *
 * @trivia I did not steal this code from Dragon-Fish.
 *         Not one byte. -- Leranjun
 */
mw.hook('InPageEdit').add(({ _msg }) => {
  const conf = mw.config.get()

  // Language pack
  const ipe = window.InPageEdit || {}
  ipe.i18n = ipe.i18n || {}
  const langPack = {
    en: {
      thank_btn: 'Quick Thank',
      thank_title: 'Quick thank',
      thank_label: 'Please enter a revision ID',
      thank_success: 'Thanked',
      thank_error: 'Error while thanking: $1',
      thank_query_btn: 'Query',
      thank_progress: 'Requesting...',
      thank_all: 'Thank all!',
    },
    'zh-hans': {
      thank_btn: '快速感谢',
      thank_title: '快速感谢',
      thank_label: '请指定修订版本ID',
      thank_success: '已感谢',
      thank_error: '无法感谢：$1',
      thank_query_btn: '查询',
      thank_progress: '处理中...',
      thank_all: '我特么谢谢宁！',
    },
  }
  $.each(langPack, (lang, str) => {
    ipe.i18n[lang] = ipe.i18n[lang] || {}
    ipe.i18n[lang] = {
      ...ipe.i18n[lang],
      ...str,
    }
  })

  // 处理是否感谢过
  function getThanked() {
    let saves = localStorage.getItem('InPageEditThank') || ''
    saves = saves.split('|')
    return saves
  }
  function saveThanked(rev) {
    rev = String(rev)
    let saves = getThanked()
    if (!saves.includes(rev)) saves.push(rev)
    localStorage.setItem('InPageEditThank', saves.join('|'))
  }
  function canThank({ revid, user }) {
    revid = String(revid)
    let saves = getThanked()
    if (saves.includes(revid) || user === conf.wgUserName) {
      return false
    } else {
      return true
    }
  }

  // 发送感谢
  async function sendThank(rev) {
    const data = await new mw.Api().postWithToken('csrf', {
      action: 'thank',
      format: 'json',
      rev,
      source: 'diff',
    })
    return data
  }

  // 获取页面最近 10 次编辑
  async function getPageRevisions(page) {
    const { query } = await new mw.Api().get({
      action: 'query',
      format: 'json',
      prop: 'revisions',
      titles: page,
      rvprop: 'user|comment|timestamp|ids',
      rvlimit: '10',
    })
    const pageId = Object.keys(query.pages)
    return query?.pages?.[pageId]?.revisions || []
  }

  // 模态框
  function quickThank() {
    const $modalContent = $('<div>')
    const $listArea = $('<div>', { class: 'rev-list' })
    const $progress = () => {
      return $(
        '<div class="ipe-progress" style="width: 100%"><div class="ipe-progress-bar"></div></div>'
      )
    }
    const $pageInput = $('<input>').css({ flex: 1 })
    const $queryBtn = $('<button>', {
      class: 'btn btn-primary',
      text: _msg('thank_query_btn'),
    }).click(function () {
      const page = $pageInput.val()
      if (!page) return
      makeList(page)
    })
    const $inputArea = $('<label>')
      .append($pageInput, $queryBtn)
      .css({ display: 'flex' })

    $modalContent.append($inputArea, $listArea)

    async function makeList(page) {
      $listArea.html('').append($progress)
      const list = await getPageRevisions(page)
      const $list = $('<ul>')

      $.each(list, (index, { revid, parentid, timestamp, user, comment }) => {
        // 按钮
        const $thankBtn = $('<a>', {
          href: 'javascript:;',
          text: canThank({ revid, user })
            ? _msg('thank_btn')
            : _msg('thank_success'),
          class: 'thank-btn',
        }).on('click', async function () {
          const $this = $(this)
          if ($this.attr('disabled')) return
          $this.attr('disabled', '')
          try {
            const { result } = await sendThank(revid)
            console.log(result)
            if (result?.success === 1) {
              $this.text(_msg('thank_success'))
              saveThanked(revid)
              return
            }
            throw 'unknown error'
          } catch (err) {
            $this.removeAttr('disabled', '')
            ssi_modal.notify('error', {
              className: 'in-page-edit',
              title: _msg('error'),
              content: _msg('thank_error', err),
            })
          }
        })
        if (!canThank({ revid, user })) $thankBtn.attr('disabled', '')

        const $diffBtn = $('<a>', {
          href: 'javascript:;',
          text: _msg('quick-diff'),
        }).on('click', async function () {
          InPageEdit.quickDiff({
            fromrev: parentid,
            torev: revid,
          })
        })

        $list.append(
          $('<li>').append(
            $('<strong>', { text: revid, title: timestamp }),
            ' ',
            $('<a>', {
              text: user,
              class: 'mw-user',
              href: mw.util.getUrl(`User:${user}`),
            }),
            ' ',
            $('<span>', { text: comment ? `(${comment})` : '' }),
            ' [',
            $diffBtn,
            ' | ',
            $thankBtn,
            ']'
          )
        )
      })

      $thankAll = $('<div>', { class: 'thank-all' })
        .css({ 'text-align': 'center' })
        .append(
          $('<button>', {
            class: 'btn btn-danger thank-all-btn',
            text: _msg('thank_all'),
          }).click(function () {
            $(this).attr('disabled', '')
            $list.find('.thank-btn').each((index, item) => {
              $(item).click()
            })
          })
        )

      $listArea.html('').append($list, $thankAll)
    }

    const modal = ssi_modal.show({
      className: 'in-page-edit ipe-thank',
      sizeClass: 'small',
      center: true,
      outSideClose: false,
      title: _msg('thank_title'),
      content: $modalContent,
    })

    $pageInput.val(conf.wgPageName)
    $queryBtn.click()

    return modal
  }

  // Toolbox 插入按钮
  mw.hook('InPageEdit.toolbox').add(({ $toolbox }) => {
    $toolbox
      .find('.btn-group.group1')
      .append(
        $('<li>', { class: 'btn-tip-group' }).append(
          $('<div>', { class: 'btn-tip', text: _msg('thank_btn') }),
          $('<button>', { class: 'ipe-toolbox-btn fa fa-smile-o' }).click(
            quickThank
          )
        )
      )
  })

  mw.util.addCSS(`
  .ipe-thank .thank-btn[disabled] {
    color: gray;
    text-decoration: line-through;
    cursor: not-allowed;
  }
  `)
  ipe.quickThank = quickThank
})
