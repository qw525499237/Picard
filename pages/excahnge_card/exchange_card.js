// pages/excahnge_card/exchange_card.js
let selectCard = ''
let cardCode = ''
let app = getApp()
var request = require('../common/request.js');
var filter = require("../common/utils/filter");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    items: [],
    account_info: {
      total_card_num: 0,
      cpoint: 0,
      total_card_cp: 0,
    },
    exchange_card_code: '',
    exchange_card_code1: '',
    platform: getApp().globalData.platform,
    change_show: wx.getStorageSync('change_show')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      change_show: wx.getStorageSync('change_show')
    })
    this.getWindowData();
    let userInfo
    if (wx.getStorageSync('login') != '') {
      userInfo = wx.getStorageSync('userInfo')
      this.setData({
        account_info: userInfo
      })
    } else {

    }

    this.getTrueCardList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  backLastPage(e) {
    wx.navigateBack({
      delta: 1
    })
  },
  showToast(e) {
    if (!this.judgeLogOn(e, 'showToast')) {
      return;
    }
    let accountInfo = this.data.account_info
    let cardInfo = e.currentTarget.dataset.item
    selectCard = cardInfo
    console.log(e)
    let content
    if (accountInfo.cpoint < cardInfo.card_cpoint) {
      content = {
        title: '现有C-point：' + accountInfo.cpoint,
        content: '不足' + cardInfo.card_cpoint + '，继续收集碎片，再来兑换吧！',
        top_bg: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/toast_top_bg2.png',
        title_color: '#52515A',
        have_cp_icon: true,
        enough: false
      }
    } else {
      content = {
        title: '现有C-point：' + accountInfo.cpoint,
        content: '是否消耗' + cardInfo.card_cpoint + '，兑换[' + cardInfo.title + ']1块？',
        top_bg: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/toast_top_bg2.png',
        title_color: '#52515A',
        have_cp_icon: true,
        enough: true
      }
    }
    this.setData({
      show_mask2: true,
      toast_data: content
    })
  },
  showToast1(e) {
    if (!this.judgeLogOn('', 'showToast1')) {
      return;
    }
    let accountInfo = this.data.account_info
    let content
    selectCard = this.data.top_item
    if (accountInfo.cpoint < this.data.top_item.card_cpoint) {
      content = {
        title: '现有C-point：' + accountInfo.cpoint,
        content: '不足' + this.data.top_item.card_cpoint + '，继续收集碎片，再来兑换吧！',
        top_bg: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/toast_top_bg2.png',
        title_color: '#52515A',
        have_cp_icon: true,
        enough: false
      }
    } else {
      content = {
        title: '现有C-point：' + accountInfo.cpoint,
        content: '是否消耗' + this.data.top_item.card_cpoint + '，兑换[环球影城门票]1块？',
        top_bg: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/toast_top_bg2.png',
        title_color: '#52515A',
        have_cp_icon: true,
        enough: true
      }
    }
    this.setData({
      show_mask2: true,
      toast_data: content
    })
  },
  toBadgePage(e) {
    let cardInfo = e.currentTarget.dataset.item
    console.log(cardInfo)
    wx.navigateTo({
      url: '../badge_card/badge_card?badge_id=' + cardInfo.collection_badge_id
    })
  },
  toBadgePage1(e) {
    wx.navigateTo({
      url: '../badge_card/badge_card?badge_id=' + this.data.top_item.collection_badge_id
    })
  },
  clickAffirm(e) {
    this.setData({
      show_mask2: false
    })

  },
  clickAffirm2(e) {
    this.exchangeCard()

  },
  clickCancel2(e) {
    this.setData({
      show_mask2: false
    })
  },
  toMy(e) {
    if (!this.judgeLogOn('', 'toMy')) {
      return;
    }


    filter.jumpToMePage(-1, 'to_tab=three')

  },
  toHandBook(e) {
    // if (!this.judgeLogOn('', 'toHandBook')) {
    //   return;
    // }
    // wx.navigateTo({
    //   url: '../handbook/handbook?show_toast=使用C-point兑换心仪的碎片，尽享升值！'
    // })
    wx.navigateTo({
      url: '/pages/map/map?lat=' + (-1.0) + '&lng=' + (-1.0) + '&cpoint=' + 0 + '&card_id=' + (-1)
    })
  },
  toProtocolPage(e) {
    wx.navigateTo({
      url: '../protocol/protocol?protocol_type=exchange'
    })
  },
  getTrueCardList() {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let _this = this
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    wx.request({
      url: prefix + 'true_card_list', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        let loopShowList = res.data.data;

        for (let i = 0; i < loopShowList.length; i++) {
          loopShowList[i].images[0].image_zoom = 100
          if (loopShowList[i].images[0].vertical) {
            if (loopShowList[i].images[0].width > 400) {
              loopShowList[i].images[0].image_zoom = parseInt((400 / loopShowList[i].images[0].width) * 100)
            }
          } else {
            if (loopShowList[i].images[0].width > 400) {
              loopShowList[i].images[0].image_zoom = parseInt((400 / loopShowList[i].images[0].width) * 100)
            }
          }
        }


        let topItem = loopShowList.splice(0, 1);
        topItem = topItem[0]
        console.log('>>>>>>>>>>>>>>>>>>>')
        console.log(topItem)
        _this.setData({
          top_item: topItem,
          items: loopShowList
        })

      }
    })
  },
  judgeLogOn(e, type) {
    let _this = this
    if (wx.getStorageSync('login') != '') {
      this.setData({
        my_account_icon: wx.getStorageSync('userInfo').account_icon
      })
      return true
    }

    wx.getSetting({
      success(res) {
        console.log(">>>>>>>>>>>>>>>>>>")
        console.log(res)
        var authMap = res.authSetting;
        // if (authMap['scope.userInfo']) {
        //   _this.login(e, type)
        // }else{
        _this.setData({
          login_mask: true,
          log_in_data: e,
          log_in_type: type
        })
        // }
      }
    })
    return false
  },
  affirmToLogIn() {
    // console.log(e)
    // let data = e.currentTarget.dataset.item
    let _this = this
    this.setData({
      login_mask: false,
    })
    _this.login(_this.data.log_in_data, _this.data.log_in_type)
  },
  login(e, type) {

    let _this = this
    request.login(function (res) {
      _this.setData({
        account_info: res,
        show_loading: false,
        show_login_loading: false,
      });
      if (type == 'showToast') {
        _this.showToast(e)
      } else if (type == 'showToast1') {
        _this.showToast1(e)
      } else if (type == 'toMy') {
        _this.toMy(e)
      } else if (type == 'toHandBook') {
        _this.toHandBook(e)
      } else if (type == 'exchangeCard') {
        _this.exchangeCard(e)
      }
      
    }, this)

  },

  exchangeCard() {

    if (!this.judgeLogOn('', 'exchangeCard')) {
      return;
    }
    let _this = this
    request.echangeCardCode(this.data.exchange_card_code, function (res) {
      if (res.result == 0) {
        wx.navigateTo({
          url: '../card_detail/card_detail?show_exchange_toast=true&card_id=' + res.data.cardId
        })
      } else if (_this.data.change_show) {
        wx.showToast({
          title: "不存在的卡片",
          icon: 'none',
          duration: 2500
        })
      } else if (res.msg == '无法兑换自己的碎片码') {
        wx.showToast({
          title: "您无法兑换自己的碎片！",
          icon: 'none',
          duration: 2500
        })
      } else if (res.msg == '估值中的卡片无法兑换') {
        wx.showToast({
          title: "首发中的碎片无法兑换，请等待首发完成。",
          icon: 'none',
          duration: 2500
        })
      } else {
        wx.showToast({
          title: "兑换码错误或已被他人兑换，请检查后重新输入。",
          icon: 'none',
          duration: 2500
        })
      }
    })
  },
  toCardDetail(e) {
    let cardInfo = e.currentTarget.dataset.item
    // console.log
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + cardInfo.card_id
    })
  },
  showInputBox() {
    cardCode = this.data.exchange_card_code
    let content = '输入或粘贴碎片码，获取碎片'
    if (this.data.change_show) {
      content = '请输入关键字'
    }
    this.setData({
      input_place_holder: content,
      showComtBox: true,
      exchange_card_code1: this.data.exchange_card_code
    })
  },
  // 失去焦点
  comtBlur() {
    console.log('??????????????????????')
    this.setData({
      exchange_card_code: cardCode,
      showComtBox: false
    })
  },
  async getWindowData() {
    let h = await app.getSystemData('windowHeight')
    var SystemInfo = wx.getSystemInfoSync();
    this.setData({
      windowHeight: h,
      rpx_to_px: SystemInfo.windowWidth / 750
    })
  },
  async ctFocus(e) {
    // console.log(e)
    let {
      windowHeight
    } = this.data
    console.log('e', e)
    let keyboard_h = e.detail.height
    let ctInput_top = windowHeight - keyboard_h
    let ctInput_h = await app.queryNodes('#ctInput', 'height')
    console.log('ctInput_h', ctInput_h)
    // ctInput_h = 100 * this.data.rpx_to_px
    ctInput_top -= ctInput_h
    this.setData({
      ctInput_top: ctInput_top,
      keyboard_h: keyboard_h
    })
  },
  doneTap(e) {

  },
  codeInput(e) {
    cardCode = e.detail.value
  },
  pasteCardCode() {
    let _this = this
    wx.getClipboardData({
      success: (data) => {
        console.log(data)
        if (data.data.length > 19) {
          if (_this.data.change_show) {
            wx.showToast({
              title: "请输入正确关键字",
              icon: 'none',
              duration: 2500
            })
            return
          }
          wx.showToast({
            title: '请粘贴正确的碎片码',
            icon: "none"
          })
          return
        }
        _this.setData({
          exchange_card_code: data.data
        })
      },
    })
  }
})