// pages/hot_up/hot_up.js
let product = []
let isLogining = false
var ctx_urils = require("../common/utils/ctx_utils");
var showCardInfoUtil = require('../common/utils/show_card_info_util.js');
var filter = require("../common/utils/filter");
var request = require('../common/request.js');

let app = getApp()
let prefix = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    account_info: {
      last7_days_add_cpoint: 0,
      can_get_best_prize_num: 0
    },
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    this.setData({
      change_show: wx.getStorageSync('change_show')
    })
    this.getCardList()

    let userInfo
    if (wx.getStorageSync('login') != '') {
      userInfo = wx.getStorageSync('userInfo')
      this.setData({
        account_info: userInfo
      })
    } else {

    }

    if (options.share != undefined) {
      if (!this.judgeLogOn('', '')) {
        let content = {
          title: '登录后，您可以：',
          content: '收集碎片，兑换环球影城门票！'
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
    return {
      title: '收集碎片，就能兑换25块环球影城门票！',
      path: '/pages/map/map?share=true',
      imageUrl: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/share_image.png'
    }
  },
  backLastPage(e) {
    wx.navigateBack({
      delta: 1
    })
  },
  toMy() {
    if (!this.judgeLogOn('', 'toMy')) {
      return
    }

    filter.jumpToMePage(-1, 'to_tab=three')

  },
  getCardList() {
    let _this = this
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    wx.request({
      url: prefix + 'hot_up_card_list?page_size=50&page_num=' + '0', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        // pageNum++
        console.log(res)
        let newList = res.data.data
        if (newList.length == 0) {
          return
        }
        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)
        }
        product = product.concat(newList);
        wx.lin.renderWaterFlow(newList, false);
        _this.setData({
          loading: false
        })
      }
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
  showBadge(e) {
    let cardInfo = e.detail.currentTarget.dataset.item
    wx.navigateTo({
      url: '../badge_card/badge_card?badge_id=' + cardInfo.badge_id
    })

  },
  clikcListItem(e) {
    // console.log()
    let item = e.detail.currentTarget.dataset.item
    // let params = {
    //   // 参数放到外面,让代码更加清晰,可读,可维护性更高
    //   have_card: true,
    //   c_point: 125,
    //   my_c_point: 130,
    //   can_buy: true
    // };

    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + item.card_id
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
    request.login(function (res) {
      _this.setData({
        account_name: res.account_name,
        icon_url: res.account_icon,
        show_loading: false
      });
      _this.afterLogin(e, type)
    }, this)

    return false
  },
  afterLogin(e, type) {
    let _this = this
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
    } else if (type == 'toMy') {
      _this.toMy()
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
    } else if (type == 'to_me') {
      _this.toMy()
    } else if (type == 'add_card') {
      _this.addCard()
    } else if (type == 'get_card') {
      _this.getCard()
    } else if (type == 'ckickCard1') {
      _this.ckickCard1()
    } else if (type == 'ckickCard2') {
      _this.ckickCard2()
    } else if (type == 'ckickCard3') {
      _this.ckickCard3()
    } else if (type == 'heartBtn2') {
      _this.heartBtn2()
    } else if (type == 'starBtn2') {
      _this.starBtn2()
    }
  },
  judgeLogOn(e, type) {
    let _this = this
    if (wx.getStorageSync('login') != '') {
      this.setData({
        my_account_icon: wx.getStorageSync('userInfo').account_icon
      })
      return true
    }
    if (isLogining) {
      return false
    }
    wx.getSetting({
      success(res) {

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
    let _this = this
    this.setData({
      login_mask: false,
    })
    isLogining = true;
    _this.login(_this.data.log_in_data, _this.data.log_in_type)
  },
  login(e, type) {

    let _this = this

    request.login(function (res) {
      _this.setData({
        account_info: res,
        show_login_loading: false
      });
      _this.afterLogin(e, type)
      isLogining = false

    }, this)

  },
  backList(e) {
    this.setData({
      show_mask3: false,
      show_mask4: false,
      show_mask: false
    })
  },
 
})