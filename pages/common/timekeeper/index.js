// pages/components/layout/pages/water-flow/component/product/index.js
let seconds = 0
let start = false
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    time_format: {
      type: String,
      value: 'mm:ss'
    },
    font_size: {
      type: Number,
      value: 15
    },
    font_color: {
      type: String,
      value: "#FFFFFF"
    },
    calculate_seconds: {
      type: Number,
      value: 0,
      observer: function (newVal, oldVal, changedPath) {
        seconds = newVal
        if (!start) {
          start = true
          this.changeTIme()
        }
      }
    }
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
    changeTIme: function (e) {
      let _this = this
      if (seconds != 0) {
        seconds = seconds - 1
        let content = this.formatTime(seconds)

        _this.setData({
          content: content
        })
      }

      setTimeout(function () {
        _this.changeTIme()
      }, 1000)
    },
    formatTime: function (seconds) {
      let result = ''
      if (this.properties.time_format == 'mm:ss') {
        let mm = parseInt(seconds / 60)
        let ss = seconds - mm * 60
        if (mm < 10) {
          result = '0' + mm + ':'
        } else {
          result = '' + mm + ':'
        }
        if (ss < 10) {
          result = result + '0' + ss
        } else {
          result = result + '' + ss
        }

      }
      return result
    }
  },

});