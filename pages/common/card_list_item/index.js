// pages/components/layout/pages/water-flow/component/product/index.js
var canvas = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: Object,
    // item:Object,
    get_card_height: {
      type: Number,
      value: 579.5
    },
    sell_mult_card: Boolean,
    isSelf: {
      type: Boolean,
      value: true
    },
    change_show: Boolean,

  },

  /**
   * 组件的初始数据
   */
  data: {
    sell_check_box: false,
    sell_list: [],
    imgheight: 489 * (wx.getSystemInfoSync().windowWidth / 750),
    window_width_px: 367 * (wx.getSystemInfoSync().windowWidth / 750)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showCardNum: function (e) {

      console.log(e)
      this.triggerEvent('showCardNum', e)
    },
    showCardLv: function (e) {
      if (wx.getStorageSync('change_show')) {
        return
      }
      this.triggerEvent('showCardLv', e)
    },
    showCardCPoint: function (e) {
      if (wx.getStorageSync('change_show')) {
        return
      }
      this.triggerEvent('showCardCPoint', e)
    },
    showAllInfo: function (e) {

      this.triggerEvent('showAllInfo', e)
    },
    showBadge: function (e) {
      console.log(e)
      this.triggerEvent('showBadge', e)
    },
    clickListItem: function (e) {

      this.triggerEvent('clickListItem', e)
    },
    showSelfSellToast: function (e) {

      this.triggerEvent('showSelfSellToast', e)
    },

    likeCard: function (e) {
      if (!this.judgeLogOn(e, 'heart_card')) {
        return
      }
      let data = this.properties.data
      if (!data.liked) {
        data.liked = true
        data.like_num++
        this.setData({
          data: data
        })
        let resultReq = {
          card_id: data.card_id,
          liked: true,
        }
        this.likeCardReq(resultReq)
        wx.showToast({
          title: '点赞成功',
          icon: 'none'
        })
      } else {
        data.liked = false
        data.like_num--
        this.setData({
          data: data
        })
        let resultReq = {
          card_id: data.card_id,
          liked: false,
        }
        this.likeCardReq(resultReq)
        wx.showToast({
          title: '已取消点赞',
          icon: 'none'
        })
      }
      this.triggerEvent('likeCard', data)

    },
    likeCardReq(e) {
      let userInfo = wx.getStorageSync('userInfo')
      let _this = this
      let prefix = ''
      if (__wxConfig.envVersion == 'develop') {
        prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
      } else {
        prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
      }
      wx.request({
        url: prefix + 'card_liker', //仅为示例，并非真实的接口地址
        method: 'POST',
        data: e,
        header: {
          'wy-platform': 'mini_programe', // 默认值
          'Authorization': 'Bearer ' + userInfo.access_token
        },
        success(res) {
          console.log(res)

        }
      })
    },
    judgeLogOn(e, type) {
      let _this = this
      if (wx.getStorageSync('login') != '') {
        this.setData({
          my_acount_icon: wx.getStorageSync('userInfo').account_icon
        })
        return true
      }
      wx.getUserProfile({
        desc: '用于展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          wx.showLoading({
            title: '登陆中...',
            icon: 'none'
          })

          wx.login({
            success(ress) {
              if (ress.code) {
                //发起网络请求
                wx.hideLoading()
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
                      _this.likeCard(e)
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
    startSell() {
      this.setData({
        sell_check_box: true
      })
    },

    cancelSell() {
      this.setData({
        sell_check_box: false,
        sell_list: []
      })
    },
    updateSellList(list) {
      this.setData({
        sell_list: list
      })
    }
  },


});