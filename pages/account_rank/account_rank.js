// pages/account_rank/account_rank.js

let cardType = ''
var filter = require("../common/utils/filter");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    items: [{}, {}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      change_show: wx.getStorageSync('change_show')
    })

    let ranks = JSON.parse(options.ranks)
    cardType = options.card_type
    this.setData({
      card_type: cardType,
      items: ranks
    })


    if (options.share != undefined) {
      if (!this.judgeLogOn('', '')) {
        if (change_show) {

        }
        let content = {
          title: '登录后，您可以：',
          content: '收集碎片，兑换环球影城门票！'
        }
        if (change_show) {
          content = {
            title: '登录后，您可以：',
            content: '收集卡片，兑换环球影城门票！'
          }
        }
        this.setData({
          show_mask2: true,
          toast_data: content
        })
      }
    }
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
    if (change_show) {
      return {
        title: '收集卡片，就能兑换25块环球影城门票！',
        path: '/pages/map/map?share=true',
        imageUrl: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/share_image.png'
      }
    } else {
      return {
        title: '收集碎片，就能兑换25块环球影城门票！',
        path: '/pages/map/map?share=true',
        imageUrl: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/share_image.png'
      }
    }

  },
  backLastPage(e) {
    wx.navigateBack({
      delta: 1
    })
  },
  toAccountInfo(e) {

    filter.jumpToMePage(e.currentTarget.dataset.item, '')

  },
  clickAffirm(e) {
    this.judgeLogOn('', '')
    this.setData({
      show_mask2: false
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
    wx.getUserProfile({
      desc: '用于展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        _this.setData({
          show_loading: true,
          my_account_icon: res.userInfo.avatarUrl
        })

        wx.login({
          success(ress) {
            if (ress.code) {
              //发起网络请求
              let reqData = {
                account_icon: res.userInfo.avatarUrl,
                account_name: res.userInfo.nickName,
                code: ress.code
              }
              let prefix = ''
              if (__wxConfig.envVersion == 'develop') {
                prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
              } else {
                prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
              }
              wx.request({
                url: prefix+'account', //仅为示例，并非真实的接口地址
                method: 'POST',
                data: reqData,
                header: {
                  'wy-platform': 'mini_programe' // 默认值
                  // 'Authorization':'Bearer b3739cb5-2de1-492f-9d38-f0ef9c44b79b'
                },
                success(resss) {
                  console.log(resss)
                  wx.setStorageSync('userInfo', resss.data.data)
                  wx.setStorageSync('login', true)
                  _this.setData({
                    account_name: res.userInfo.nickName,
                    icon_url: res.userInfo.avatarUrl,
                    show_loading: false
                  });
                  if (type == 'main') {
                    _this.showComtBox()
                  } else if (type == 'reply') {
                    _this.mainCommentAction(e)
                  } else if (type == 'comment_like') {
                    _this.commentLike(e)
                  } else if (type == 'heart_card') {
                    _this.heartBtn(e)
                  } else if (type == 'star_card') {
                    _this.starBtn(e)
                  } else if (type == 'share_card') {
                    _this.judgeShare(e)
                  }
                }
              })
              console.log(res)
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })
      }
    })
    return false
  },
})