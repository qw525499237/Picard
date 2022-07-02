// pages/common/card_swiper_item/card_swiper_item.js
var request = require('../request.js');
var filter = require("../utils/filter.js");
let timer = []

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object,
    get_card_height: Number,
    card_to_top: Number,
    change_show: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    pick: false,
    cp: false,
    card_id: -1,
    like: -1,
    mute: wx.getStorageSync('mute'),
    currentShowItem: '',
    videoCtx: '',
    square_width: 96,
    platform: getApp().globalData.platform
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateItem(item) {
      //  _this.selectComponent('#item').updateItem(item);

      if (this.properties.item == null || this.properties.item == undefined) {
        return
      }
      if (this.properties.item.card_id == item.card_id) {
        this.setData({
          item: item
        })
      }
    },
    toMap() {
      wx.navigateTo({
        url: '/pages/map/map?lat=' + this.properties.item.lat + '&lng=' + this.properties.item.lng + '&cpoint=' + this.properties.item.card_cpoint + '&card_id=' + this.properties.item.card_id
      })
    },
    changeMuteTap() {
      let mute = !this.data.mute

      this.triggerEvent('changeMuteTap', mute)
    },
    changeMute(e) {
      // console.log('静音嘤嘤', e)
      wx.setStorageSync('mute', e)
      this.setData({
        mute: e
      })
      // if (this.data.mute) {
      //   wx.setStorageSync('mute', false)
      //   this.setData({
      //     mute: false
      //   })
      // } else {
      //   wx.setStorageSync('mute', true)
      //   this.setData({
      //     mute: true
      //   })
      // }
    },
    setMute(mute) {
      this.setData({
        mute: mute
      })
    },
    changeNowIndex(e) {
      let _this = this
      this.setData({
        show_first_img: true,
        show_cover: true,
        currentShowItem: e,

      })
      this.changeVideStatus()
    },
    changeVideStatus() {
      let _this = this
      if (this.data.videoCtx == '') {
        this.setData({
          videoCtx: wx.createVideoContext('myVideo', this)
        }, function () {
          _this.changeVideoStutus()
        })
        return
      }
      _this.changeVideoStutus()
    },

    changeVideoStutus() {
      if (this.properties.item == null || this.data.currentShowItem == '' || this.properties.item == undefined) {
        return
      }

      this.data.videoCtx = wx.createVideoContext('myVideo', this)
      if (this.properties.item.card_id == this.data.currentShowItem.card_id) {
        this.setData({
          mute: wx.getStorageSync('mute')
        })
        this.data.videoCtx.seek(0)
        this.data.videoCtx.play()
      } else {
        this.setData({
          mute: true
        })
        this.data.videoCtx.seek(0)
        this.data.videoCtx.pause()
      }
    },
    likeCard(e) {
      this.triggerEvent('likeCard', this.properties.item)
    },
    wantCard(e) {
      this.triggerEvent('wantCard', this.properties.item)
    },
    changeCardInfo: function (e) {

      if (this.properties.item == undefined || this.properties.item == null) {
        return
      }
      if (this.properties.item.card_id == e.card_id) {
        this.setData({
          item: e
        })
      }

    },
    showCardNum: function (e) {
      this.triggerEvent('showCardNum', this.properties.item)
    },
    showCardLv: function (e) {

      this.triggerEvent('showCardLv', this.properties.item)
    },
    showCardCPoint: function (e) {
      if (this.properties.item.is_assessing) {
        wx.showToast({
          title: '宇宙首发中...',
          icon: 'none'
        })
        return
      }
      this.triggerEvent('showCardCPoint', this.properties.item)
    },
    showAllInfo: function (e) {
      this.triggerEvent('showAllInfo', this.properties.item)
    },
    showAssessResult: function (e) {
      this.triggerEvent('showAssessResult', this.properties.item)
    },
    videoWaiting(e) {
      // console.log(e)
    },
    videoError(e) {
      // console.log(e)
    },
    imgError(e) {
      let item = e.currentTarget.dataset.item
      if (item.card_id == this.data.currentShowItem.card_id) {
        if (this.data.show_first_img) {
          this.setData({
            show_first_img: false
          })
        } else {
          this.setData({
            show_first_img: true
          })
        }
      }

    },
    videoloadedmetadata(e) {
      let item = e.currentTarget.dataset.item
      if (item.card_id == this.data.currentShowItem.card_id) {
        if (this.data.show_cover) {
          this.setData({
            show_cover: false
          })
        }
      }
    },
    showComment(e) {
      this.triggerEvent('showComment', this.properties.item)
    },
    toMap(e) {
      wx.navigateTo({
        url: '/pages/map/map?lat=' + this.properties.item.lat + '&lng=' + this.properties.item.lng + '&cpoint=' + this.properties.item.card_cpoint + '&card_id=' + this.properties.item.card_id
      })
    },
    changeVideoHide(e) {
      this.setData({
        show_video: e
      })
    },
    toAnotherAccountPage() {

      filter.jumpToMePage(this.properties.item.account_id, '')
    },
    showPickAnt() {

      if (this.properties.item == null || this.data.currentShowItem == null) {
        return
      }
      if (this.properties.item.card_id != this.data.currentShowItem.card_id) {
        return
      }
      if (this.properties.item.card_type != 'SR' || this.properties.item.assessing) {
        return
      }
      wx.setStorageSync('show_meta_pick_toast', false)
      wx.setStorageSync('show_meta_pick_toast_count', 0)
      let _this = this
      let failanimation = wx.createAnimation({
        duration: 1500, // 以毫秒为单位 
        timingFunction: 'liner',
        delay: 0,
        success: function (res) {}
      });
      failanimation.opacity(1).step()
      _this.setData({
        pick_toast_ant: failanimation.export()
      })
      let show = true
      for (let i = 1; i < 6; i++) {
        let antTimer = setTimeout(function () {
          let failanimation2 = wx.createAnimation({
            duration: 1500, // 以毫秒为单位 
            timingFunction: 'liner',
            delay: 0,
            success: function (res) {}
          });
          if (show) {
            show = false
            if (i == 5) {
              failanimation2.opacity(0).step()
            } else {
              failanimation2.opacity(0.3).step()
            }
          } else {
            show = true
            failanimation2.opacity(1).step()
          }
          _this.setData({
            pick_toast_ant: failanimation2.export()
          })
        }, 1500 * i)
        timer.push(antTimer)
      }
    },
    stopAnt() {
      for (let i = 0; i < timer.length; i++) {
        clearTimeout(timer[i])
      }
      let failanimation = wx.createAnimation({
        duration: 0, // 以毫秒为单位 
        timingFunction: 'liner',
        delay: 0,
        success: function (res) {}
      });
      failanimation.opacity(0).step()
      this.setData({
        pick_toast_ant: failanimation.export()
      })
    }
  },

})