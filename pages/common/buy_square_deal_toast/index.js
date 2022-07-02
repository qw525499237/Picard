// pages/components/layout/pages/water-flow/component/product/index.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    content: `<div class="rich-text-content">您可点击想要的地盘，在地盘碎片页评论联系地主，地主可通过[赠予]<img class="rich-text-image" src="/pages/images/get_card.png"></img>或[碎片码]将地盘转移给您</div>`
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickAffirm: function (e) {
      console.log(e)
      this.triggerEvent('clickAffirm', e)
    },
    clickCancel: function (e) {
      console.log(e)
      this.triggerEvent('clickCancel', e)
    }
  }
});