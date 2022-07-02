// pages/badge_card/badge_card.js

var showCardInfoUtil = require('../common/utils/show_card_info_util.js');

let badgeInfo = {}
let badgeID = 0
let isGettingCard = false

var ctx_urils = require("../common/utils/ctx_utils");
let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    show_mask: false,
    data: {},
    contents: {
      backgroud_color: '#58B8B7',
      info_icon_urlj: '/pages/images/c_info_lv.png',
      info_title: '等级：17',
      info_content: '等级：表示该碎片的受欢迎程度。基于该碎片的点赞、想要、评论等互动越多，等级越高。',
      info_content2: '等级成长',
      icon1: "/pages/images/sr.png",
      icon_size: 40,
      icon2: "/pages/images/c_info_lv_black.png",
      icon3: "/pages/images/c_info_point_black.png",
      content3: "",
      content11: "+ 1",
      content12: "+ 222",
      content13: "+ 333",
      content21: "+ 444",
      content22: "+ 555",
      content23: "+ 666",
      content31: "+ 777",
      content32: "+ 888",
      content33: "+ 999",
      show_have_card: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      change_show: wx.getStorageSync('change_show')
    })

    badgeID = options.badge_id;
    console.log(badgeID)
    isGettingCard = false
    this.initBadgeList(badgeID)

    this.setData({
      not_have_card: false,
      show_have_card: false
    })

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
    this.initBadgeList(badgeID)
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
    if (this.data.change_show) {
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
  backList(e) {
    this.setData({
      show_mask: false
    })
  },
  showCardNum(e) {
    let cardInfo = e.detail.currentTarget.dataset.item

    this.setData({
      show_mask: true,
      contents: showCardInfoUtil.getShowCardNumContent(cardInfo)
    })

  },
  showCardLv(e) {
    let cardInfo = e.detail.currentTarget.dataset.item

    this.setData({
      show_mask: true,
      contents: showCardInfoUtil.getShowCardLvContent(cardInfo)
    })
  },
  showCardCPoint(e) {
    let cardInfo = e.detail.currentTarget.dataset.item


    this.setData({
      show_mask: true,
      contents: showCardInfoUtil.getShowCardCpContent(cardInfo)
    })
  },
  showAllInfo(e) {
    let cardInfo = e.detail.currentTarget.dataset.item
    this.setData({
      show_mask: true,
      contents: {
        backgroud_color: '#F46563',
        info_icon_urlj: '/pages/images/hot_white.png',
        info_icon_size: 100,
        info_icon_to_top_size: 15,
        info_title: '热门 No.' + cardInfo.hot_card_rank,
        info_content: '热门：入选碎片近期受到较多关注。其等级、C-point也成长较快。',
        info_content2: '碎片成长：',
        icon1: "/pages/images/sr.png",
        icon_size: 40,
        icon2: "/pages/images/c_info_lv_black.png",
        icon3: "/pages/images/c_info_point_black.png",
        content3: "",
        content11: "+ " + cardInfo.card_got_day1,
        content12: "+ " + cardInfo.card_lv_day1,
        content13: "+ " + cardInfo.card_cpoint_day1,
        content21: "+ " + cardInfo.card_got_day7,
        content22: "+ " + cardInfo.card_lv_day7,
        content23: "+ " + cardInfo.card_cpoint_day7,
        content31: "+ " + cardInfo.card_got_day30,
        content32: "+ " + cardInfo.card_lv_day30,
        content33: "+ " + cardInfo.card_cpoint_day30,
      }
    })
  },
  backLastPage(e) {
    wx.navigateBack({
      delta: 1
    })
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
        let prefix = ''
        if (__wxConfig.envVersion == 'develop') {
          prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
        } else {
          prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
        }
        wx.login({
          success(ress) {
            if (ress.code) {
              //发起网络请求
              let reqData = {
                account_icon: res.userInfo.avatarUrl,
                account_name: res.userInfo.nickName,
                code: ress.code
              }
              wx.request({
                url: prefix + 'account', //仅为示例，并非真实的接口地址
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
  initBadgeList(e) {
    if (isGettingCard) {
      return
    }
    isGettingCard = true
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    let _this = this
    wx.request({
      url: prefix + '' + e + '/card_badge', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        console.log(res)
        badgeInfo = res.data.data;

        for (let i = 0; i < badgeInfo.card_infos.length; i++) {
          badgeInfo.card_infos[i].images[0].image_zoom = 100
          if (badgeInfo.card_infos[i].images[0].vertical) {
            if (badgeInfo.card_infos[i].images[0].width > 400) {
              badgeInfo.card_infos[i].images[0].image_zoom = parseInt((400 / badgeInfo.card_infos[i].images[0].width) * 100)
            }
          } else {
            if (badgeInfo.card_infos[i].images[0].width > 400) {
              badgeInfo.card_infos[i].images[0].image_zoom = parseInt((400 / badgeInfo.card_infos[i].images[0].width) * 100)
            }
          }
          badgeInfo.card_infos[i] = ctx_urils.changeCardInfo(badgeInfo.card_infos[i], app.globalData.ctx)

        }


        wx.lin.renderWaterFlow(badgeInfo.card_infos, true);

        _this.setData({
          data: badgeInfo
        })
        isGettingCard = false
      }
    })
  },
  clikcListItem(e) {
    // console.log()
    let item = e.detail.currentTarget.dataset.item
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + item.card_id
    })
  },
  toTrueCardCardDetaile(e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + item.true_card_id
    })
  },
  toCoolection(e) {
    if (this.data.data.have_num == (this.data.data.sr_num + this.data.data.ssr_num)) {
      this.setData({
        show_mask3: true,
        contents: {
          card_name: this.data.data.true_card_name
        }
      })
      // this.exchangeTrueCardByBadge()
    } else {
      wx.navigateTo({
        url: '../map/map?reload=true'
      })
    }

  },
  affirmToExchange() {
    this.setData({
      show_mask3: false
    })
    this.exchangeTrueCardByBadge()
  },
  cancelToExchang() {
    this.setData({
      show_mask3: false
    })
  },
  exchangeTrueCardByBadge() {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    } else {
      return
    }
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    let _this = this
    wx.request({
      url: prefix + '' + this.data.data.true_card_id + '/collect_true_card_by_badge', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      success(res) {

        if (res.data.result == 0) {
          // wx.showToast({
          //   title: '兑换成功，请到\'拥有\'碎片中查看',
          //   icon:'none',
          //   duration:2000
          // })
          wx.navigateTo({
            url: '../card_detail/card_detail?card_id=' + _this.data.data.true_card_id + '&show_exchange_toast=true'
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        _this.initBadgeList(badgeID)
      }
    })
  }
})