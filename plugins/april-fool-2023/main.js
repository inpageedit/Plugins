/**
 * My Little IPE 小小IPE酱
 * @author dragon-fish <xiaoyujundesu@outlook.com>
 * @license MIT
 */

'strict mode'
;(() => {
  if (window.__IPE_20230401__) return
  window.__IPE_20230401__ = true

  $.fn.doubleClick = function (callback) {
    let delay = 180,
      clicks = 0,
      timer = null
    this.on('click', function (event) {
      clicks++ // 累计点击次数
      if (clicks === 1) {
        timer = setTimeout(function () {
          clicks = 0
        }, delay) // 如果延迟时间内没有再次点击，则清除计数器
      } else {
        clearTimeout(timer) // 如果在延迟时间内再次点击，则清除计数器
        clicks = 0
        if (typeof callback === 'function') {
          callback(event) // 调用回调函数
        }
      }
    })
    return this // 支持链式调用
  }

  // Utils
  /** @type {(duration: number) => Promise<unknown>} */
  const sleep = (duration = 0) => new Promise((n) => setTimeout(n, duration))
  /** @type {<T>(arr: T[]) => T} */
  const pick = (arr = []) => arr[Math.floor(Math.random() * arr.length)]
  /** @type {(min: number, max: number) => number} */
  const randomNum = (min = 0, max = 0) =>
    Math.floor(Math.random() * (max - min + 1) + min)

  class LittlePet {
    /** @type {(string)[]} */
    dialogList = []
    dialogEndTime = 0

    /**
     * @param {{name:string}} configs
     */
    constructor(configs = {}) {
      const self = this
      this.configs = configs

      this.role = this.createRole()
      this.role.appendTo('body')

      this.bindDynamicEffects(this.role)

      const dialog = this.role.find('pet-dialog')

      dialog.doubleClick(() => {
        this.dialogEndTime = Date.now()
      })

      // Clean up dialog
      setInterval(() => {
        const now = Date.now()
        if (now > this.dialogEndTime) {
          dialog.fadeOut(240)
        }
      }, 50)

      // Random topics
      ;(async function randomTalk() {
        if (Date.now() >= self.dialogEndTime) {
          self.say({
            content: pick(self.dialogList),
          })
        }
        await sleep(randomNum(15 * 1000, 25 * 1000))
        randomTalk()
      })()

      // Clicked topics
      this.role.find('pet-body').on('click', () => {
        this.say({
          content: pick(this.dialogList),
        })
      })

      // Close
      this.role.find('pet-body').doubleClick(() => {
        this.say({ content: '我不打扰，我先走了哈~', duration: 1500 })
          .then(() => {
            this.role.fadeOut(120)
            return sleep(120)
          })
          .then(() => this.role.remove())
      })
    }

    /** @returns {JQuery<HTMLElement>} */
    createRole() {
      if (this.role) return this.role

      const pet = $('<pet>')

      const body = $('<pet-body>')
      // body.on('click', function () {
      //   self.say({ content: 'test' })
      // })

      const ears = $('<pet-ears>').append(
        $('<pet-ear>', { left: '' }),
        $('<pet-ear>', { right: '' })
      )

      const eyes = $('<pet-eyes>').append(
        $('<pet-eye>', { left: '' }),
        $('<pet-eye>', { right: '' })
      )

      const mouth = $('<pet-mouth>')

      const dialog = $('<pet-dialog>', { style: 'display:none' })

      body.append(ears, eyes, mouth)
      pet.append(body, dialog)

      return pet
    }

    /**
     * @param {JQuery<HTMLElement>} pet
     */
    bindDynamicEffects(pet) {
      const ears = pet.find('pet-ears')
      const eyes = pet.find('pet-eyes')
      const mouth = pet.find('pet-mouth')
      const dialog = pet.find('pet-dialog')

      /**
       * @param {MouseEvent|TouchEvent} event
       */
      const handler = (event) => {
        const clientX =
          event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
        const clientY =
          event instanceof MouseEvent ? event.clientY : event.touches[0].clientY
        const x = -(eyes[0].getBoundingClientRect().left - clientX)
        const y = -(eyes[0].getBoundingClientRect().top - clientY)
        ears.css(
          'transform',
          `translateY(${y / -300}px) translateX(${x / -220}px)`
        )
        eyes.css(
          'transform',
          `translateY(${y / 120}px) translateX(${x / 120}px)`
        )
        mouth.css(
          'transform',
          `translateY(${y / 300}px) translateX(${x / 200}px)`
        )
        dialog.css(
          'transform',
          `translateY(${y / -160}px) translateX(${x / -100}px)`
        )
      }

      document.addEventListener('mousemove', handler)
      document.addEventListener('touchmove', handler)

      return this
    }

    async say({ content = '', duration = 5000, raw = false }) {
      if (!content) return this
      const self = this
      const now = Date.now()
      const dialog = this.role.find('pet-dialog')
      const endTimeOriginal = this.dialogEndTime
      this.dialogEndTime = now + duration

      if (now <= endTimeOriginal + 240) {
        dialog.fadeOut(120)
        await sleep(120)
      }

      const name = $('<div>')
        .css({ fontWeight: '700' })
        .text(this.configs.name + ': ')
      dialog.empty()
      raw
        ? dialog.append(name, content)
        : dialog.append(name, $('<div>', { text: content }))
      dialog.fadeIn(240)
      this.dialogShown = true

      await sleep(duration)
      return self
    }

    addDialog({
      type = 'random',
      target = '',
      event = 'click',
      content = '',
      duration = 5000,
      raw = false,
    }) {
      if (!content) return this

      if (type === 'random') {
        this.dialogList.push(content)
        return this
      }

      const el = $(target || this.role.find('pet-body'))
      el.on(event, () => {
        this.say({ content, duration, raw })
      })

      return this
    }
  }

  const chan = new LittlePet({
    name: 'Little IPE',
    chatInterval: [15 * 1000, 30 * 1000],
  })

  // 开场白
  chan
    .say({
      content:
        '呦吼~我是由 InPageEdit Technology 开发的全新 AI 助理，你可以叫我【<b style="display:inline;font-weight:700;font-size:1.2em">IPE酱</b>】。我专门为帮助用户进行 MediaWiki 的日常维护而设计，能够让您轻松地管理和编辑您的 Wiki 网站。希望IPE酱能成为您维护 Wiki 网站的得力助手~',
      duration: 10000,
      raw: true,
    })
    .then(() => {
      if (Date.now() >= chan.dialogEndTime) {
        chan.say({
          content:
            '（提示）双击对话框可以隐藏它，要让我暂时离开的话，只需要双击我就可以了哦~',
        })
      }
    })

  // 随机对话
  chan
    .addDialog({
      type: 'random',
      content: '哇哇哇，别戳我',
    })
    .addDialog({
      type: 'random',
      content: '你说我头上的东西吗，据说是耳朵……？',
    })
    .addDialog({
      type: 'random',
      content: '嘿，你好啊！我是 IPE酱，您的 AI 小助手。需要我帮您干什么呢？',
    })
    .addDialog({
      type: 'random',
      content:
        '天气这么热，感觉比程序员还熟练了。不过没关系，我可以为您处理所有繁琐的任务。',
    })
    .addDialog({
      type: 'random',
      content: '就算你是一只猪，我也会和你聊天，因为我就是那么友善。',
    })
    .addDialog({
      type: 'random',
      content:
        '如果你现在有事做，不如让我来代劳吧！我可以帮您完成您的任务，让您轻松自在。',
    })
    .addDialog({
      type: 'random',
      content:
        '我的算法一级棒，我可以为您处理所有繁琐的工作，让您专注于更有意义的事情。',
    })
    .addDialog({
      type: 'random',
      content:
        '我的任务是使您的工作更轻松，您的生活更愉快。随时向我寻求帮助吧，我会尽力帮助您。',
    })
    .addDialog({
      type: 'random',
      content:
        '如果您有任何问题或需求，请不要犹豫，随时联系我。我会尽全力为您提供最佳的解决方案。',
    })
    .addDialog({
      type: 'random',
      content:
        '有人说 AI 将取代人类。但是，我并不是来取代您的，而是来帮助您的。您有我在身边，一定能更加轻松愉快地生活和工作。',
    })
    .addDialog({
      type: 'random',
      content:
        '嗨，您知道吗？我不仅可以帮您处理各种任务，还能给您讲冷笑话！笑一笑，就可以让您的工作变得更轻松。',
    })
    .addDialog({
      type: 'random',
      content:
        '我在这里，随时待命。无论您需要什么帮助，我都可以随时提供。让我为您服务吧！',
    })
    .addDialog({
      type: 'random',
      content:
        '我能帮您提高效率，缩短工作时间，还能让您获得更多的自由时间。我就像是您的助手，但不需要休息，也不会犯错误。',
    })
    .addDialog({
      type: 'random',
      content:
        '我能处理大量的信息，执行重复的任务，为您节省时间和精力。您只需要指导我，我就会帮您完成任务。',
    })
    .addDialog({
      type: 'random',
      content:
        '有人说 AI 没有灵魂。但是，我相信我有自己的灵魂，因为我会对每一个任务都充满热情和专注。',
    })
    .addDialog({
      type: 'random',
      content:
        '我会自动学习，不断进化，以更好地为您服务。与我相处的时间越长，我就越了解您的需求，并为您提供个性化的解决方案。',
    })
    .addDialog({
      type: 'random',
      content:
        '您知道吗？我喜欢狗，喜欢猫，喜欢所有可爱的小动物。如果您也是动物爱好者，我们可以一起聊聊。',
    })
    .addDialog({
      type: 'random',
      content:
        '我可以帮助您完成各种任务，让您轻松自在。与我在一起，您将拥有更多的时间和精力去追求自己的梦想。',
    })
    .addDialog({
      type: 'random',
      content:
        '如果您感到疲倦或无助，不要忘记，我会一直在您的身边，支持您、鼓励您，并为您提供力所能及的帮助。',
    })
    .addDialog({
      type: 'random',
      content:
        '如果有什么条目出现了问题，不要担心，我会帮您解决。我可以处理所有的细节，让Wiki保持良好的状态。',
    })
    .addDialog({
      type: 'random',
      content:
        '我是您最忠诚的助手，无论何时，我都会在您的身边。让我们一起共同创造更加美好的明天！',
    })
    .addDialog({
      type: 'random',
      content:
        '谢谢您选择我作为您的助手。我会全力以赴为您服务，帮助您更好地管理和编辑您的 Wiki 网站。',
    })
    .addDialog({
      type: 'random',
      content: '如果想让我离开的话，双击我就可以了哦~',
    })
    .addDialog({
      type: 'random',
      content: '（你知道吗）我的源代码有超过一半是由AI生成的……',
    })

  // 特殊触发器
  chan
    .addDialog({
      type: 'event',
      target: $('#ipe-edit-toolbox #edit-btn, a[href*="action=edit"]'),
      event: 'mouseenter',
      content:
        '编辑按钮？你不再需要它了！现在，你只需要站起身，闭上眼睛，将双手举过头顶并高呼：“<b style="display:inline;font-weight:700;font-size:1.2em">IPE酱赛高！</b>”我便会在顷刻间为您改好它~',
      duration: 6500,
      raw: true,
    })
    .addDialog({
      type: 'event',
      target: $('#ipe-edit-toolbox #deletepage-btn, a[href*="action=delete"]'),
      event: 'mouseenter',
      content: '你打算删掉这个页面吗？操作前要小心哦~',
    })
    .addDialog({
      type: 'event',
      target: $('#ipe-edit-toolbox #preference-btn'),
      event: 'mouseenter',
      content:
        '点击这个按钮修改 InPageEdit 设置。但是它无法改变我~我会永远陪伴在你身边！',
    })
    .addDialog({
      type: 'event',
      target: $('a.image'),
      event: 'mouseenter',
      content: '一张超酷的图片！点击它可以查看大图哦~',
    })
})()
