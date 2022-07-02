// pages/components/layout/pages/water-flow/component/product/index.js
Component({
  
  /**
   * 组件的属性列表
   */
  properties: {
    sell_card_num:Number,
    sell_card_cp:Number,
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickAffirm:function(e){
      console.log(e)
      this.triggerEvent('clickAffirm', e)
    },
    clickCancel:function(e){
      console.log(e)
      this.triggerEvent('clickCancel', e)
    },
    phoneInput:function(e){
      console.log(e)
      this.triggerEvent('phoneInput', e)
    }
  }
});