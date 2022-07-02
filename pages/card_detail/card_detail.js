// pages/card_detail/card_detail.js
const app = getApp()
var request = require("../common/request.js");
var ctxUtil = require("../common/utils/make_true_card_utils.js");
var showCardInfoUtil = require('../common/utils/show_card_info_util.js');
var trueCardRequest = require('../common/utils/make_true_card_utils.js');
var filter = require("../common/utils/filter");

let totalComments = []
let commentNum = 12
let judgeCOntentLineContext = ''

let listNowSHow = 0
let lastListNowSHow = 0
let lastListNowSHowPointStatus = 'down'


let commentType = "main"
let mainComment = ''
let nowClickType = 0 //1 分享  2 赠送  3 兑换C-point  4 兑换碎片
let heddenBtnTime = 0
let shareID = ''
let cardID = 0
let getTrueCard = ''
let qcCodeUrl = ''
let shareInfo = {
  image_url: '',
  is_share: false,
  share_type: 0
}
let exchangeTrueCardData = {
  phone: '',
  consignee: '',
  address: ''
}
let showExchangeToast
let getShareInfo = '';
let createShareImageResolve = ''
var showPickToast
let showCreateSquareToast
let showAssessToast
let toRankPage

let remindType = ''

let nowSelectCardPercent = 0 //长按抽碎片进度条百分比
let showSuccess = false //长按抽碎片当前状态
let selectCardTouching = false
let getCardLoadingInterval = '' //长按抽碎片进度定时器

let changeSquareInfo = {
  title: "",
  content: ""
}
let prefix = ''


Page({
  /**
   * 页面的初始数据
   */
  data: {
    no_qccode: false,
    show_mask2: false,
    current2: 0,
    badge_opacity: 1,
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    showComtBox: false,
    heart_btn_url: '/pages/images/heart_btn.png',
    star_btn_url: '/pages/images/start_btn.png',
    items: [], // 数据列表
    totalCommentNum: 0,
    top_status_bar_height: 0,
    imgheight: 0,
    loading: true,
    secodn_show: false,
    data: {},
    from_share: false,
    show_bottom_toast: false,
    btn_opacity: 1,
    current: 0,
    video_muted: false,
    video_muted_icon: '/pages/images/unmute.png',
    show_loading: false,
    my_account_icon: '/pages/images/default_account_icon.png',
    isCreateShareImage: false,
    show_big_img: false,
    top_bar_color: '#FFFFFF',
    top_bar_font_color: '#FFFFFF',
    true_card_now_show_list: [],
    true_card_wait: true,
    true_card_downloading: false,
    now_true_card_type: '[图片碎片]',
    show_true_card_img_url: '',
    show_true_card_video_url: '',
    show_true_card_img: false,
    show_true_card_video: false,
    true_card_url: '',
    show_img_card_animationData: '',
    show_exchange_card_second_step: false,
    options: {
      color: 'green',
      during: 2,
      height: 50,
      width: '100px',
      columnStyle: 'font-weight: normal',
    },
    show_notigication: false,
    notification_animation: '',
    notification_opacity: 0
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
    console.log(options)
    // wx.setStorageSync('mute', true)
    this.setData({
      change_show: wx.getStorageSync('change_show')
    })

    const canvas = wx.createOffscreenCanvas({
      type: '2d',
      width: 1,
      height: 1
    })
    // 获取 context。注意这里必须要与创建时的 type 一致
    remindType = ''
    judgeCOntentLineContext = canvas.getContext('2d')
    console.log(options)
    this.initalImgHeight()
    exchangeTrueCardData = {
      phone: '',
      consignee: '',
      address: ''
    }
    // card_id=' + this.data.data.card_id + "&share_id=" + shareID,
    cardID = options.card_id;
    var shareIDd = options.share_id;
    shareID = shareIDd

    showAssessToast = options.show_assess_toast

    showExchangeToast = options.show_exchange_toast

    showPickToast = options.show_pick_toast;

    showCreateSquareToast = options.show_create_suqare_toast

    toRankPage = options.to_rank_page

    if (shareID != undefined) {
      let ee = {
        share_id: shareID,
        share_type: options.share_type,
        share_account_id: options.share_account_id,
        card_id: options.card_id,
        type: options.share_type,
        card_type: options.card_type
      }
      this.setData({
        from_share: true
      })
      getShareInfo = ee
      this.judgeShare(ee)
      if (wx.getStorageSync('login') == '' && options.share_type == "0") {
        wx.setStorageSync('share_info', ee)
      }
    }
    this.setData({
      top_status_bar_height: getApp().globalData.statusBarHeight,
    })
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      this.setData({
        account_info: userInfo
      })
    } else {
      this.setData({
        account_info: {
          account_icon: 'https://weiyu-account-icon-1258021264.cos.ap-beijing.myqcloud.com/default_account_icon.png'
        }
      })
    }
    // this.judgeLogOn('', '')
    this.getSimple(cardID)
    this.initCommentData(cardID)
    this.hiddenBtn()
    app.setWatcher(this); // 设置监听器
  },
  watch: {
    isCreateShareImage: function (val, old) {
      // console.log('old, val==============');
      // console.log(old, val);
      if (createShareImageResolve != '') {
        let cardInfo = this.data.data
        let content = ''
        let getPercent = 1
        getPercent = Math.ceil(this.data.data.card_cpoint / 2500 * 100)
        if (getPercent == 0) {
          getPercent = 1
        }
        let contentString = ''
        if (this.data.data.title.length > 0) {
          contentString = this.data.data.title
        } else if (this.data.data.content.length > 0) {
          contentString = this.data.data.content
        }

        if (nowClickType != 2) {
          if (cardInfo.card_type == 'SSR' || cardInfo.card_type == 'SR' || cardInfo.card_type == 'BONUS') {
            if (contentString.length > 0) {
              if (contentString.length > 8) {
                content = '[' + contentString.substr(0, 8) + '...' + ']' + '价值' + cardInfo.card_cpoint + '，来拥有你的元宇宙一角吧！'
              } else {
                content = '[' + contentString + ']' + '价值' + cardInfo.card_cpoint + '，来拥有你的元宇宙一角吧！'
              }
            } else {
              content = '碎片' + '价值' + cardInfo.card_cpoint + '，来拥有你的元宇宙一角吧！'
            }
          } else if (cardInfo.card_type == 'FUNCATION') {
            if (contentString.indexOf('创造碎片') != -1) {
              content = '[创造碎片]  可用来创造您的碎片，尽享升值！'
            } else if (contentString.indexOf('扩块') != -1) {
              content = '[扩块碎片]  身边碎片Pick概率提高，聚集附近碎片！'
            } else if (contentString.indexOf('Plus') != -1) {
              content = '[Plus碎片]  在Pick时多得一块备选碎片，多中选优！'
            } else if (contentString.indexOf('远程') != -1) {
              content = '[远程碎片]  可以较高概率Pick任何位置的碎片，触手可及！'
            }
          } else if (cardInfo.card_type == 'TRUE_CARD') {
            if (contentString.length > 8) {
              content = '[' + contentString.substr(0, 8) + '...' + ']' + '价值' + cardInfo.card_cpoint + ' 可免费兑换实物！'
            } else {
              content = '[' + contentString + ']' + '价值' + cardInfo.card_cpoint + ' 可免费兑换实物！'
            }
          } else if (cardInfo.card_type == 'SQUARE') {
            if (contentString.length > 8) {
              content = '元宇宙地盘[' + contentString.substr(0, 8) + '...' + ']，也来拥有你的地盘吧！'
            } else {
              content = '元宇宙地盘[' + contentString + ']，也来拥有你的地盘吧！'
            }
          }
        } else if (nowClickType == 2) {
          if (cardInfo.card_type == 'SSR' || cardInfo.card_type == 'SR' || cardInfo.card_type == 'BONUS') {
            if (contentString.length > 0) {
              if (contentString.length > 8) {
                content = '送你一块碎片' + '[' + contentString.substr(0, 8) + '...' + ']' + '，来拥有你的元宇宙一角吧！'
              } else {
                content = '送你一块碎片' + '[' + contentString + ']' + '，来拥有你的元宇宙一角吧！'
              }
            } else {
              content = '送你一块碎片' + '，来拥有你的元宇宙一角吧！'
            }
          } else if (cardInfo.card_type == 'FUNCATION') {
            if (contentString.indexOf('创造碎片') != -1) {
              content = '送你1块[创造碎片]，可用来创造您的碎片，尽享升值！'
            } else if (contentString.indexOf('扩块') != -1) {
              content = '送你1块[扩块碎片]，身边碎片Pick概率提高，聚集附近碎片！'
            } else if (contentString.indexOf('Plus') != -1) {
              content = '送你1块[Plus碎片]，在Pick时多得一块备选碎片，多中选优！'
            } else if (contentString.indexOf('远程') != -1) {
              content = '送你1块[远程碎片]，可以较高概率Pick任何位置的碎片，触手可及！'
            }
          } else if (cardInfo.card_type == 'TRUE_CARD') {
            if (contentString.length > 8) {
              content = '送你一块[' + cardInfo.title.substr(0, 8) + '...' + ']' + ' 可免费兑换实物！'
            } else {
              content = '送你一块[' + cardInfo.title + ']' + ' 可免费兑换实物！'
            }
          } else if (cardInfo.card_type == 'SQUARE') {
            if (contentString.length > 8) {
              content = '送你元宇宙地盘[' + cardInfo.title.substr(0, 8) + '...' + '] 点击过户！['
            } else {
              content = '送你元宇宙地盘[' + cardInfo.title + '] 点击过户！'
            }
          }
        }


        let userInfo = wx.getStorageSync('userInfo')
        wx.hideLoading()
        createShareImageResolve({
          title: content,
          path: '/pages/card_detail/card_detail?card_id=' + this.data.data.card_id + "&share_id=" + shareID + '&share_type=' + shareInfo.share_type + '&share_account_id=' + userInfo.account_id + '&card_type=' + this.data.data.card_type,
          imageUrl: shareInfo.image_url
        })
      }
    }
  },
  initData(obj) {
    if (obj == null) {
      return
    }

    this.getWindowData();
    if (obj.collection_badge_id != undefined && obj.collection_badge_id != null && obj.collection_badge_id > 0) {
      this.initBadgeList(obj.collection_badge_id)
    }
    var imgwidth = 0,
      imgheight = 0,
      ratio = 0;
    //宽高比  
    // ratio = imgwidth / imgheight;
    for (let i = 0; i < obj.images.length; i++) {
      if (obj.images[i].height > imgheight) {
        imgwidth = obj.images[i].width
        imgheight = obj.images[i].height
      }
    }
    ratio = imgwidth / imgheight;
    // console.log(imgwidth, imgheight)
    //计算的高度值  
    var viewHeight = wx.getSystemInfoSync().windowWidth / ratio;
    var imgheight = viewHeight;
    var maxHeight = wx.getSystemInfoSync().windowWidth * 1.333
    if (obj.images[0].type == '"video"') {
      maxHeight = wx.getSystemInfoSync().windowWidth * 1.5
    }
    if (imgheight > maxHeight) {
      imgheight = maxHeight
    }
    imgheight = imgheight
    let conver_imgheight = imgheight - 120
    let heartBtnUlr = '/pages/images/heart_btn.png'
    let startBtnUlr = '/pages/images/start_btn.png'
    if (obj.liked) {
      heartBtnUlr = '/pages/images/heart_btn_selected.png'
    }
    if (obj.wanted) {
      startBtnUlr = '/pages/images/start_btn_selected.png'
    }
    if (showPickToast != undefined || showExchangeToast != undefined || showAssessToast != undefined) {
      if (showPickToast || showExchangeToast || showAssessToast) {
        obj.have_card_num--
      }
    }
    if (showPickToast) {
      obj.card_cpoint = obj.card_cpoint - 3
    }

    this.setData({
      imgheight: imgheight,
      conver_imgheight: conver_imgheight,
      data: obj,
      heart_btn_url: heartBtnUlr,
      star_btn_url: startBtnUlr,
      secodn_show: true
    })
    let _this = this
    setTimeout(function () {
      if (wx.getStorageSync('detail_have_pick') == '' &&
        wx.getStorageSync('new_open') &&
        obj.card_type == "SR" &&
        !obj.assessing) {
        console.log("d动画嘞")
        wx.setStorageSync('new_open', false)
        _this.showPickAntToast()
      }
    }, 1000)

    if (toRankPage) {
      this.toRankPage()
      toRankPage = false
    }

    setTimeout(function () {
      _this.changeNotification()
    }, 1000)

    if (showPickToast != undefined) {
      if (showPickToast) {
        setTimeout(function () {
          wx.showToast({
            title: '恭喜您，Pick成功，获取了这块宇宙碎片+1',
            icon: 'none',
            duration: 2000
          })
          _this.setData({
            show_have_card_ant: true
          }, function () {
            let failanimation = wx.createAnimation({
              duration: 4000, // 以毫秒为单位 
              timingFunction: 'liner',
              delay: 0,
              success: function (res) {}
            });
            _this.showAddCpAndPickAnt()
            failanimation.translateY(30).opacity(0).step()
            _this.setData({
              have_card_ant: failanimation
            })

            setTimeout(function () {
              obj.card_cpoint = obj.card_cpoint + 3
              obj.have_card_num++
              _this.setData({
                data: obj,
                have_card_ant: '',
                show_have_card_ant: false,
              })
            }, 3000)

          })
        }, 1500)
        showPickToast = false
      }
    }


    if (showAssessToast != undefined) {
      if (showAssessToast) {
        setTimeout(function () {
          wx.showToast({
            title: '恭喜您，首发认购成功，获取了这块宇宙碎片+1',
            icon: 'none',
            duration: 2000
          })
          _this.setData({
            show_have_card_ant: true
          }, function () {
            let failanimation = wx.createAnimation({
              duration: 4000, // 以毫秒为单位 
              timingFunction: 'liner',
              delay: 0,
              success: function (res) {}
            });
            // _this.showAddCpAndPickAnt()
            failanimation.translateY(30).opacity(0).step()
            _this.setData({
              have_card_ant: failanimation
            })

            setTimeout(function () {
              obj.card_cpoint = obj.card_cpoint + 3
              obj.have_card_num++
              _this.setData({
                data: obj,
                have_card_ant: '',
                show_have_card_ant: false,
              })
            }, 3000)

          })
        }, 1500)
        showAssessToast = false
      }
    }


    if (showExchangeToast != undefined) {
      if (showExchangeToast) {
        setTimeout(function () {
          wx.showToast({
            title: '恭喜您，兑换成功，获取了这块宇宙碎片+1',
            icon: 'none',
            duration: 2000
          })
          _this.setData({
            show_have_card_ant: true
          }, function () {
            let failanimation = wx.createAnimation({
              duration: 4000, // 以毫秒为单位 
              timingFunction: 'liner',
              delay: 0,
              success: function (res) {}
            });
            failanimation.translateY(30).opacity(0).step()
            _this.setData({
              have_card_ant: failanimation
            })

            setTimeout(function () {
              obj.have_card_num++
              _this.setData({
                data: obj,
                have_card_ant: '',
                show_have_card_ant: false,
              })

            }, 3000)

          })
        }, 1500)
        showExchangeToast = false
      }
    }

    if (showCreateSquareToast != undefined) {
      if (showCreateSquareToast) {
        if (_this.data.change_show) {
          _this.showToast('该卡片是您拥有地盘的唯一标识，请务必妥善保管！', 4000)

        } else {
          _this.showToast('该碎片是您拥有地盘的唯一标识，请务必妥善保管！如需要，可通过[赠送]功能交易或赠予他人，请谨慎操作！', 4000)

        }
        showCreateSquareToast = false
      }
    }

    setTimeout(function () {
      _this.setData({
        loading: false
      })
    }, 1000)
    this.showChangeSquareInfo(obj)
    this.judegeSHowChangeSquareToast()
    wx.createSelectorQuery()
      .select('#canvas')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
  },
  showPickAntToast() {
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
      setTimeout(function () {
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
    }

  },
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    });
  },
  // 激活焦点
  showComtBox() {

    commentType = "main"
    if (!this.judgeLogOn('', 'reply')) {
      return
    }
    this.setData({
      input_place_holder: "说点什么吧…",
      showComtBox: true
    })
  },
  // 失去焦点
  comtBlur() {
    this.setData({
      showComtBox: false
    })
  },
  async getWindowData() {
    let h = await app.getSystemData('windowHeight')
    this.setData({
      windowHeight: h
    })
  },
  async ctFocus(e) {
    let {
      windowHeight
    } = this.data
    let keyboard_h = e.detail.height
    let ctInput_top = windowHeight - keyboard_h
    let ctInput_h = await app.queryNodes('#ctInput', 'height')
    console.log(ctInput_h)
    ctInput_top -= ctInput_h

    this.setData({
      ctInput_top
    })
  },
  changeTabs(e) {
    console.log(e)
    console.log(e.detail.activeKey)
    if (e.detail.activeKey == 'one') {
      setTimeout(() => {
        wx.lin.flushSticky();
      }, 300);
    } else if (e.detail.activeKey == 'two') {
      setTimeout(() => {
        wx.lin.flushSticky();
      }, 300);
    } else {
      setTimeout(() => {
        wx.lin.flushSticky();
      }, 300);
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.initCommentData(this.data.data.card_id)
    if (wx.getStorageSync('mute')) {
      this.setData({
        video_muted: true,
        video_muted_icon: '/pages/images/mute.png',
      })
    } else {
      this.setData({
        video_muted: false,
        video_muted_icon: '/pages/images/unmute.png',
      })
    }
    this.getSimple(this.data.data.card_id)
    this.initCommentData(cardID)
    this.changeBadgeOpacity()
    if (shareInfo.is_share) {
      shareInfo.is_share = false
      this.setData({
        show_bottom_pop: false
      })
      if (shareInfo.share_type == 0) {
        wx.showToast({
          title: '分享成功，好友注册后CP+10',
          duration: 2500,
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '赠碎片成功，好友可领取1块此碎片',
          duration: 2500,
          icon: 'none'
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},
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
  sharePage(e) {
    this.onShareAppMessage()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    // if (res.from === 'button') {
    //   console.log("来自页面内转发按钮");
    //   console.log(res.target);
    // }
    // else {
    //   console.log("来自右上角转发菜单")
    // }
    console.log(e)
    let _this = this
    let userInfo = wx.getStorageSync('userInfo')
    var timestamp = Date.parse(new Date());
    let shareID = timestamp + '' + this.data.data.card_id + '' + userInfo.account_id
    let reqdata = {}
    shareInfo.is_share = true
    if (e.target == undefined) {
      reqdata = {
        share_id: shareID,
        card_id: this.data.data.card_id,
        share_account_id: userInfo.account_id,
        type: 0
      }
      shareInfo.share_type = 0
    } else if (e.target.dataset.id == 2) {
      reqdata = {
        share_id: shareID,
        card_id: this.data.data.card_id,
        share_account_id: userInfo.account_id,
        type: 1
      }
      shareInfo.share_type = 1
    } else {
      reqdata = {
        share_id: shareID,
        card_id: this.data.data.card_id,
        share_account_id: userInfo.account_id,
        type: 0
      }
      shareInfo.share_type = 0
    }
    wx.request({
      url: prefix + 'card_share', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: reqdata,
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        console.log(res)
      }
    })
    let getPercent = 1
    getPercent = Math.ceil(this.data.data.card_cpoint / 2500 * 100)
    if (getPercent == 0) {
      getPercent = 1
    }
    let contentString = ''
    if (this.data.data.title.length > 0) {
      contentString = this.data.data.title
    } else if (this.data.data.content.length > 0) {
      contentString = this.data.data.content
    }


    if (this.data.isCreateShareImage) {
      let cardInfo = this.data.data
      let content = ''

      if (nowClickType != 2) {
        if (cardInfo.card_type == 'SSR' || cardInfo.card_type == 'SR' || cardInfo.card_type == 'BONUS') {
          if (contentString.length > 0) {
            if (contentString.length > 8) {
              content = '[' + contentString.substr(0, 8) + '...' + ']' + '价值' + cardInfo.card_cpoint + '，来拥有你的元宇宙一角吧！'
            } else {
              content = '[' + contentString + ']' + '价值' + cardInfo.card_cpoint + '，来拥有你的元宇宙一角吧！'
            }
          } else {
            content = '碎片' + '价值' + cardInfo.card_cpoint + '，来拥有你的元宇宙一角吧！'
          }
        } else if (cardInfo.card_type == 'FUNCATION') {
          if (contentString.indexOf('创造碎片') != -1) {
            content = '[创造碎片]  可用来创造您的碎片，尽享升值！'
          } else if (contentString.indexOf('扩块') != -1) {
            content = '[扩块碎片]  身边碎片Pick概率提高，聚集附近碎片！'
          } else if (contentString.indexOf('Plus') != -1) {
            content = '[Plus碎片]  在Pick时多得一块备选碎片，多中选优！'
          } else if (contentString.indexOf('远程') != -1) {
            content = '[远程碎片]  可以较高概率Pick任何位置的碎片，触手可及！'
          }
        } else if (cardInfo.card_type == 'TRUE_CARD') {
          if (contentString.length > 8) {
            content = '[' + cardInfo.title.substr(0, 8) + '...' + ']' + '价值' + cardInfo.card_cpoint + ' 可免费兑换实物！'
          } else {
            content = '[' + cardInfo.title + ']' + '价值' + cardInfo.card_cpoint + ' 可免费兑换实物！'
          }
        } else if (cardInfo.card_type == 'SQUARE') {
          if (contentString.length > 8) {
            content = '元宇宙地盘[' + contentString.substr(0, 8) + '...' + ']，也来拥有你的地盘吧！'
          } else {
            content = '元宇宙地盘[' + contentString + ']，也来拥有你的地盘吧！'
          }
        }

      } else if (nowClickType == 2) {
        if (cardInfo.card_type == 'SSR' || cardInfo.card_type == 'SR' || cardInfo.card_type == 'BONUS') {
          if (contentString.length > 0) {
            if (contentString.length > 8) {
              content = '送你一块碎片' + '[' + contentString.substr(0, 8) + '...' + ']' + '，来拥有你的元宇宙一角吧！'
            } else {
              content = '送你一块碎片' + '[' + contentString + ']' + '，来拥有你的元宇宙一角吧！'
            }
          } else {
            content = '送你一块碎片' + '，来拥有你的元宇宙一角吧！'
          }
        } else if (cardInfo.card_type == 'FUNCATION') {
          if (contentString.indexOf('创造碎片') != -1) {
            content = '送你1块[创造碎片]，可用来创造您的碎片，尽享升值！'
          } else if (contentString.indexOf('扩块') != -1) {
            content = '送你1块[扩块碎片]，身边碎片Pick概率提高，聚集附近碎片！'
          } else if (contentString.indexOf('Plus') != -1) {
            content = '送你1块[Plus碎片]，在Pick时多得一块备选碎片，多中选优！'
          } else if (contentString.indexOf('远程') != -1) {
            content = '送你1块[远程碎片]，可以较高概率Pick任何位置的碎片，触手可及！'
          }
        } else if (cardInfo.card_type == 'TRUE_CARD') {
          if (contentString.length > 8) {
            content = '送你一块[' + cardInfo.title.substr(0, 8) + '...' + ']' + ' 可免费兑换实物！'
          } else {
            content = '送你一块[' + cardInfo.title + ']' + ' 可免费兑换实物！'
          }
        } else if (cardInfo.card_type == 'SQUARE') {
          if (contentString.length > 8) {
            content = '送你元宇宙地盘[' + cardInfo.title.substr(0, 8) + '...' + '] 点击过户！['
          } else {
            content = '送你元宇宙地盘[' + cardInfo.title + '] 点击过户！'
          }
        }

      }
      return {
        title: content,
        path: '/pages/card_detail/card_detail?card_id=' + this.data.data.card_id + "&share_id=" + shareID + '&share_type=' + shareInfo.share_type + '&share_account_id=' + userInfo.account_id + '&card_type=' + this.data.data.card_type,
        imageUrl: shareInfo.image_url
      }
    } else {
      return new Promise((resolve, reject) => {
        wx.showLoading({
          title: '正在生成分享数据...',
          icon: 'none'
        })
        createShareImageResolve = resolve
      })
    }

  },
  shareBtn(e) {
    if (!this.judgeLogOn(e, 'share_card')) {
      return
    }
    nowClickType = 1
    this.setData({
      popup_data: {
        type_icon: '/pages/images/share_btn1.png',
        title: '分享碎片',
        content1: '好友点击您的分享，您就可获得',
        content2: 'CP+10',
        show_icon1: false,
        content3: '',
        content4: '',
        show_icon2: false,
        content5: '',
        content6: 120,
        show_have_c_point: false,
        type: 1
      },
      show_bottom_pop: true
    })
  },
  heartBtn(e) {
    if (!this.judgeLogOn(e, 'heart_card')) {
      return
    }
    let data = this.data.data
    if (!data.liked) {
      data.liked = true
      data.like_num++
      this.setData({
        heart_btn_url: '/pages/images/heart_btn_selected.png',
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
        heart_btn_url: '/pages/images/heart_btn.png',
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

    this.updateListItem(data)
  },
  likeCardReq(e) {
    let userInfo = wx.getStorageSync('userInfo')

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
  starBtn(e) {
    if (!this.judgeLogOn(e, 'star_card')) {
      return
    }
    let data = this.data.data

    if (!data.wanted) {
      data.wanted = true
      data.want_num++
      this.setData({
        star_btn_url: '/pages/images/start_btn_selected.png',
        data: data
      })
      let resultReq = {
        card_id: data.card_id,
        liked: true,
      }
      this.wantCardReq(resultReq)
      wx.showToast({
        title: '已添加到想要列表',
        icon: 'none'
      })
    } else {
      data.wanted = false
      data.want_num--
      this.setData({
        star_btn_url: '/pages/images/start_btn.png',
        data: data
      })
      let resultReq = {
        card_id: data.card_id,
        liked: false,
      }
      this.wantCardReq(resultReq)
      wx.showToast({
        title: '已从想要列表移除',
        icon: 'none'
      })
    }

    this.updateListItem(data)

  },
  wantCardReq(e) {
    let userInfo = wx.getStorageSync('userInfo')

    wx.request({
      url: prefix + 'card_want', //仅为示例，并非真实的接口地址
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
  initCommentData(card_id) {
    let _this = this

    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    wx.request({
      url: prefix + '' + card_id + '/all_comments', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        console.log(res)
        totalComments = res.data.data.list;
        let totalCommentNum = 0;
        for (let i = 0; i < totalComments.length; i++) {
          totalCommentNum++;
          totalCommentNum = totalCommentNum + totalComments[i].reply_comment.length
          // product[i].ratio=product[i].images[0].height/product[i].images[0].width
        }
        _this.setData({
          items: totalComments,
          totalCommentNum: totalCommentNum
        })
      }
    })
  },
  sentComment(e) {
    let _this = this
    let userInfo = wx.getStorageSync('userInfo')
    if (wx.getStorageSync('login') == '') {
      return
    }
    if (e.detail.value == '') {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none'
      })
      return
    }

    let newComment = ''
    if (commentType == 'main') {
      newComment = {
        content: e.detail.value,
        reply_comment_id: -1
      }
    } else {
      console.log(mainComment)
      newComment = {
        content: e.detail.value,
        reply_comment_id: mainComment.id
      }
    }
    wx.request({
      url: prefix + '' + this.data.data.card_id + '/comments', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: newComment,
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        let comment = {
          id: res.data.data.id,
          account_name: userInfo.account_name,
          account_icon: userInfo.account_icon,
          owner_inscription: false,
          content: e.detail.value,
          create_time: Date.parse(new Date()),
          reply_comment: [],
          like_count: 0,
          owner_inscription: res.data.data.owner_inscription
        }
        let cardInfo = _this.data.data
        if (!cardInfo.have_self_inscription && cardInfo.have_card_num > 0) {
          comment.owner_inscription = true
          cardInfo.have_self_inscription = true
          _this.setData({
            data: cardInfo
          })
        }
        if (commentType == 'main') {
          let commentss = [comment]
          commentss = commentss.concat(totalComments)
          totalComments = commentss
          let totalCommentNum = _this.data.totalCommentNum
          totalCommentNum++
          _this.setData({
            totalCommentNum: totalCommentNum,
            items: commentss
          })
        } else {
          comment = {
            comment_id: res.data.data.id,
            reply_account_name: userInfo.account_name,
            reply_account_icon: userInfo.account_icon,
            reply_comment_id: mainComment.id,
            owner: false,
            content: e.detail.value,
            create_time: Date.parse(new Date()),
            reply_comment: [],
            like_count: 0,
            owner_inscription: res.data.data.owner_inscription
          }
          let commentss = [comment]

          commentss = commentss.concat(mainComment.reply_comment)
          console.log(commentss)
          mainComment.reply_comment = commentss
          for (let i = 0; i < totalComments.length; i++) {
            let item = totalComments[i]
            if (item.id == mainComment.id) {
              totalComments.splice(i, 1, mainComment)
            }
          }
          let totalCommentNum = _this.data.totalCommentNum
          totalCommentNum++
          _this.setData({
            totalCommentNum: totalCommentNum,
            items: totalComments
          })

        }
        if (comment.owner_inscription) {
          wx.showToast({
            title: '题词成功，会在他人收集碎片时显示该题词',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '发表评论成功',
            icon: 'none'
          })
        }
      }
    })
  },
  mainCommentAction(e) {
    console.log(e)
    commentType = "reply"
    if (!this.judgeLogOn(e, 'main')) {
      return
    }
    mainComment = e.currentTarget.dataset.item
    this.setData({
      input_place_holder: "回复  @" + mainComment.account_name + ":",
      showComtBox: true
    })
  },
  replyCommentAction(e) {
    console.log(e)
  },
  getCard(e) {

    if (this.data.btn_opacity == 0.4) {
      let _this = this
      _this.setData({
        btn_opacity: 1
      })
      this.hiddenBtn()
    } else {
      this.hiddenBtn()
    }
    if (!this.judgeLogOn(e, 'exchange_card')) {
      return
    }



    if (this.data.data.card_type == 'TRUE_CARD') {
      if (this.data.data.have_card_num > 0) {
        wx.showToast({
          title: '[实物碎片]无法兑换为C-point',
          icon: 'none'
        })
        return
      }
    }

    if (this.data.data.card_type == 'FUNCATION') {
      if (this.data.data.have_card_num > 0) {
        wx.showToast({
          title: '[功能碎片]无法兑换为C-point',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '[功能碎片]无法购买',
          icon: 'none'
        })
      }
      return
    }

    if (this.data.data.card_type == 'SQUARE') {
      if (this.data.data.have_card_num > 0) {
        wx.showToast({
          title: '[地盘碎片]无法兑换为C-point',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '[地盘碎片]无法购买',
          icon: 'none'
        })
      }
      return
    }

    if (this.data.data.card_id == 804) {
      if (this.data.data.have_card_num <= 0) {
        wx.showToast({
          title: '[宇宙安家费]无法购买',
          icon: 'none'
        })
        return
      }

    }


    if (this.data.data.assessing) {
      if (this.data.data.have_card_num > 0) {
        wx.showToast({
          title: '宇宙首发中的碎片无法兑换为C-point',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '宇宙首发中的碎片无法购买',
          icon: 'none'
        })
      }
      return
    }

    if (this.data.data.self && this.data.data.can_sell_num <= 0 && this.data.data.have_card_num > 0) {
      if (this.data.change_show) {
        this.showToast("自己创造的卡片至多售出3块\n剩余碎片可以继续持有或交换", 2000)
      } else {
        this.showToast("自己创造的碎片至多售出3块\n剩余碎片可以继续持有或交换", 2000)
      }
      return
    }


    let cardInfo = this.data.data
    let title = '碎片'
    if (cardInfo.title.length > 0) {
      title = cardInfo.title
    } else if (cardInfo.content.length > 0) {
      title = cardInfo.content
    }
    if (title.length > 8) {
      title = title.substring(0, 9) + '...'
    }
    if (this.data.data.have_card_num > 0) {
      if (!this.data.data.can_sell) {
        wx.showToast({
          title: '自己创造的碎片，最多兑换3块',
          icon: 'none'
        })
        return
      }
      this.setData({
        popup_data: {
          type_icon: '/pages/images/c_point.png',
          title: '兑换C-point',
          content1: '将1块',
          content2: '[' + title + ']',
          show_icon1: false,
          content3: '兑换为 ',
          content4: cardInfo.card_cpoint,
          show_icon2: true,
          content5: '',
          content6: this.data.account_info.cpoint,
          show_have_c_point: true,
          type: 3
        },
        show_bottom_pop: true
      })
    } else {
      let getCPoint = cardInfo.card_cpoint * 1.25
      getCPoint = Math.ceil(getCPoint)
      if (this.data.data.card_type == 'TRUE_CARD') {
        getCPoint = cardInfo.card_cpoint
      }
      this.setData({
        popup_data: {
          type_icon: '/pages/images/c_point.png',
          title: '兑换碎片',
          content1: '消耗 ',
          content2: '' + getCPoint,
          show_icon1: true,
          content3: '兑换1块',
          content4: '[' + title + ']',
          show_icon2: false,
          content5: '',
          content6: this.data.account_info.cpoint,
          show_have_c_point: true,
          type: 4
        },
        show_bottom_pop: true
      })
    }

  },
  sendCard(e) {
    if (this.data.btn_opacity == 0.4) {
      let _this = this
      _this.setData({
        btn_opacity: 1
      })
      this.hiddenBtn()
    } else {
      this.hiddenBtn()
    }
    if (!this.judgeLogOn(e, 'gift')) {
      return
    }
    if (this.data.data.card_id == 804) {
      wx.showToast({
        title: '宇宙安家费无法赠送',
        icon: 'none'
      })
      return
    }
    if (this.data.data.assessing) {
      wx.showToast({
        title: '宇宙首发中的碎片无法赠送他人',
        icon: 'none'
      })
      return
    }


    if (this.data.data.have_card_num <= 0) {
      wx.showToast({
        title: '您还未拥有这块碎片，无法赠送他人',
        icon: 'none'
      })
      return
    }
    nowClickType = 2
    this.setData({
      popup_data: {
        type_icon: '/pages/images/get_card2.png',
        title: '赠送碎片',
        content1: '把碎片赠送给好友。好友领取后，',
        content2: '您将失去1块该碎片',
        show_icon1: false,
        content3: '',
        content4: '',
        show_icon2: false,
        content5: '',
        content6: 120,
        show_have_c_point: false,
        type: 2
      },
      show_bottom_pop: true
    })

  },
  affirm(e) {
    console.log(e)
    let content = ''
    if (e.currentTarget.dataset.id == 1) {
      content = '分享碎片成功！'
      this.setData({
        show_bottom_pop: false
      })
      wx.showToast({
        title: content,
        icon: 'none'
      })
    } else if (e.currentTarget.dataset.id == 2) {
      content = '赠送碎片成功！'
      this.setData({
        show_bottom_pop: false
      })
      wx.showToast({
        title: content,
        icon: 'none'
      })
    } else if (e.currentTarget.dataset.id == 3) {
      this.sellCard()
    } else if (e.currentTarget.dataset.id == 4) {
      let getCPoint = this.data.data.card_cpoint * 1.25
      getCPoint = Math.ceil(getCPoint)
      if (this.data.data.card_type == 'TRUE_CARD') {
        getCPoint = this.data.data.card_cpoint
      }
      if (getCPoint > this.data.account_info.cpoint) {
        wx.showToast({
          title: '您的C-point不足' + getCPoint + '，无法兑换',
          icon: 'none'
        })
        return
      }

      this.exchangeCard()
    }

  },
  exchangeCard() {
    let _this = this
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }

    wx.request({
      url: prefix + '' + this.data.data.card_id + '/exchange_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      success(res) {
        if (res.data.result == 0) {
          _this.setData({
            show_bottom_pop: false
          })
          _this.getAccountInfo('', '')
          let cpointNum = _this.data.data.card_cpoint
          cpointNum = Math.ceil(cpointNum * 1.25)
          _this.getSimple(_this.data.data.card_id)

          wx.showToast({
            title: '兑换碎片成功,C-point-' + cpointNum,
            icon: 'none'
          })
        } else {
          _this.setData({
            show_toast: true,
            toast_content: res.data.msg,
            toast_durantion: 2500
          })
          // wx.showToast({
          //   title: res.data.msg,
          //   icon: 'none'
          // })
        }

      }
    })
  },
  sellCard() {
    let _this = this
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    wx.request({
      url: prefix + '' + this.data.data.card_id + '/sell_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      success(res) {
        if (res.data.result == 0) {
          _this.setData({
            show_bottom_pop: false
          })
          _this.getAccountInfo('', '')
          let cpointNum = _this.data.data.card_cpoint
          _this.getSimple(_this.data.data.card_id)
          wx.showToast({
            title: '兑换成功,C-point+' + cpointNum,
            icon: 'none'
          })
          if (_this.data.data.card_id == 804) {
            _this.setData({
              show_sold_toast: true
            })
          }
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }

      }
    })
  },
  cancel(e) {
    this.setData({
      show_bottom_pop: false
    })
  },
  showIdToast(e) {
    wx.showToast({
      title: '唯一碎片编号，每块碎片都不同呦',
      icon: 'none'
    })
  },
  clickAccount1(e) {
    wx.showToast({
      title: '第1还没有人，快来收集它',
      icon: 'none'
    })
  },
  clickAccount2(e) {
    wx.showToast({
      title: '第2还没有人，快来收集它',
      icon: 'none'
    })
  },
  clickAccount3(e) {
    wx.showToast({
      title: '第3还没有人，快来收集它',
      icon: 'none'
    })
  },
  hiddenBtn() {
    if (heddenBtnTime != 0) {
      heddenBtnTime = 5000
    } else {
      heddenBtnTime = 5000
      this.hiddenBtnTimer()
    }
  },
  hiddenBtnTimer() {
    let _this = this
    setTimeout(function (e) {
      heddenBtnTime = heddenBtnTime - 500
      if (heddenBtnTime <= 0) {
        _this.setData({
          btn_opacity: 0.4,
        })
        heddenBtnTime = 0
      } else {
        _this.hiddenBtnTimer()
      }
    }, 500)
  },
  swiperChange(e) {
    // console.log(e)
    this.setData({
      current: e.detail.current
    })

  },
  changeMute(e) {
    if (this.data.video_muted) {
      wx.setStorageSync('mute', false)
      this.setData({
        video_muted: false,
        video_muted_icon: '/pages/images/unmute.png'
      })
    } else {
      wx.setStorageSync('mute', true)
      this.setData({
        video_muted: true,
        video_muted_icon: '/pages/images/mute.png'
      })
    }
  },
  playVideo() {
    app.globalData.card_info = this.data.data
    wx.navigateTo({
      url: '../play_video/play_video'
    })
    // wx.navigateTo({
    //   url: '../../packageA/pages/clipe_medio?obj=' + JSON.stringify(this.data.data)
    // })
  },
  judgeLogOn(e, type) {
    let _this = this

    if (wx.getStorageSync('login') != '') {
      this.setData({
        my_account_icon: wx.getStorageSync('userInfo').account_icon
      })
      return true
    }

    // wx.getSetting({
    //   success(res) {
    //     console.log(">>>>>>>>>>>>>>>>>>")
    //     console.log(res)
    //     var authMap = res.authSetting;
    //     if (getShareInfo != '') {
    //       _this.setData({
    //         login_mask: true,
    //         log_in_data: e,
    //         log_in_type: type
    //       })
    //     }
    //   }
    // })
    if (getShareInfo == '') {
      _this.setData({
        login_mask: true,
        log_in_data: e,
        log_in_type: type
      })
    }
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
    if (wx.getStorageSync('login')) {
      return
    }
    let _this = this
    request.login(function (res) {
      _this.setData({
        account_info: res,
        show_loading: false,
        show_login_loading: false,
      });
      _this.afterLogin(e, type)
    }, this)

  },
  commentLike(e) {
    if (!this.judgeLogOn(e, 'comment_like')) {
      return
    }
    let commentInfo = e.currentTarget.dataset.item
    console.log(totalComments)
    for (let i = 0; i < totalComments.length; i++) {
      if (commentInfo.reply_comment_id == undefined) {
        console.log("1111111111")
        if (totalComments[i].id == commentInfo.id) {
          let reqResult = {
            reply_comment_id: -1,
            card_id: this.data.data.card_id,
            comment_id: totalComments[i].id
          }
          if (totalComments[i].like) {
            totalComments[i].like = false
            totalComments[i].like_count--
            reqResult.like_comment = false
            this.likeComentReq(reqResult)
          } else {
            totalComments[i].like = true
            totalComments[i].like_count++
            reqResult.like_comment = true
            this.likeComentReq(reqResult)
          }
        }
      } else {
        console.log("3333")
        if (totalComments[i].id == commentInfo.reply_comment_id) {
          for (let n = 0; n < totalComments[i].reply_comment.length; n++) {
            if (totalComments[i].reply_comment[n].comment_id == commentInfo.comment_id) {
              console.log("222222")
              let reqResult = {
                reply_comment_id: commentInfo.reply_comment_id,
                card_id: this.data.data.card_id,
                comment_id: commentInfo.comment_id
              }
              if (totalComments[i].reply_comment[n].like) {
                totalComments[i].reply_comment[n].like = false
                totalComments[i].reply_comment[n].like_count--
                reqResult.like_comment = false
                this.likeComentReq(reqResult)
              } else {
                totalComments[i].reply_comment[n].like = true
                totalComments[i].reply_comment[n].like_count++
                reqResult.like_comment = true
                this.likeComentReq(reqResult)
              }
            }
          }
        }
      }
    }
    this.setData({
      items: totalComments
    })
    console.log(e)
  },
  likeComentReq(e) {
    let userInfo = wx.getStorageSync('userInfo')

    wx.request({
      url: prefix + 'comments_liker', //仅为示例，并非真实的接口地址
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
  init(res) {
    let _this = this
    console.log(res)
    let beishu = 8
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    canvas.width = beishu * 250;
    canvas.height = beishu * 200
    if (_this.data.data.images[0].vertical) {
      ctxUtil.createShareVerticalImage(ctx, canvas, this.data.data, _this, function (res) {
        wx.canvasToTempFilePath({ //将canvas生成图片
          canvas: canvas,
          x: 0,
          y: 0,
          destWidth: beishu * 250,
          destHeight: beishu * 200,
          quality: 1,
          success: function (res) {
            console.log('生成图片成功：', res)
            shareInfo.image_url = res.tempFilePath
            _this.setData({
              isCreateShareImage: true
            })
          },
        }, _this)

      })
      // this.createVerticalImage(ctx, canvas)
    } else {
      ctxUtil.createHorizontalImage(ctx, canvas, this.data.data, _this, function () {
        wx.canvasToTempFilePath({ //将canvas生成图片
          canvas: canvas,
          x: 0,
          y: 0,
          destWidth: beishu * 250,
          destHeight: beishu * 200,
          quality: 1,
          success: function (res) {
            console.log('生成图片成功：', res)
            shareInfo.image_url = res.tempFilePath
            _this.setData({
              isCreateShareImage: true
            })
          },
        }, _this)
      })
      // this.createHorizontalImage(ctx, canvas)
    }
  },

  /**该方法用来绘制圆角矩形 
   *@param cxt:canvas的上下文环境 
   *@param x:左上角x轴坐标 
   *@param y:左上角y轴坐标 
   *@param width:矩形的宽度 
   *@param height:矩形的高度 
   *@param radius:圆的半径 
   *@param lineWidth:线条粗细 
   *@param strokeColor:线条颜色 
   **/
  strokeRoundRect(cxt, x, y, width, height, radius, /*optional*/ lineWidth, /*optional*/ strokeColor) {
    //圆的直径必然要小于矩形的宽高          
    if (2 * radius > width || 2 * radius > height) {
      return false;
    }

    cxt.save();
    cxt.translate(x, y);
    //绘制圆角矩形的各个边  
    drawRoundRectPath(cxt, width, height, radius);
    cxt.lineWidth = lineWidth || 2; //若是给定了值就用给定的值否则给予默认值2  
    cxt.strokeStyle = strokeColor || "#000";
    cxt.stroke();
    cxt.restore();
  },

  /**
   * 微信小程序canvas绘制圆觉圆角角片
   * @param 图片宽 imageWidth 
   * @param 图片高 imageHeight 
   * @param x坐标 pointX 
   * @param y坐标 pointY 
   * @param 图片路径 iamgePath 
   */
  drawRoundImage(ctx, pointX, pointY, width, height, imageCorner, iamgePath, imageWidth, imageHeight) {
    // cxt, x, y, width, height, radius, /*optional*/ fillColor
    console.log(width)
    console.log(height)
    console.log(pointX)
    console.log(pointY)
    console.log(imageCorner)
    console.log(iamgePath)

    // 绘制海报背景图片圆角
    ctx.save()
    ctx.beginPath()
    ctx.arc(pointX + imageCorner, pointY + imageCorner, imageCorner, Math.PI, Math.PI * 1.5)
    ctx.arc(pointX + width - imageCorner, pointY + imageCorner, imageCorner, Math.PI * 1.5, Math.PI * 2)
    ctx.arc(pointX + width - imageCorner, pointY + height - imageCorner, imageCorner, 0, Math.PI * 0.5)
    ctx.arc(pointX + imageCorner, pointY + height - imageCorner, imageCorner, Math.PI * 0.5, Math.PI)
    ctx.clip()

    let imgWidth = imageWidth
    let imgHeight = imageHeight
    // if(this.data.data.images[0].type='video'){
    //   imgWidth = this.data.data.images[0].width/(960/512)
    //   imgHeight = this.data.data.images[0].height/(960/512)
    // }

    let dw = width / imgWidth
    let dh = height / imgHeight
    if (imgWidth > width && imgHeight > height || imgWidth < width && imgHeight < height) {
      if (dw > dh) {
        ctx.drawImage(iamgePath, 0, (imgHeight - height / dw) / 2, imgWidth, height / dw, pointX, pointY, width, height)
      } else {
        ctx.drawImage(iamgePath, (imgWidth - width / dh) / 2, 0, width / dh, imgHeight, pointX, pointY, width, height)
      }
    } else {
      if (imgWidth < width) {
        ctx.drawImage(iamgePath, 0, (imgHeight - height / dw) / 2, imgWidth, height / dw, pointX, pointY, width, height)
      } else {
        ctx.drawImage(iamgePath, (imgWidth - width / dh) / 2, 0, width / dh, imgHeight, pointX, tpointYop, width, height)
      }
    }
    // ctx.drawImage(iamgePath, pointX, pointY, imageWidth, imageHeight)
    // 恢复之前保存的绘图上下文
    ctx.restore()
  },
  drawWord(cxt, x, y, size, /*optional*/ fillColor, content) {
    cxt.font = 'bold ' + size + 'px Arial';
    cxt.textAlign = 'center';
    cxt.textBaseline = 'middle';
    cxt.fillStyle = fillColor;
    cxt.fillText(content, x, y);

  },
  addShadow(ctx, x, y, size, color) {
    // 阴影的y偏移
    ctx.shadowOffsetY = y;
    ctx.shadowOffsetX = x;
    // 阴影颜色
    ctx.shadowColor = color;
    // 阴影的模糊半径
    ctx.shadowBlur = size;
  },
  clearShadow(ctx) {
    this.addShadow(ctx, 0, 0, 0, 'rgba(0,0,0,0)')
  },

  fillLeftBottomRoundRect(cxt, x, y, width, height, radius, /*optional*/ fillColor) {
    //圆的直径必然要小于矩形的宽高          
    if (2 * radius > width || 2 * radius > height) {
      return false;
    }

    cxt.save();
    cxt.translate(x, y);
    //绘制圆角矩形的各个边  
    this.drawLeftBottomRoundRectPath(cxt, width, height, radius);
    cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
    cxt.fill();
    cxt.restore();
  },
  drawLeftBottomRoundRectPath(cxt, width, height, radius) {
    cxt.beginPath(0);
    //从右下角顺时针绘制，弧度从0到1/2PI  
    cxt.arc(width - 0, height - 0, 0, 0, Math.PI / 2);

    //矩形下边线  
    cxt.lineTo(radius / 2, height);

    //左下角圆弧，弧度从1/2PI到PI  
    cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

    //矩形左边线  
    cxt.lineTo(0, radius / 2);

    //左上角圆弧，弧度从PI到3/2PI  
    cxt.arc(0, 0, 0, Math.PI, Math.PI * 3 / 2);

    //上边线  
    cxt.lineTo(width - 0, 0);

    //右上角圆弧  
    cxt.arc(width - 0, 0, 0, Math.PI * 3 / 2, Math.PI * 2);

    //右边线  
    cxt.lineTo(width, height - 0);
    cxt.closePath();
  },
  fillRightBottomRoundRect(cxt, x, y, width, height, radius, /*optional*/ fillColor) {
    //圆的直径必然要小于矩形的宽高          
    if (2 * radius > width || 2 * radius > height) {
      return false;
    }

    cxt.save();
    cxt.translate(x, y);
    //绘制圆角矩形的各个边  
    this.drawRightBottomRoundRectPath(cxt, width, height, radius);
    cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
    cxt.fill();
    cxt.restore();
  },
  drawRightBottomRoundRectPath(cxt, width, height, radius) {
    cxt.beginPath(0);
    //从右下角顺时针绘制，弧度从0到1/2PI  
    cxt.arc(width - radius, height - radius, radius, radius, Math.PI / 2);

    //矩形下边线  
    cxt.lineTo(radius / 2, height);

    //左下角圆弧，弧度从1/2PI到PI  
    cxt.arc(0, height - 0, 0, Math.PI / 2, Math.PI);

    //矩形左边线  
    cxt.lineTo(0, 0);

    //左上角圆弧，弧度从PI到3/2PI  
    cxt.arc(0, 0, 0, Math.PI, Math.PI * 3 / 2);

    //上边线  
    cxt.lineTo(width - 0, 0);

    //右上角圆弧  
    cxt.arc(width - 0, 0, 0, Math.PI * 3 / 2, Math.PI * 2);

    //右边线  
    cxt.lineTo(width, height - radius / 2);
    cxt.closePath();
  },

  getSimple(cardID) {
    if (cardID == undefined) {
      return
    }
    let _this = this
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    wx.request({
      url: prefix + '' + cardID + '/simple_card', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        console.log(res)
        let cardInfo = res.data.data;


        _this.updateListItem(cardInfo)
        _this.initData(cardInfo)

      }
    })
  },
  judgeShare(e) {
    if (!this.judgeLogOn(e, 'share_card')) {
      let content = {
        top_bg: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/toast_top_bg3.png'
      }
      if (e.share_type == 0) {
        content.title = '新用户登录后，您和分享人都获得:'
        content.content = 'CP+10'
      } else {
        content.title = '登录后，您可以:'
        if (this.data.data.card_type == 'SQUARE') {
          content.content = '领取好友赠送的地盘'
        } else {
          content.content = '领取好友赠送的碎片'
        }
      }
      this.setData({
        show_mask2: true,
        toast_data: content
      })
      return
    }
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }

    let _this = this
    wx.request({
      url: prefix + 'card_share', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: e,
      success(res) {
        console.log(res)
        if (res.data.result == 0) {
          if (res.data.msg.indexOf("获得卡片赠送成功") != -1) {
            _this.getSimple(cardID)
            let content = {
              title: '恭喜你，获得：',
              content: '1块好友赠送的碎片',
              top_bg: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/toast_top_bg3.png'
            }
            if (e.card_type == 'SQUARE') {
              content.content = '1块好友赠送的地盘'
            }
            _this.setData({
              show_mask2: true,
              toast_data: content
            })


          } else if (res.data.msg.indexOf("手慢了，卡片已经被其他人领走了") != -1) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }


          if (res.data.msg.indexOf("成功") != -1) {
            let data = _this.data.data
            data.have_card_num++
            _this.setData({
              data: data
            })
          }
        } else {
          if (res.data.msg.indexOf('功能碎片最多保存5块') != -1) {
            _this.setData({
              show_toast: true,
              toast_content: res.data.msg,
              toast_durantion: 2500
            })
            // wx.showToast({
            //   title: res.data.msg,
            //   icon: 'none'
            // })
          }
          if (res.data.msg.indexOf('通过赠送最多可以') != -1) {
            _this.setData({
              show_toast: true,
              toast_content: res.data.msg,
              toast_durantion: 25000
            })
            // wx.showToast({
            //   title: res.data.msg,
            //   icon: 'none'
            // })
          }
        }
      }
    })
  },
  closeDialog(e) {
    this.setData({
      show_dialog: false
    })
  },
  register(e) {
    this.judgeLogOn(shareID, 'share_card')
  },
  toRankPage(e) {
    let ranks = this.data.data.ranks
    // console.log(ranks)
    wx.navigateTo({
      url: '../account_rank/account_rank?ranks=' + JSON.stringify(ranks) + '&card_type=' + this.data.data.card_type
    })
  },
  toAccountInfo(e) {

    filter.jumpToMePage(e.currentTarget.dataset.item, '')
  },
  showCardNum(e) {
    if (wx.getStorageSync('change_show')) {
      return
    }
    let cardInfo = this.data.data
    this.setData({
      show_mask: true,
      contents: showCardInfoUtil.getShowCardNumContent(cardInfo)
    })
  },
  showCardLv(e) {
    if (wx.getStorageSync('change_show')) {
      return
    }
    let cardInfo = this.data.data
    this.setData({
      show_mask: true,
      contents: showCardInfoUtil.getShowCardLvContent(cardInfo)
    })
  },
  showCardCPoint(e) {
    if (wx.getStorageSync('change_show')) {
      return
    }
    let cardInfo = this.data.data

    this.setData({
      show_mask: true,
      contents: showCardInfoUtil.getShowCardCpContent(cardInfo)
    })
  },
  showAllInfo(e) {
    let cardInfo = this.data.data
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
  backList(e) {
    let _this = this
    this.setData({
      show_mask: false,
      show_mask3: false
    }, function () {
      _this.showChangeSquareInfo(_this.data.data)
    })
  },
  clickAffirm(e) {
    // this.judgeLogOn(getShareInfo, 'share_card')
    let _this = this
    this.login(getShareInfo, 'share_card')
    this.setData({
      show_mask2: false
    }, function () {
      _this.showChangeSquareInfo(_this.data.data)
    })
  },
  showBadge(e) {
    this.changeBadgeOpacity()
    let cardInfo = this.data.data
    wx.navigateTo({
      url: '../badge_card/badge_card?badge_id=' + cardInfo.badge_id
    })
  },
  exchangerealityCard(e) {
    if (!this.judgeLogOn('', 'exchange_true_card')) {
      return
    }
    if (this.data.data.have_card_num <= 0) {
      wx.showToast({
        title: '拥有这块碎片后，才能兑换实物',
        icon: 'none'
      })
      return
    }

    this.setData({
      show_mask3: true
    })
  },
  closeBigImg(e) {
    let _this = this

    let animationMiddleHeaderItem = wx.createAnimation({
      duration: 350, // 以毫秒为单位 
      timingFunction: 'ease-out',
      delay: 0,
      success: function (res) {}
    });
    animationMiddleHeaderItem.opacity(0).top('100vh').step();
    _this.setData({
      animationData: animationMiddleHeaderItem.export(),
      top_bar_color: '#FFFFFF',
      top_bar_font_color: '#FFFFFF'
    })

    // setTimeout(function(){
    //   _this.setData({

    //   })
    // },350)

    setTimeout(function () {
      _this.setData({
        animationData: '',
        show_big_img: false,

      })
    }, 500)
  },
  showBigImg(e) {
    let _this = this
    if (this.data.data.card_type == 'SQUARE') {
      this.toMap()
      return
    }
    this.setData({
      show_big_img: true
    })

    setTimeout(function () {
      let animationMiddleHeaderItem = wx.createAnimation({
        duration: 350, // 以毫秒为单位 
        timingFunction: 'ease-out',
        delay: 0,
        success: function (res) {}
      });
      animationMiddleHeaderItem.opacity(1).top(0).step();
      _this.setData({
        animationData: animationMiddleHeaderItem.export(),
      })
      setTimeout(function () {
        _this.setData({
          top_bar_color: '#000000',
          top_bar_font_color: '#FFFFFF'
        })
      }, 350)
    }, 500)
  },
  affirmToCreatePage() {
    this.setData({
      show_mask3: false,
      show_exchange_card_second_step: true
    })
  },
  cancleExchange() {
    this.setData({
      show_mask3: false
    })
  },
  toMainPage() {
    wx.redirectTo({
      url: '../explore_metaverse/explore_metaverse'
    })
  },
  backLastPage(e) {
    if (shareID != undefined) {
      wx.redirectTo({
        url: '../explore_metaverse/explore_metaverse'
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }

  },
  initalImgHeight() {
    var maxHeight = wx.getSystemInfoSync().windowWidth * 1.5


    var SystemInfo = wx.getSystemInfoSync();
    // console.log(SystemInfo.windowWidth + '?????' + SystemInfo.windowHeight)
    let heightRpx = 750 * (SystemInfo.windowHeight / SystemInfo.windowWidth);
    // console.log(heightRpx)
    let getCardHeight = heightRpx * 0.76
    if ((SystemInfo.windowWidth / SystemInfo.windowHeight) > 0.6) {
      getCardHeight = heightRpx * 0.85
    }
    let notificationHeight = (heightRpx - getCardHeight) / 2 + 0.020 * getCardHeight + 20
    let cardToTop = (heightRpx - getCardHeight) / 2
    let notificationMoveTopRpx = 100 * (750 / SystemInfo.windowWidth)

    this.setData({
      notification_top: notificationHeight,
      notification_move_top_rpx: notificationMoveTopRpx,
      window_width_px: SystemInfo.windowWidth,
      height_rpx: heightRpx,
      get_card_height: getCardHeight,
      windowHeight: maxHeight
    })
  },
  downloadTrueCard(e) {
    let data = e.currentTarget.dataset.item
    this.setData({
      true_card_wait: false,
      true_card_downloading: true
    })
    if (this.data.no_qccode) {
      this.downloadPhoto(data, data.no_qrcode_img_url, 'img')
    } else {
      this.downloadPhoto(data, data.img_url, 'img')
    }
  },
  noQccode() {
    if (this.data.no_qccode == true) {
      this.setData({
        no_qccode: false
      })
    } else {
      this.setData({
        no_qccode: true
      })
    }
  },
  getTrueCardInfo() {
    if (!this.judgeLogOn('', 'make_true_card')) {
      return
    }
    let _this = this
    if (this.data.data.assessing) {
      wx.showToast({
        title: '宇宙首发中的碎片无法生成实体碎片',
        icon: 'none'
      })
      return
    }
    if (_this.data.data.card_type == 'FUNCATION') {
      wx.showToast({
        title: '[功能碎片]无法生成实体碎片',
        icon: 'none',
        duration: 2000
      })
      return
    } else if (_this.data.data.have_card_num == 0) {
      wx.showToast({
        title: '拥有此碎片后才可生成实体碎片',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      show_img_card: true
    })
    setTimeout(function () {
      var animation = wx.createAnimation({
        duration: 800,
        timingFunction: 'linear',
        delay: 0
      });
      animation.translateY(-1500).step()
      _this.setData({
        show_img_card_animationData: animation
      })
    }, 200)

  },
  //图片实体碎片生成主体
  createTrueImage(ctx, canvas, data) {
    let _this = this
    let beishu = 2.8
    let left = 0
    let top = 0
    let cardInfo = data
    console.log(data)
    _this.fillRoundRect(ctx, 0, 0, beishu * 1080, beishu * 1440, 0, '#FFFFFF')
    _this.fillRoundRect(ctx, beishu * 702 + left - 25, beishu * 465 + top, beishu * 341, beishu * 141, beishu * 15, '#858BC7')
    _this.fillRoundRect(ctx, beishu * 702 + left - 25, beishu * 616 + top, beishu * 341, beishu * 141, beishu * 15, '#58B8B7')
    _this.fillRoundRect(ctx, beishu * 702 + left - 25, beishu * 765 + top, beishu * 341, beishu * 141, beishu * 15, '#E5C383')
    let hand1 = canvas.createImage();
    let hand1Loaded = false
    hand1.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/hand1.png';
    hand1.onload = () => {
      hand1Loaded = true
    }

    let seal = canvas.createImage();
    seal.src = cardInfo.images[0].image_url;
    let sealLoaded = false
    seal.onload = () => {
      sealLoaded = true
    }

    let back = canvas.createImage();
    back.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/pick_logo2.png';
    let backLoaded = false
    back.onload = () => {
      backLoaded = true
    }

    let playBtn = canvas.createImage();
    playBtn.src = '/pages/images/play.png';
    let playLoaded = false
    playBtn.onload = () => {
      playLoaded = true
    }

    let hand2 = canvas.createImage();
    hand2.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/hand2.png';
    let hand2Loaded = false
    hand2.onload = () => {
      hand2Loaded = true
    }


    let qcCode = canvas.createImage();
    qcCode.src = qcCodeUrl;
    let qcLoaded = false
    qcCode.onload = () => {
      qcLoaded = true
    }


    let topBar = canvas.createImage();
    topBar.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/img_card_top_bar1.png';
    let topBarLoaded = false
    topBar.onload = () => {
      topBarLoaded = true
    }

    let userInfo = wx.getStorageSync('userInfo')
    let accountIcon = canvas.createImage();
    accountIcon.src = userInfo.account_icon;
    let accountIconLoaded = false

    accountIcon.onload = () => {
      accountIconLoaded = true
    }
    let intert = setInterval(function (e) {
      if (hand1Loaded && sealLoaded && backLoaded && playLoaded && hand2Loaded && qcLoaded && topBarLoaded && accountIconLoaded) {
        clearInterval(intert)
        ctx.drawImage(hand1, beishu * 0 + left, beishu * 834 + top - 20, beishu * 394, beishu * 714);
        _this.addShadow(ctx, beishu * 6, beishu * 6, beishu * 6, 'rgba(0,0,0,0.4)')
        _this.fillRoundRect(ctx, beishu * 36 + left, beishu * 30 + top, beishu * 666, beishu * 890, beishu * 15, '#000000')
        _this.clearShadow(ctx)
        if (cardInfo.images[0].vertical) {
          _this.drawRoundImage(ctx, beishu * (36 + 3) + left, beishu * (30 + 3) + top, beishu * (666 - 6), beishu * (890 - 6), beishu * 15, seal, seal.width, seal.height)
          if (data.images[0].type == 'video') {
            ctx.drawImage(playBtn, beishu * (36 + 3) + left + beishu * (666 - 6) - beishu * 80, beishu * (30 + 3) + top + beishu * (890 - 6) - beishu * 80, beishu * 60, beishu * 60);
          }
        } else {
          let width = beishu * (666 - 6)
          let height = width * (cardInfo.images[0].height / cardInfo.images[0].width)
          _this.drawRoundImage(ctx, beishu * (36 + 3) + left, beishu * (30 + 3) + top, beishu * (666 - 6), beishu * (890 - 6), beishu * 15, back, back.width, back.height)
          _this.drawRoundImage(ctx, beishu * (36 + 3) + left, beishu * (30 + 3) + top + (beishu * (890 - 6) - height) / 2, beishu * (666 - 6), height, 0, seal, seal.width, seal.height)
          if (data.images[0].type == 'video') {
            ctx.drawImage(playBtn, beishu * (36 + 3) + left + beishu * (666 - 6) - beishu * 80, beishu * (30 + 3) + top + (beishu * (890 - 6) - height) / 2 + height - beishu * 80, beishu * 60, beishu * 60);
          }

        }
        let handWidth = 132 * 0.93
        ctx.drawImage(hand2, beishu * 189 + left, beishu * 834 + top - 20, beishu * handWidth, beishu * handWidth * (184 / 132));

        if (!_this.data.no_qccode) {
          ctx.drawImage(qcCode, beishu * 818 + left, beishu * 322 + 10 + top - 20, beishu * 131, beishu * 131);
        }
        _this.createImgCardContent(cardInfo, ctx)
        ctx.drawImage(topBar, beishu * (36 + 3) + left, beishu * (30 + 3) + top, beishu * (666 - 6), beishu * (89 - 6));
        _this.drawRoundImage(ctx, beishu * (56 + 3) + left, beishu * (42 + 3) + top, beishu * (61 - 6), beishu * (61 - 6), beishu * 27.5, accountIcon, accountIcon.width, accountIcon.height)
        let accountName = userInfo.account_name

        if (accountName.length > 6) {
          accountName = accountName.substr(0, 5)
          moveLeft = accountName.length * 32 + 44
          accountName = accountName + '...'
        }
        let moveLeft = _this.judgeContentWidth(ctx, accountName, 32)
        _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft / 2 - 32) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", accountName)
        if (cardInfo.account_id == userInfo.account_id) {
          _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '创造')
          moveLeft = moveLeft + 8 + 64 + 32 - 8
        } else if (cardInfo.card_type == 'TRUE_CARD') {
          _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '兑换')
          moveLeft = moveLeft + 8 + 64 + 32 - 8
        } else {
          _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8 + 4) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", 'PICK')
          moveLeft = moveLeft + 8 + 128 - 32 + 3
        }
        _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", '了这块碎片')
        moveLeft = moveLeft + 128 + 8 + 8 - 32
        _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", '拥有')
        let haveCardNumWidth = _this.judgeContentWidth(ctx, cardInfo.have_card_num, 32)
        moveLeft = moveLeft + haveCardNumWidth / 2 + 32 + 6
        _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '' + cardInfo.have_card_num)
        moveLeft = moveLeft + 16 + 6 + haveCardNumWidth / 2
        _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", '块')

        setTimeout(function (e) {
          wx.canvasToTempFilePath({ //将canvas生成图片
            canvas: canvas,
            x: 0,
            y: 0,
            destWidth: 1080 * 2,
            destHeight: 1440 * 2,
            quality: 1,
            success: function (res) {

              _this.endTrueCardProgress()
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: function (res1) {
                  console.log('图片生成成功，已存入相册')
                  // makeImgCardSuccess = true

                  wx.showToast({
                    title: '[实体碎片]生成完成  已存入相册',
                    icon: 'none'
                  })

                },
                fail: function (res) {
                  console.log(res)
                }
              })
              _this.setData({
                no_qccode: false,
                true_card_wait: false,
                true_card_downloading: false,
                show_true_card_img: true,
                true_card_url: res.tempFilePath
              })
            },
            fail: function (res) {
              console.log(res)
            }
          }, _this)
        }, 200)
      }

    }, 500)

    this.createImgCardBottom(cardInfo, ctx, canvas)
    let num = canvas.createImage();
    if (cardInfo.card_type == "SSR") {
      num.src = '/pages/images/ssr.png';
    } else if (cardInfo.card_type == "FUNCATION") {
      num.src = '/pages/images/function.png';
    } else if (cardInfo.card_type == "TRUE_CARD") {
      num.src = '/pages/images/true_card.png';
    } else {
      num.src = '/pages/images/sr.png';
    }
    num.onload = () => {
      ctx.drawImage(num, beishu * 711 + left, beishu * 474 + top, beishu * 125, beishu * 125);
    }
    if (cardInfo.surplus_card_num > 99) {
      _this.drawWord(ctx, beishu * (711 + 211) + left, beishu * (465 + 75) + top, beishu * 50, "#FFFFFF", cardInfo.surplus_card_num + "/" + cardInfo.total_card_num)
    } else {
      _this.drawWord(ctx, beishu * (711 + 211) + left, beishu * (465 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.surplus_card_num + "/" + cardInfo.total_card_num)
    }
    let lv = canvas.createImage();
    lv.src = '/pages/images/c_info_lv.png';
    lv.onload = () => {
      ctx.drawImage(lv, beishu * 711 + left, beishu * 627 + top, beishu * 120, beishu * 120);
    }
    _this.drawWord(ctx, beishu * (711 + 181) + left, beishu * (616 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.card_lv)

    let cp = canvas.createImage();
    cp.src = '/pages/images/c_info_point.png';
    cp.onload = () => {
      ctx.drawImage(cp, beishu * (711 + 10) + left, beishu * 786 + top, beishu * 95, beishu * 95);
    }
    if (cardInfo.card_cpoint > 9999) {
      _this.drawWord(ctx, beishu * (711 + 211) + left, beishu * (765 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.card_cpoint)
    } else {
      _this.drawWord(ctx, beishu * (711 + 181) + left, beishu * (765 + 75) + top, beishu * 60, "#FFFFFF", cardInfo.card_cpoint)
    }
  },
  createImgCardContent(data, cxt) {
    let beishu = 2.8
    let contentleft = 721 * beishu
    let contenttop = 30 * beishu
    let trueWidth = 324 * beishu
    let width = 520 * beishu
    let changeRate = trueWidth / width
    let title = data.title
    let content = data.content

    let titleFontSize = 70 * beishu * changeRate
    cxt.font = 'bold ' + titleFontSize + 'px Arial';
    let titleLists = this.spliceString(title, titleFontSize * 11, titleFontSize * 6, cxt)
    console.log(titleLists)
    let contentFontSize = 38 * beishu * changeRate
    cxt.font = 'bold ' + contentFontSize + 'px Arial';
    let contentLists
    if (titleLists.length > 1) {
      contentLists = this.spliceString(content, contentFontSize * 11 * 1.8, contentFontSize * 11, cxt)
    } else {
      contentLists = this.spliceString(content, contentFontSize * 11 * 3.8, contentFontSize * 11, cxt)
    }
    console.log(contentLists)


    let titleLine = titleLists.length;
    let lineNum = contentLists.length;
    if (lineNum == 0) {
      lineNum = -1
    }
    let height = 0
    if (titleLine > 1) {
      height = (lineNum * 40 + 70 + 40 + 260 + 30) * beishu * changeRate;
    } else if (data.title.length > 0) {
      height = (lineNum * 40 + 70 + 40 + 170 + 30) * beishu * changeRate
    } else {
      height = (lineNum * 40 + 70 + 40 + 50 + 30) * beishu * changeRate
    }
    this.fillRoundRect(cxt, 5 * beishu + contentleft, 5 * beishu + contenttop, 100 * beishu / 1.5, 8 * beishu / 1.5, 0, '#A68B57')
    this.fillRoundRect(cxt, 5 * beishu + contentleft, 5 * beishu + contenttop, 8 * beishu / 1.5, 91 * beishu / 1.5, 0, '#A68B57')
    this.fillRoundRect(cxt, 500 * beishu * changeRate - 13 * beishu / 1.5 + 20 + contentleft, height - 85 * beishu / 1.5 - 11 * 3 + contenttop, 8 * beishu / 1.5, 91 * beishu / 1.5, 0, '#A68B57')
    this.fillRoundRect(cxt, contentleft + 500 * beishu * changeRate - 105 * beishu / 1.5 + 20, height - 13 * beishu / 1.5 + contenttop, 100 * beishu / 1.5, 8 * beishu / 1.5, 0, '#A68B57')
    for (let i = 0; i < data.card_show_id.length; i++) {
      let string = data.card_show_id.substr(i, 1);
      this.drawWord2(cxt, (35 + 15 + 29 * i) * beishu * changeRate + contentleft, (65 + 10) * beishu * changeRate + contenttop, 40 * beishu * changeRate, "#000000", string)
    }
    let titleList = this.canvasWorkBreak(6, title);
    let addHeight = 0;
    for (let i = 0; i < titleLists.length; i++) {
      addHeight = i * 120 * changeRate;
      this.drawWord2(cxt, (35 + 15) * beishu * changeRate + contentleft, (140 + i * 120 * changeRate) * beishu * changeRate + contenttop, 70 * beishu * changeRate, "#000000", titleLists[i].content)
    }
    let contentList = this.canvasWorkBreak(11, content);
    let contentTop = 235
    if (title == undefined || title.length == 0) {
      contentTop = 140
    }
    for (let i = 0; i < contentLists.length; i++) {
      this.drawWordNoBold2(cxt, (35 + 15) * beishu * changeRate + contentleft, (contentTop + i * 80 * changeRate + addHeight) * beishu * changeRate + contenttop, 38 * beishu * changeRate, "#000000", contentLists[i].content)

    }
  },
  spliceString(content, maxWidth, rowWidth, ctx) {
    let splieContent = content
    if (content == '') {
      return [];
    }
    if (ctx.measureText(content).width > maxWidth) {
      for (let i = 0; i < content.length; i++) {
        if (ctx.measureText(content.substring(0, i)).width > maxWidth) {
          splieContent = content.substring(0, i - 2) + '...'
          break
        }
      }
    }
    console.log(splieContent)
    return this.spliceToEveryLing(splieContent, rowWidth, ctx)
  },
  spliceToEveryLing(content, rowWidth, ctx) {
    let result = []
    let length = 0
    let originLength = content.length
    // console.log(">>>>>>>>>>>>>>>>>>>>>")
    for (let i = 1;; i++) {
      for (let j = 1; j <= content.length; j++) {
        let mid = content.substring(0, j);
        let width = ctx.measureText(mid).width
        if (j == content.length) {
          let a = {
            row: i,
            content: content.substring(0, j)
          }
          result.push(a);
          console.log(result)
          return result;
        }

        if (width > rowWidth) {
          let a = {
            row: i,
            content: content.substring(0, j - 1)
          }
          result.push(a);
          length = length + j;
          if (length == originLength) {
            console.log(result)

            return result;
          }
          content = content.substring(j - 1);
          break;
        }
      }
    }
    return result;
  },
  //创造图片实体碎片碎片信息部分
  createImgCardBottom(data, cxt, canvas) {
    let beishu = 2.8
    let contentleft = 592 * beishu
    let contenttop = 941 * beishu
    this.fillRoundRect(cxt, 0 * beishu + contentleft, 0 * beishu + contenttop, 342 * beishu + 3, 3 * 2, 0, '#000000')
    this.fillRoundRect(cxt, 0 * beishu + contentleft, 0 * beishu + contenttop, 3 * 2, 45 * beishu, 0, '#000000')
    this.fillRoundRect(cxt, 0 * beishu + contentleft, 45 * beishu + contenttop, 342 * beishu + 3 * 2, 3 * 2, 0, '#000000')
    this.fillRoundRect(cxt, 342 * beishu + contentleft, 0 * beishu + contenttop, 3 * 2, 45 * beishu, 0, '#000000')
    this.fillRoundRect(cxt, 45 * beishu + contentleft, 0 * beishu + contenttop, 3 * 2, 45 * beishu, 0, '#000000')
    let num = canvas.createImage();
    if (data.card_type == "SSR") {
      num.src = '/pages/images/ssr_no_bg.png';
    } else if (data.card_type == "TRUE_CARD") {
      num.src = '/pages/images/true_card_no_bg.png';
    } else {
      num.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/sr2.png';
    }
    num.onload = () => {
      cxt.drawImage(num, 8 * beishu + contentleft, 8 * beishu + contenttop, 30 * beishu, 30 * beishu);
    }
    let cardNum = data.total_card_num - data.surplus_card_num
    if (data.card_type == "SSR") {
      this.drawWord2(cxt, 79 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '稀有碎片')
    } else if (data.card_type == "TRUE_CARD") {
      this.drawWord2(cxt, 79 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '实物碎片')
    } else {
      this.drawWord2(cxt, 79 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '普通碎片')
    }
    this.drawWord2(cxt, 194 * beishu + contentleft, (3 + 4 + 9) * beishu + contenttop, 22 * beishu, "#000000", '剩余' + cardNum + '块')
    // this.drawWord2(cxt, 0 * beishu + contentleft, (118) * beishu + contenttop, 36 * beishu, "#000000", "还需")
    if (data.want_pick_account > 99) {
      this.drawWord2(cxt, (246 - 79 + 59) * beishu + contentleft, (118 + 15) * beishu + contenttop, 36 * beishu, "#000000", "人想Pick这块碎片")
    } else if (data.want_pick_account > 9) {
      this.drawWord2(cxt, (246 - 79) * beishu + contentleft, (118 + 15) * beishu + contenttop, 36 * beishu, "#000000", "人想Pick这块碎片")
    } else {
      this.drawWord2(cxt, (246 - 79 - 79) * beishu + contentleft, (118 + 15) * beishu + contenttop, 36 * beishu, "#000000", "人想Pick这块碎片")
    }

    this.drawWord2(cxt, 0 * beishu + contentleft, (204) * beishu + contenttop, 26 * beishu, "#000000", "这块碎片近期升值：")
    if (!this.data.no_qccode) {
      this.drawWordNoBold2(cxt, 0 * beishu + contentleft, (370) * beishu + contenttop, 34 * beishu, "#000000", "长按Pick我的碎片  一起升值")
      this.drawWordNoBold2(cxt, 0 * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "或微信搜索")
      this.drawWordNoBold2(cxt, 263 * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "小程序")
    } else {
      this.drawWordNoBold2(cxt, 0 * beishu + contentleft, (370) * beishu + contenttop, 34 * beishu, "#000000", "Pick我的碎片  一起升值")
      this.drawWordNoBold2(cxt, 0 * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "微信搜索")
      this.drawWordNoBold2(cxt, (263 - 34) * beishu + contentleft, 430 * beishu + contenttop, 34 * beishu, "#000000", "小程序")
    }
    if (data.want_pick_account > 9999) {
      this.drawWord2(cxt, (0 - 3) * beishu + contentleft, (37 + 7 + 10 + 8 + 40) * beishu + contenttop, 80 * beishu, "#F46563", data.want_pick_account)
    } else if (data.want_pick_account > 999) {
      this.drawWord2(cxt, (0 - 3) * beishu + contentleft, (37 + 7 + 10 + 8 + 30) * beishu + contenttop, 95 * beishu, "#F46563", data.want_pick_account)
    } else {
      this.drawWord2(cxt, (0 - 3) * beishu + contentleft, (37 + 7 + 10 + 8) * beishu + contenttop, 135 * beishu, "#F46563", data.want_pick_account)
    }

    let bottomCPMoveLeft
    if (data.card_type == 'SR') {
      bottomCPMoveLeft = this.judgeContentWidth(cxt, data.card_cpoint_day30, 104)
      this.drawWord2(cxt, 0 * beishu + contentleft, (237 + 15) * beishu + contenttop, 104 * beishu, "#E4C383", data.card_cpoint_day30)
    } else {
      bottomCPMoveLeft = this.judgeContentWidth(cxt, data.card_cpoint, 104)
      this.drawWord2(cxt, 0 * beishu + contentleft, (237 + 15) * beishu + contenttop, 104 * beishu, "#E4C383", data.card_cpoint)
    }
    let cp = canvas.createImage();
    cp.src = '/pages/images/c_info_point.png';
    cp.onload = () => {
      cxt.drawImage(cp, (bottomCPMoveLeft + 10) * beishu + contentleft, (237 + 15) * beishu + contenttop, 95 * beishu, 95 * beishu);
    }
    let logo = canvas.createImage();
    logo.src = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/logo2.png';
    logo.onload = () => {
      if (!this.data.no_qccode) {
        cxt.drawImage(logo, 182 * beishu + contentleft, (422 - 12) * beishu + contenttop, 67 * beishu, 67 * beishu);
      } else {
        cxt.drawImage(logo, (182 - 34) * beishu + contentleft, (422 - 12) * beishu + contenttop, 67 * beishu, 67 * beishu);
      }
    }
  },
  createTrueCard(e) {

    let _this = this
    let data = e.currentTarget.dataset.item
    wx.getSetting({
      success(res) {
        // console.log(">>>>>>>>>>>>>>>>>>")
        // console.log(res)
        var authMap = res.authSetting;
        if (authMap['scope.writePhotosAlbum']) {
          _this.setData({
            true_card_wait: false,
            true_card_downloading: true,
            can_interval: false,
            swiperCanMove: false
          })
          // _this.postTrueCard()
          _this.createTrueCardProgress()
          let header = {
            'wy-platform': 'mini_programe', // 默认值
          }
          let userInfo
          if (wx.getStorageSync('login') != '') {
            userInfo = wx.getStorageSync('userInfo')
            header.Authorization = 'Bearer ' + userInfo.access_token
          } else {
            return
          }

          let otherInfo = userInfo.account_id + ',' + _this.data.data.card_id
          wx.request({
            url: prefix + 'qc_code?other_info=' + otherInfo + '&env_version=develop', //仅为示例，并非真实的接口地址
            method: 'GET',
            header: header,
            success(res) {
              qcCodeUrl = res.data.data
              wx.createSelectorQuery()
                .select('#canvas2')
                .fields({
                  node: true,
                  size: true,
                })
                .exec(_this.initImgCard.bind(_this))
            }
          })

        } else {
          if (authMap['scope.writePhotosAlbum'] != undefined) {
            _this.setData({
              card_data: data,
              get_photo_again_mask: true,
            })
          } else {
            _this.setData({
              card_data: data,
              get_photo_mask: true,
            })
          }
          // _this.setData({
          //   card_data: data,
          //   get_photo_mask: true,
          // })
        }
        console.log(res)
      }
    })
  },
  affirmToGetPhoto(e) {
    console.log(e)
    let data = e.currentTarget.dataset.item
    let _this = this
    this.setData({
      get_photo_mask: false,
      get_photo_again_mask: false
    })
    wx.authorize({
      scope: "scope.writePhotosAlbum", // 权限名称

      success: () => {
        console.log('scope.address 权限获取成功')
        _this.setData({
          true_card_wait: false,
          true_card_downloading: true,
          can_interval: false,
          swiperCanMove: false
        })
        // _this.gettedImgCard(data)
        _this.createTrueCardProgress()

        let userInfo = wx.getStorageSync('userInfo')
        let otherInfo = userInfo.account_id + ',' + _this.data.data.card_id
        let header = {
          'wy-platform': 'mini_programe', // 默认值
        }

        header.Authorization = 'Bearer ' + userInfo.access_token

        wx.request({
          url: prefix + 'qc_code?other_info=' + otherInfo + '&env_version=develop', //仅为示例，并非真实的接口地址
          method: 'GET',
          header: header,
          success(res) {
            qcCodeUrl = res.data.data
            wx.createSelectorQuery()
              .select('#canvas2')
              .fields({
                node: true,
                size: true,
              })
              .exec(_this.initImgCard.bind(_this))
          }
        })


      },

      fail: () => {
        console.log('scope.address 权限获取失败')
      }
    })
  },
  initImgCard(res) {
    let _this = this
    console.log(res)
    let beishu = 2.8
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    canvas.width = beishu * 1080;
    canvas.height = beishu * 1440;
    // this.createTrueImage(ctx, canvas, this.data.data)
    console.log(this.data.no_qccode)
    trueCardRequest.createVerticalImage(ctx, canvas, this.data.data, qcCodeUrl, this.data.no_qccode, function (res) {
      _this.endTrueCardProgress()
    }, function (res) {
      _this.setData({
        no_qccode: false,
        true_card_wait: false,
        true_card_downloading: false,
        show_true_card_img: true,
        true_card_url: res.tempFilePath
      })
      // makeImgCardSuccess = true
      // _this.setData({
      //   no_qccode: false,
      //   true_card_wait: false,
      //   true_card_downloading: false,
      //   show_true_card_img: true,
      //   true_card_url: res.tempFilePath
      // })

    })
  },
  createTrueCardProgress() {
    let _this = this
    let get_card_height = this.data.get_card_height
    let progress1 = 0.269 * get_card_height + 4
    let progress2 = 0.73 * get_card_height - 0.011 * get_card_height + 4 + 2 + 6
    let progress3 = (0.269 * get_card_height + 4) * 2 - 0.010 * get_card_height
    let progress4 = 0.73 * get_card_height - 0.011 * get_card_height + 4 + 2 + 4
    let progress5 = 0.269 * get_card_height + 4 - 0.010 * get_card_height
    let videoLength = progress2 + progress3 + progress4 + progress5
    let animation1
    let animation2
    let animation3
    let animation4
    let animation5
    animation1 = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 0
    });
    animation1.width(progress1 + 'rpx').step()
    animation2 = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 400
    });
    let length2 = 0
    animation2.height(progress2 + 'rpx').step()
    animation3 = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 800
    });
    let length3 = 0
    animation3.width(progress3 + 'rpx').step()
    animation4 = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 1200
    });
    let length4 = 0
    animation4.height(progress4 + 'rpx').step()
    animation5 = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 1600
    });
    let length5 = progress5 - 250
    animation5.width(length5 + 'rpx').step()
    _this.setData({
      progress_animation1: animation1,
      progress_animation2: animation2,
      progress_animation3: animation3,
      progress_animation4: animation4,
      progress_animation5: animation5,
    })
  },
  endTrueCardProgress() {
    let animation1
    let get_card_height = this.data.get_card_height
    let progress5 = 0.269 * get_card_height + 4 - 0.010 * get_card_height

    animation1 = wx.createAnimation({
      duration: 10,
      timingFunction: 'linear',
      delay: 0
    });
    animation1.width(progress5 + 'rpx').step()
    this.setData({
      progress_animation5: animation1,
    })
  },
  initProgress() {
    let animation1


    animation1 = wx.createAnimation({
      duration: 10,
      timingFunction: 'linear',
      delay: 0
    });
    animation1.width(0 + 'rpx').step()

    let animation2

    animation2 = wx.createAnimation({
      duration: 10,
      timingFunction: 'linear',
      delay: 0
    });
    animation2.height(0 + 'rpx').step()
    this.setData({
      progress_animation1: animation1,
      progress_animation2: animation2,
      progress_animation3: animation1,
      progress_animation4: animation2,
      progress_animation5: animation1,
    })
  },
  getVideoCard(e) {
    // this.setData({
    //   true_card_wait: true,
    //   true_card_downloading: false,
    //   show_true_card_img: false,
    //   show_true_card_video: false,
    //   show_img_card: false,
    //   just_show_img_card: false
    // })
    let data = e.currentTarget.dataset.item
    this.endDownload()
    this.getVideoCardReq()
  },
  getVideoCardReq() {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    let _this = this
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let reqData = {
      card_id: getTrueCard.card_id,
      make_id: getTrueCard.make_id
    }
    wx.request({
      url: prefix + 'true_card/get_video_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: reqData,
      success(res) {


        let progresses = wx.getStorageSync('make_video_progress')
        if (progresses == undefined || progresses == '') {
          progresses = []
        }



        let percent = (getTrueCard.wait_time * 60) / 100
        var timestamp = parseInt((new Date()).valueOf()) / 1000 + percent;
        let progress = {
          time: timestamp,
          percent: percent,
          making: true
        }

        progresses.push(progress)


        wx.setStorageSync('make_video_progress', progresses)
        wx.showToast({
          title: '后台正在生成视频实体碎片，请稍后...',
          icon: 'none'
        })
      }
    })
  },
  gettedImgCard() {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    let _this = this
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    // console.log(data)
    let reqData = {
      card_id: _this.data.data.card_id,
      type: "show_in_bar"
    }
    wx.request({
      url: prefix + 'true_card/end_img_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: reqData,
      success(res) {}
    })
  },
  cancelDownloadTrueCard(e) {
    // let data = e.currentTarget.dataset.item
    var animation = wx.createAnimation({
      duration: 10,
      timingFunction: 'linear',
      delay: 0
    });
    animation.translateY(1500).step()
    this.setData({
      show_img_card_animationData: animation
    })
    let _this = this
    setTimeout(function () {
      _this.setData({
        show_img_card: false,
        just_show_img_card: false,
        no_qccode: false,
        show_img_card_animationData: ''
      })
    }, 100)

    // this.gettedImgCard(data)
  },
  postTrueCard() {
    let _this = this
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let reqData = {
      card_id: this.data.data.card_id
    }

    wx.request({
      url: prefix + 'true_card', //仅为示例，并非真实的接口地址
      method: 'POST',
      header: header,
      data: reqData,
      success(res) {
        // console.log(">>>>>>>>>>>>>>>>>>>")

        // console.log(res)
        getTrueCard = res.data.data
        _this.setData({
          getTrueCard: getTrueCard
        })
        // _this.gettedImgCard();
      }
    })

  },
  drawWordNoBold2(cxt, x, y, size, /*optional*/ fillColor, content) {
    cxt.font = 'normal ' + size + 'px Arial';
    cxt.textAlign = 'left';
    cxt.textBaseline = 'top';
    cxt.fillStyle = fillColor;
    cxt.fillText(content, x, y);

  },
  drawWord2(cxt, x, y, size, /*optional*/ fillColor, content) {
    cxt.font = 'bold ' + size + 'px Arial';
    cxt.textAlign = 'left';
    cxt.textBaseline = 'top';
    cxt.fillStyle = fillColor;
    cxt.fillText(content, x, y);

  },
  drawWordNoBold(cxt, x, y, size, /*optional*/ fillColor, content) {
    cxt.font = 'bold ' + size + 'px Arial';
    cxt.textAlign = 'center';
    cxt.textBaseline = 'middle';
    cxt.fillStyle = fillColor;
    cxt.fillText(content, x, y);
  },
  canvasWorkBreak(maxLength, text) {
    const textLength = text.length
    let textRowArr = []
    let tmp = 0
    while (1) {
      textRowArr.push(text.substr(tmp, maxLength))
      tmp += maxLength
      if (tmp >= textLength) {
        return textRowArr
      }
    }
  },
  endDownload(e) {
    let _this = this
    this.initProgress()
    setTimeout(function () {
      _this.setData({
        true_card_wait: true,
        true_card_downloading: false,
        show_true_card_img: false,
        show_true_card_video: false,
        show_img_card: false,
        just_show_img_card: false
      })
    }, 100)
  },
  showMakedImgCardToast() {
    wx.showToast({
      title: '您的[实体碎片]已保存，请打开系统相册查看',
      icon: 'none'
    })
  },
  getAccountInfo(e, type) {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    } else {
      return
    }
    let _this = this
    let time = wx.getStorageSync('handbook_list_date')

    wx.request({
      url: prefix + 'account_info?last_time=' + time, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        // console.log(res)
        let userInfo = wx.getStorageSync('userInfo')
        res.data.data.access_token = userInfo.access_token
        res.data.data.dev_assess_code = userInfo.dev_assess_code
        res.data.data.prd_assess_code = userInfo.prd_assess_code
        res.data.data.code = userInfo.code
        res.data.data.refresh_token = userInfo.refresh_token
        res.data.data.token_type = userInfo.token_type
        res.data.data.scope = userInfo.scope

        wx.setStorageSync('userInfo', res.data.data)
        let accountInof = res.data.data;
        _this.setData({
          account_info: accountInof,
          show_loading: false,
          show_login_loading: false,
        });
        _this.afterLogin(e, type)
      }
    })
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
    } else if (type == 'exchange_card') {
      _this.getCard(e)
    } else if (type == 'gift') {
      _this.sendCard(e)
    } else if (type == 'make_true_card') {
      _this.getTrueCardInfo(e)
    } else if (type == 'exchange_true_card') {
      _this.exchangerealityCard(e)
    } else if (type == 'heartBtn2') {
      _this.heartBtn2(e)
    } else if (type == 'starBtn2') {
      _this.starBtn2(e)
    }
  },
  updateShareInfo() {
    let shareInfo = wx.getStorageSync('share_info')
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    } else {
      return
    }
    let _this = this

    wx.request({
      url: prefix + 'new_account_share?share_account_id=' + shareInfo.share_account_id + '&card_id=' + shareInfo.card_id, //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      success(res) {
        console.log("没翻车吗")
      }
    })
  },
  changeBadgeOpacity() {
    this.setData({
      badge_opacity: 1
    })
    let _this = this
    setTimeout(function () {
      _this.setData({
        badge_opacity: 0.3
      })
    }, 2000)
  },
  judgeContentLines(content, rpxNum) {
    if (content == null || content == undefined || content.length == 0) {
      return 0;
    }
    var SystemInfo = wx.getSystemInfoSync();
    // console.log(SystemInfo.windowWidth + '?????' + SystemInfo.windowHeight)
    let rpxToPx = SystemInfo.windowWidth / 750 * rpxNum;
    let maxWidth = SystemInfo.windowWidth / 750 * 290;
    judgeCOntentLineContext.font = 'bold ' + rpxToPx + 'px Arial';
    judgeCOntentLineContext.measureText(content).width
    let lines = judgeCOntentLineContext.measureText(content).width / maxWidth
    if (lines < 1) {
      return 1
    }
    // console.log("lines")
    // console.log(lines)
    return lines
  },
  initBadgeList(e) {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let _this = this
    wx.request({
      url: prefix + '' + e + '/card_badge', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        console.log(res)
        let badgeInfo = res.data.data;
        // wx.lin.renderWaterFlow(badgeInfo.card_infos,true);
        for (let i = 0; i < badgeInfo.card_infos.length; i++) {
          badgeInfo.card_infos[i].titleLine = _this.judgeContentLines(badgeInfo.card_infos[i].title, 31)
          badgeInfo.card_infos[i].contentLine1 = _this.judgeContentLines(badgeInfo.card_infos[i].content, 31)
          badgeInfo.card_infos[i].contentLine2 = _this.judgeContentLines(badgeInfo.card_infos[i].content, 21)

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
        }
        _this.setData({
          badgeInfo: badgeInfo,
          imgUrls: badgeInfo.card_infos
        })
      }
    })
  },
  swiperChange2(e) {
    // console.log(e)
    lastListNowSHow = listNowSHow
    listNowSHow = e.detail.current

    // if (!this.data.showCardDetail && this.data.imgUrls == hotListResult) {
    //   cardInfoCurrent = e.detail.current
    // }

    if (listNowSHow > 2 && listNowSHow < this.data.imgUrls.length - 3) {
      if (lastListNowSHow < listNowSHow) {
        if (lastListNowSHowPointStatus == 'up') {
          lastListNowSHowPointStatus = 'mid'
        } else if (lastListNowSHowPointStatus == 'mid') {
          lastListNowSHowPointStatus = 'down'
        }
      } else {
        if (lastListNowSHowPointStatus == 'down') {
          lastListNowSHowPointStatus = 'mid'
        } else if (lastListNowSHowPointStatus == 'mid') {
          lastListNowSHowPointStatus = 'up'
        }
      }
    } else if (listNowSHow == 1 || listNowSHow == this.data.imgUrls.length - 2) {
      lastListNowSHowPointStatus = 'mid'
    }


    this.setData({
      current2: e.detail.current,
      current_status: lastListNowSHowPointStatus
    })

  },
  heartBtn2(e) {

    if (!this.judgeLogOn('', 'heartBtn2')) {
      return
    }
    let data = this.data.imgUrls[this.data.current2]
    let list = this.data.imgUrls
    if (!data.liked) {
      data.liked = true
      data.like_num++
      list.splice(this.data.current2, 1, data)
      this.setData({
        imgUrls: list
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
      list.splice(this.data.current2, 1, data)
      this.setData({
        imgUrls: list
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
  },
  starBtn2(e) {
    if (!this.judgeLogOn('', 'starBtn2')) {
      return
    }
    let data = this.data.imgUrls[this.data.current2]
    let list = this.data.imgUrls
    if (!data.wanted) {
      data.wanted = true
      data.want_num++
      list.splice(this.data.current2, 1, data)
      this.setData({
        imgUrls: list
      })
      let resultReq = {
        card_id: data.card_id,
        liked: true,
      }
      this.wantCardReq(resultReq)
      wx.showToast({
        title: '已添加到想要列表',
        icon: 'none'
      })
    } else {
      data.wanted = false
      data.want_num--
      list.splice(this.data.current2, 1, data)
      this.setData({
        imgUrls: list
      })
      let resultReq = {
        card_id: data.card_id,
        liked: false,
      }
      this.wantCardReq(resultReq)
      wx.showToast({
        title: '已从想要列表移除',
        icon: 'none'
      })
    }
  },
  toBadge() {
    let item = this.data.imgUrls[this.data.current].badge_id
    wx.navigateTo({
      url: '../badge_card/badge_card?badge_id=' + item
    })
  },
  toCardInfoPage(e) {

    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + this.data.imgUrls[listNowSHow].card_id
    })
  },
  judgeContentWidth(cxt, content, rpNum) {
    if (content == null || content == undefined || content.length == 0) {
      return 0;
    }

    cxt.font = 'bold ' + rpNum + 'px Arial';

    let width = cxt.measureText(content).width
    return width
  },
  exchangeTrueCardClickAffirm(e) {
    console.log(e)
    let _this = this
    exchangeTrueCardData.card_id = this.data.data.card_id
    request.exchangeTrueCardRequesrt(exchangeTrueCardData, function (res) {
      console.log(res)
      _this.getSimple(cardID)
      if (res.data.result == 0) {
        _this.setData({
          show_exchange_card_second_step: false
        })
        wx.showToast({
          title: '兑换实物碎片成功',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },
  exchangeTrueCardClickCancel(e) {
    console.log(e)
    this.setData({
      show_exchange_card_second_step: false
    })
  },
  exchangeTrueCardPhoneInput(e) {
    console.log(e)
    exchangeTrueCardData.phone = e.detail.detail.value

  },
  exchangeTrueCardConsigneeInput(e) {
    console.log(e)
    exchangeTrueCardData.consignee = e.detail.detail.value

  },
  exchangeTrueCardAddressInput(e) {
    console.log(e)
    exchangeTrueCardData.address = e.detail.detail.value

  },
  toCardCodePage() {
    if (this.data.data.have_card_num <= 0) {
      wx.showToast({
        title: '你暂无碎片码哦，快去创造或者Pick碎片吧',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '../card_code/card_code?card_id=' + this.data.data.card_id
    })
  },



  //抽碎片逻辑
  pickCardLongTap(e) {
    if (this.data.change_show) {
      return
    }
    // console.log(e)
    // console.log(e.detail.currentTarget.dataset.item)
    let item = this.data.data
    if (!this.judgeLogOn('', '')) {
      return
    }
    if (this.data.account_info.cpoint < 10) {
      // this.showToast('CP不足10，无法Pick；您可以[创造]或[售出]碎片，获取更多CP。', 2500)
      this.setData({
        no_cp_toast: true
      })
      return
    }
    if (item.card_type == 'BONUS') {
      wx.showToast({
        title: '该碎片无法Pick',
        icon: 'none'
      })
      return
    }

    if (item.card_type == 'SQUARE') {
      wx.showToast({
        title: '地盘碎片无法Pick',
        icon: 'none'
      })
      return
    }
    if (item.assessing) {
      wx.showToast({
        title: '宇宙首发中的碎片无法Pick',
        icon: 'none'
      })
      return
    }

    if (showSuccess) {
      return
    }
    selectCardTouching = true
    let _this = this
    _this.setData({
      show_pick_card_first_loading: true,
      show_select_card_loading: true,
      get_card_bottom_content: '即将Pick宇宙碎片...',
    })

    _this.circleAnimation(item)

  },
  pickTouchEnd(e) {
    if (showSuccess) {
      return
    }
    clearInterval(getCardLoadingInterval)
    selectCardTouching = false
    nowSelectCardPercent = 0
    this.setData({
      get_card_loading_animation: "",
      show_select_card_loading: false
    })
  },
  circleAnimation(item) {
    if (!selectCardTouching) {
      return
    }
    let _this = this
    let animation = wx.createAnimation({
      duration: 1500, // 以毫秒为单位 
      timingFunction: 'liner',
      delay: 0,
      success: function (res) {}
    });
    animation.width("100%").step()
    _this.setData({
      loading_color: '#6699FF',
      get_card_loading_animation: animation.export()
    })
    getCardLoadingInterval = setInterval(function (e) {

      nowSelectCardPercent = nowSelectCardPercent + 50
      _this.setData({
        select_card_percent: nowSelectCardPercent,
      })
      if (nowSelectCardPercent == 100) {
        showSuccess = true
        clearInterval(getCardLoadingInterval)
        _this.pickCardTheSecondStep(item)


        let detailPickNum = wx.getStorageSync('detail_have_pick')
        if (detailPickNum == '' || detailPickNum <= 3) {
          if (detailPickNum == '') {
            detailPickNum = 1
          } else {
            detailPickNum++
          }
          wx.setStorageSync('detail_have_pick', detailPickNum)
        }
        _this.changeNotification()

        // _this.selectSuccess()
      }
    }, 750)
  },
  pickCardTheSecondStep(item) {
    if (this.data.account_info.cpoint < 10) {
      // this.showToast('CP不足10，无法Pick；您可以[创造]或[售出]碎片，获取更多CP。', 2500)

      this.setData({
        show_pick_second_loading: false,
        no_cp_toast: true

      })
      showSuccess = false
      this.pickTouchEnd()
      return
    }

    let _this = this

    let endRequest = false
    let requestData = ''
    request.pickCardRequest(item.card_id, function (res) {
      endRequest = true
      requestData = res

      _this.getAccountInfo()
      if (requestData.result != 0) {
        wx.showToast({
          title: requestData.msg,
          icon: 'none',
          duration: 4000
        })
        _this.setData({
          show_pick_second_loading: false
        })
        showSuccess = false
        _this.pickTouchEnd()
        return
      }

      let getProbability = 0.8 * ((item.total_card_num - item.surplus_card_num) / item.total_card_num) * Math.min(1.0, 50 / item.card_cpoint) * 100
      getProbability = getProbability.toFixed(1)
      _this.setData({
        show_pick_card_first_loading: false,
        show_pick_second_loading: true,
        get_card_bottom_content: '尝试Pick碎片中，获取概率' + getProbability + '%...'
      })
      let second = 0;
      let interval = setInterval(function () {
        second += 5
        if (endRequest) {


          if (second >= 30) {
            clearInterval(interval)
            if (requestData.data.id == 0) {
              _this.setData({
                show_pick_second_loading: false,
                get_card_bottom_content: '恭喜您，Pick成功！',
                loading_color: '#E7C385'
              })
              wx.showToast({
                title: '恭喜您，Pick成功，获取了这块宇宙碎片+1',
                icon: 'none',
                duration: 2000
              })

              _this.setData({
                show_have_card_ant: true
              }, function () {
                let failanimation = wx.createAnimation({
                  duration: 4000, // 以毫秒为单位 
                  timingFunction: 'liner',
                  delay: 0,
                  success: function (res) {}
                });
                failanimation.translateY(30).opacity(0).step()
                _this.setData({
                  have_card_ant: failanimation
                })

                setTimeout(function () {
                  _this.setData({
                    have_card_ant: '',
                    show_have_card_ant: false,
                  })
                }, 3000)
              })
              _this.showAddCpAndPickAnt()



              setTimeout(function () {
                // wx.navigateTo({
                //   url: '../card_detail/card_detail?show_pick_toast=true&card_id=' + item.card_id
                // })
                _this.setData({
                  show_pick_second_loading: false
                })

                // _this.getSimple(cardID)

                showSuccess = false
                _this.pickTouchEnd()

              }, 2000)
            } else {
              _this.setData({
                show_pick_second_loading: false,
                get_card_bottom_content: '很遗憾，没有获取到碎片',
                loading_color: '#F46563'
              })
              _this.showToast('Pick失败，已为您加入[想要]，10分钟后可再次Pick。先去Pick别的碎片吧！', 5000)

              _this.showAddCpAndPickAnt()

              setTimeout(function () {
                _this.setData({
                  show_pick_second_loading: false
                })
                showSuccess = false
                _this.pickTouchEnd()
              }, 5000)
            }
          }
        }
      }, 500)
    })
  },
  showAddCpAndPickAnt() {
    let _this = this
    this.setData({
      show_fail_pick_ant: true
    }, function () {
      let failanimation = wx.createAnimation({
        duration: 4000, // 以毫秒为单位 
        timingFunction: 'liner',
        delay: 0,
        success: function (res) {}
      });
      failanimation.translateY(30).opacity(0).step()
      _this.setData({
        fail_pick_ant: failanimation
      })
      setTimeout(function () {
        _this.setData({
          fail_pick_ant: '',
          show_fail_pick_ant: false
        })
        _this.getSimple(cardID)
      }, 3000)
    })
  },
  updateListItem(data) {
    let pages = getCurrentPages();
    //获取所需页面
    if (pages.length >= 2) {
      let prevPage = pages[pages.length - 2]; //上一页
      prevPage.setData({
        update_item: data, //你需要传过去的数据
      });
    }
  },
  changeNotification() {
    let _this = this
    let haveChagne = false
    let nowShowContent = ''
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

    // console.log(wx.getStorageSync('detail_have_pick'))
    if (wx.getStorageSync('detail_have_pick') <= 3 || wx.getStorageSync('detail_have_pick') == undefined) {
      if (remindType == 'detail_have_pick') {
        return
      } else {
        remindType = 'detail_have_pick'
      }
      nowShowContent = {
        content: '[长按]即可Pick，尝试收集你的宇宙碎片！',
        type: -2
      }
      haveChagne = true
    } else {
      this.remindAnt('')
    }

    if (haveChagne) {
      this.remindAnt(nowShowContent)
    }
  },
  showNormalNOtification() {
    if (isShowNormal) {
      return
    }
    let _this = this
    isShowNormal = true


    this.remindAnt(this.getNextRemindContentAndRequest())

    let interval = setInterval(function () {
      if (!onAction) {
        clearInterval(interval)
        isShowNormal = false
        remindType = ''
        _this.hideNotification(function () {})
      }
      let next = _this.getNextRemindContentAndRequest()
      if (next == '') {
        clearInterval(interval)
        isShowNormal = false
        remindType = ''
        _this.hideNotification(function () {
          _this.changeNotification()
        })
      } else {
        _this.remindAnt(next)
      }
    }, 8000)
  },
  getNextRemindContentAndRequest() {
    if (remindList.length > 0) {
      let content = remindList[0]
      remindList.splice(0, 1)
      console.log(remindList)
      request.updateCardRemind(content)
      return content
    } else {
      return ''
    }
  },
  remindAnt(data) {
    let _this = this
    if (this.data.show_notigication) {
      this.hideNotification(function () {
        if (data != '') {
          _this.showNOtification(data)
        }
      })
    } else {
      if (data != '') {
        this.showNOtification(data)
      }
    }
  },
  showNOtification(data) {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0
    })
    animation.translateY(100).opacity(1).step();

    let _this = this
    this.setData({
      show_notigication: true,
      now_show_content: data
    });
    setTimeout(function () {
      _this.setData({
        notification_animation: animation.step()
      })
    }, 200)
    setTimeout(function () {
      _this.setData({
        notification_animation: '',
        notification_opacity: 1
      })
    }, 700)
  },
  hideNotification(callBack) {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0
    })
    animation.translateY(-100).opacity(0).step();

    let _this = this
    this.setData({
      notification_animation: animation.step(),
      arr: []
    });
    setTimeout(function () {
      _this.setData({
        show_notigication: false,
      })
    }, 200)
    setTimeout(function () {
      _this.setData({
        notification_opacity: 0
      })
      callBack()
    }, 700)
  },
  showToast(content, duration) {
    this.setData({
      show_toast: true,
      toast_content: content,
      toast_duration: duration
    })
  },
  showChangeSquareInfo(cardInfo) {
    if (cardInfo.card_type == 'SQUARE') {
      if (cardInfo.change_square_info && !this.data.show_mask2) {
        let userInfo = wx.getStorageSync('userInfo')
        if (userInfo.account_id == cardInfo.account_id) {
          this.setData({
            show_change_square_info: true
          })
        }
        // this.setData({
        //   show_change_square_info: true
        // })
      }
    }
  },
  judegeSHowChangeSquareToast() {
    // if (wx.getStorageSync('login') == '') {
    //   return
    // }
    // if (this.data.data.card_type != "SQUARE") {
    //   return
    // }
    // if (!this.data.data.change_square_info) {
    //   return
    // }
    // let userInfo = wx.getStorageSync('userInfo')
    // let changeSquareInfo = {
    //   title: "",
    //   content: ""
    // }
    // if (userInfo.account_id == this.data.data.account_id) {
    //   this.setData({
    //     show_change_square_info: true
    //   })
    // }

  },
  changeSquare() {
    let _this = this
    if (changeSquareInfo.title.length <= 0) {
      this.showToast("地盘碎片名称不能为空", 2000)
      return
    }
    wx.showToast({
      title: '更改成功',
      icon: 'none'
    })
    changeSquareInfo.change = true
    changeSquareInfo.card_id = this.data.data.card_id
    request.putSquare(changeSquareInfo, function () {
      _this.getSimple(cardID)
    })
    this.setData({
      show_change_square_info: false
    })
  },
  notChangeSquare() {
    changeSquareInfo.change = false
    changeSquareInfo.card_id = this.data.data.card_id
    request.putSquare(changeSquareInfo, function () {})
    this.setData({
      show_change_square_info: false
    })
  },
  titleInput(e) {
    let content = e.detail.detail.value
    changeSquareInfo.title = content
  },
  contentInput(e) {
    let content = e.detail.detail.value
    changeSquareInfo.content = content
  },

  toMap() {
    wx.navigateTo({
      url: '/pages/map/map?lat=' + this.data.data.lat + '&lng=' + this.data.data.lng + '&cpoint=' + this.data.data.card_cpoint + '&card_id=' + this.data.data.card_id
    })
  },
  toMap2() {
    wx.navigateTo({
      url: '/pages/map/map?lat=' + (-1.0) + '&lng=' + (-1.0) + '&cpoint=' + 0 + '&card_id=' + (-1)
    })
    this.setData({
      show_sold_toast: false
    })
  },
  toSellCard(e) {
    if (!this.judgeLogOn(e, 'sellCard')) {
      return
    }
    filter.jumpToMePage(-1, 'to_tab=three')

  },
  hideToast() {
    this.setData({
      show_have_cp_toast: false,
      show_card_cp_toast: false,
      show_card_info_mask: false,
      unenough_cp_toast: false,
      no_cp_toast: false
    })
  },
  newAccountCardSold() {
    this.setData({
      show_sold_toast: false
    })
  }
})