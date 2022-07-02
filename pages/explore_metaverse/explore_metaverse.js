// pages/explore_metaverse/explore_metaverse.js
var request = require('../common/request.js');
var trueCardRequest = require('../common/utils/make_true_card_utils.js');
var showCardInfoUtil = require('../common/utils/show_card_info_util.js');
var filter = require("../common/utils/filter");
let nowSelectCardPercent = 0 //长按抽碎片进度条百分比
let showSuccess = false //长按抽碎片当前状态
let selectCardTouching = false
let getCardLoadingInterval = '' //长按抽碎片进度定时器

let showTureCardListType = '' //当前显示的实体碎片列表

//获取的应用二维码url
let qcCodeUrl = ''
let trueCardInfo = ''
let makeImgCardSuccess = false //实体碎片制作状态


let index = 1 //列表index
let indexData = {
  index: 1
}
let haveShowedAllCard = false //是否以展示所有列表

let isLogining = false //

let remindList = [] //通知栏列表
let remindType = '' //通知栏显示类型
let isShowNormal = false

let onAction = true

let browseCardNum = 0

let endFirstRequest = false
let isOnShow = false

let assessPopCanShow = false
let shouldShowAssessPop = false

let app = getApp()

let assessContent = ""

let assessList = []
let lastAdd = 1
let addAssessIndex = 0
let currentShowItem = ''

let shareAssessId = '-1'
let changeContentAssessId = -1
let createShareImageResolve = ''
let shareInfo = {
  image_url: '',
  is_share: false,
  share_type: 0
}

let totalComments = []
let commentType
let showCommentCardItem = ''
let mainComment = ''
let isGettingMetaList = false

let refreshView = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    assess_pop_result_top: 0,
    card_list: [],
    top_status_bar_height: getApp().globalData.statusBarHeight,
    menu_button_height: getApp().globalData.menuButtonHeight,
    arr: ['嘎尬舞尬舞噶', 'gawgwaga1'],
    swipre_can_move: true,
    notification_opacity: 0,
    notification_opacity2: 1,
    loading_color: '#6699FF',
    show_pick_second_loading: false,
    show_fail_pick_ant: false,
    fail_pick_ant: '',
    account_info: {
      cpoint: 0,
      total_card_cp: 0,
      square_num: 0
    },
    meta_list_animation: '',
    addData: '',
    notification_top: 0,
    get_card_height: 0,
    card_to_top: 0,
    window_height_rpx: 0,
    notification_move_top_rpx: 0,
    top_account_info_height: 0,
    true_card_show_list_in_bar: [],
    update_item: '',
    max: 999,
    min: 1,
    value: 500,
    assess_content: '',
    isCreateShareImage: false,
    current_show_item: '',
    show_assess_result_pop: '',
    show_assess_comment: '',
    wait_change_show_request: true,
    change_show: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.universeAnt()

    let _this = this

    request.getChangeSHow(function () {
      _this.setData({
        change_show: wx.getStorageSync('change_show'),
        wait_change_show_request: false
      })

      if (wx.getStorageSync('open_num') == 1 && !wx.getStorageSync('change_show')) {
        _this.setData({
          first_open_toast: true
        })
      }
    })

    this.setViewHeight()
    this.getWindowData();

    if (options.share_type == '1') {
      shareAssessId = options.card_id
      changeContentAssessId = parseInt(options.card_id)
      // console.log('起飞')
    }
    index = 1
    lastAdd = 1
    haveShowedAllCard = false
    endFirstRequest = false
    this.getAssessList(true)
    assessPopCanShow = false
    shouldShowAssessPop = false

    let internal = setInterval(function () {
      if (endFirstRequest && isOnShow) {
        clearInterval(internal)
        setTimeout(function () {
          assessPopCanShow = true
          _this.changeNotification()
        }, 1000)
      }
    }, 200)
    app.setWatcher(this); // 设置监听器



    const scene = decodeURIComponent(options.scene)
    let jumpAccountID;
    let jumpCardID;
    if (scene.indexOf(',') != -1) {
      let stringList = scene.split(",")
      jumpAccountID = stringList[0];
      jumpCardID = stringList[1];
      if (wx.getStorageSync('login') != '') {
        this.putScanQcCode(jumpCardID, jumpAccountID)
      } else {
        let scanList = []
        if (wx.getStorageSync('scan_list') != "") {
          scanList = wx.getStorageSync('scan_list')
        }
        let scanItem = {
          jumpAccountID: jumpAccountID,
          jumpCardID: jumpCardID
        }
        scanList.push(scanItem)
        wx.setStorageSync('scan_list', scanList)
      }
    } else {
      jumpAccountID = -1;
      jumpCardID = -1;
    }

    if (jumpCardID != undefined) {
      if (jumpCardID != -1) {
        wx.navigateTo({
          url: '../card_detail/card_detail?card_id=' + jumpCardID
        })
      }
    }

    request.getHotPoi()

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
    let _this = this
    onAction = true
    isOnShow = true
    this.getAccountInfo(false)
    this.getAllTrueCard()

    // if (wx.getStorageSync('open_num') == 1 && !this.data.change_show) {
    //   this.setData({
    //     first_open_toast: true
    //   })
    // }

    if (wx.getStorageSync('mute')) {
      this.selectComponent('#swiper').setMute(true);
    } else {
      this.selectComponent('#swiper').setMute(false);
    }

    let remindInterval = setInterval(function () {
      if (onAction) {
        _this.getAllTrueCard()
      } else {
        clearInterval(remindInterval)
      }
    }, 10000)

    setTimeout(function () {
      _this.changeNotification()
      _this.getRemind()

      let remindInterval = setInterval(function () {
        if (onAction) {
          _this.getRemind()
        } else {
          clearInterval(remindInterval)
        }
      }, 20000)

      if (wx.getStorageSync('new_account_toast') && !_this.data.change_show) {
        wx.setStorageSync('new_account_toast', false)
        _this.setData({
          show_new_account_toast: true
        })
        // wx.showToast({
        //   title: '恭喜您，获得新用户礼包648CP，可以购买你的宇宙了！',
        //   icon: 'none',
        //   duration: 3500
        // })
      }
    }, 500)


    let getAssessInterval = setInterval(function () {
      if (onAction) {
        _this.getAssessList(false)
      } else {
        clearInterval(getAssessInterval)
      }
    }, 20000)


    this.updateNewItem()
    this.updateExistItem()
    // refreshView = setInterval(function () {
    //   _this.setData({
    //     refrshView: !_this.data.refrshView
    //   })
    // }, 100)
    _this.selectComponent('#swiper').updateVideoStatus()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    onAction = false
    clearInterval(refreshView)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    onAction = false
    clearInterval(refreshView)
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
  onShareAppMessage: function (e) {
    console.log(e)
    if (e.from != "button") {
      return
    }

    wx.createSelectorQuery()
      .select('#canvas2')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '正在生成分享数据...',
        icon: 'none'
      })
      createShareImageResolve = resolve
    })

  },
  getAllTrueCard() {
    let _this = this
    request.getAllTureCard(function (res) {
      _this.setData({
        true_card_list: res
      })

    })
  },
  getRemind() {
    let _this = this
    request.getCardRemind(remindList, function (list, haveUPt) {

      remindList = list
      _this.changeNotification()
    })
  },
  getAssessItem(add) {
    if (assessList.length > 0) {
      for (let i = 0; i < assessList.length; i++) {
        let result = assessList[i]
        if (!result.have_added) {
          if (add) {
            result.have_added = true
          }
          return result
        }
      }
      return ''
      // let result = assessList[addAssessIndex]
      // if (result == undefined) {
      //   return ''
      // }
      // result.have_added=true
      // if (add) {
      //   addAssessIndex++
      // }
      // // result.show_assess_pop = true
      // // result.is_assessing = true
      // return result
    } else {
      return ''
    }
  },
  getMetaList(init) {
    let _this = this
    isGettingMetaList = true
    request.getMetaList(this.data.card_list, shareAssessId, function (res) {

      console.log("获取的meta数据", res)
      if (res.data.result == 0) {
        if (init) {
          endFirstRequest = true
        }
        if (res.data.data.length > 0) {
          let resultList = res.data.data

          for (let i = 0; i < resultList.length; i++) {
            resultList[i].loaded_img = false
          }


          if (init) {
            let result1 = []
            for (let i = 0; i < resultList.length; i++) {
              if (lastAdd != 17) {
                if (i == 0) {
                  let item = _this.getAssessItem(false)
                  if (item != '' && item.show_assess_result_pop) {
                    item = _this.getAssessItem(true)
                    result1.push(item)
                  }
                }
              }
              if (i == 7) {
                let item = _this.getAssessItem(true)
                if (item != '') {
                  result1.push(item)
                }
              }
              if (i == 12) {
                let item = _this.getAssessItem(true)
                if (item != '') {
                  result1.push(item)
                }
              }
              if (i == 17) {
                let item = _this.getAssessItem(true)
                if (item != '') {
                  result1.push(item)
                }
              }
              result1.push(resultList[i])
            }
            resultList = result1
          }

          for (let i = 0; i < resultList.length; i++) {
            resultList[i].index = index
            if (resultList[i].show_assess_pop) {
              lastAdd = index
            }
            index++
          }
          let nestList = _this.data.card_list
          nestList = nestList.concat(resultList)
          console.log("最终meta列表", nestList)

          _this.setData({
            card_list: nestList
          })
          if (init) {
            let item = nestList[0]
            item.platform = app.globalData.platform
            item.getCardHeight = _this.data.get_card_height
            item.windowHeightpx = _this.data.window_height_rpx
            _this.setData({
              current_show_item: item
            })
          }
          if (init) {
            _this.selectComponent('#swiper').init(1);
            if (lastAdd != -1) {
              currentShowItem = nestList[0]

              _this.judegPop()
            }
          }
          // if (res.data.data.length < 20) {
          //   let originList = _this.data.card_list
          //   let newList = JSON.parse(JSON.stringify(originList))
          //   for (let i = 0; i < newList.length; i++) {
          //     newList[i].index = index
          //     index++
          //   }

          //   originList = originList.concat(newList)
          //   _this.setData({
          //     card_list: originList
          //   })
          // }


        } else {
          // let originList = _this.data.card_list

          // let newList = JSON.parse(JSON.stringify(originList))
          // for (let i = 0; i < newList.length; i++) {
          //   newList[i].index = index
          //   index++
          // }

          // originList = originList.concat(newList)
          // _this.setData({
          //   card_list: originList
          // })
          // haveShowedAllCard = true
        }
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }

      shareAssessId = '-1'
      isGettingMetaList = false
    })

  },
  //设置页面自适应高度逻辑
  setViewHeight() {
    var SystemInfo = wx.getSystemInfoSync();
    // console.log(SystemInfo.windowWidth + '?????' + SystemInfo.windowHeight)
    let heightRpx = 750 * (SystemInfo.windowHeight / SystemInfo.windowWidth);
    // console.log(heightRpx)
    let getCardHeightPX = SystemInfo.windowHeight * 0.76
    let getCardHeight = heightRpx * 0.76
    if ((SystemInfo.windowWidth / SystemInfo.windowHeight) > 0.6) {
      getCardHeight = heightRpx * 0.85
      getCardHeightPX = SystemInfo.windowHeight * 0.85
    }
    let notificationHeight = (heightRpx - getCardHeight) / 2 + 0.020 * getCardHeight + 20
    let cardToTop = (heightRpx - getCardHeight) / 2
    let notificationMoveTopRpx = 100 * (750 / SystemInfo.windowWidth)

    let topAccountInfoHeight = (SystemInfo.windowHeight - getCardHeightPX) / 2 - this.data.top_status_bar_height - this.data.menu_button_height
    if (topAccountInfoHeight < 0) {
      this.setViewHeight()
      return
    }
    this.setData({
      rpx_to_px: SystemInfo.windowWidth / 750,
      px_to_rpx: 750 / SystemInfo.windowWidth,
      notification_top: notificationHeight,
      get_card_height: getCardHeight,
      card_to_top: cardToTop,
      window_height_rpx: heightRpx,
      window_height_px: SystemInfo.windowHeight,
      notification_move_top_rpx: notificationMoveTopRpx,
      top_account_info_height: topAccountInfoHeight
    })
  },
  //跳转到我的页面
  toMy() {
    if (this.judgeLogOn('', 'to_me')) {
      filter.jumpToMePage(-1, '')

    }
  },
  //显示生成实体碎片页面
  showAllTrueCard(e) {
    let _this = this
    showTureCardListType = 'bar'

    if (this.data.true_card_list.length > 0) {
      this.setData({
        current: 0,
        current3: 0,
        swiperCanMove: true,
        show_img_card: true,
        show_img_card_point: false,
        true_card_wait: true,
        true_card_show_list_in_bar: _this.data.true_card_list
      })
      setTimeout(function () {
        var animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'linear',
          delay: 0
        });
        animation.translateY(-1500).step()
        _this.setData({
          show_img_card_animationData: animation
        })
        setTimeout(function () {
          _this.setData({
            show_img_card_point: true
          })
        }, 500)
      }, 100)

    } else {
      if (_this.data.change_show) {
        wx.showToast({
          title: '收集或创造新卡片后，可生成实体卡片',
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: '收集或创造新碎片后，可生成实体碎片',
          icon: 'none',
          duration: 2000
        })
      }


    }
  },
  swiperChange3(e) {
    this.setData({
      current3: e.detail.current,
      bar_card: this.data.true_card_show_list_in_bar[e.detail.current],
    })

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
  hideTrueCard(e) {
    this.setData({
      show_img_card: false,
      just_show_img_card: false,
      no_qccode: false,
      show_img_card_animationData: ''
    })
  },
  createTrueCardProgress() {
    let _this = this
    let get_card_height = this.data.get_card_height

    let progress1 = 0.269 * get_card_height + 4 + 2
    let progress2 = 0.73 * get_card_height - 0.011 * get_card_height + 4 + 2 + 4
    let progress3 = (0.269 * get_card_height + 4) * 2 - 0.010 * get_card_height - 2 + 2

    try {
      var res = wx.getSystemInfoSync()
      if (res.system.indexOf('Android') != -1) {
        progress3 = (0.269 * get_card_height + 4) * 2 - 0.010 * get_card_height - 2 + 2
      } else {
        progress3 = (0.269 * get_card_height + 4) * 2 - 0.010 * get_card_height - 2 + 2 - 3
      }
    } catch (e) {}
    let progress4 = 0.73 * get_card_height - 0.011 * get_card_height + 4 + 2 + 4 + 2
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
  createTrueCard(e) {
    let _this = this
    let data = e.currentTarget.dataset.item
    wx.getSetting({
      success(res) {
        console.log('相册权限')
        console.log(res.authSetting)
        var authMap = res.authSetting;
        if (authMap['scope.writePhotosAlbum']) {
          _this.createCard(data)
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
        }
      }
    })
  },
  affirmToGetPhoto(e) {
    let data = e.currentTarget.dataset.item
    let _this = this
    this.setData({
      get_photo_mask: false,
      get_photo_again_mask: false
    })
    wx.authorize({
      scope: "scope.writePhotosAlbum", // 权限名称
      success: () => {
        _this.createCard(data)
      },
      fail: () => {
        console.log('scope.address 权限获取失败')
      }
    })
  },
  createCard(data) {
    let _this = this
    _this.setData({
      true_card_wait: false,
      true_card_downloading: true,
      swiperCanMove: false
    })

    request.putTrueCard(data, function (res) {})
    _this.createTrueCardProgress()
    console.log(data)
    trueCardInfo = data
    request.getQCCode(data.card_id, function (res) {
      qcCodeUrl = res
      wx.createSelectorQuery()
        .select('#canvas')
        .fields({
          node: true,
          size: true,
        })
        .exec(_this.initImg.bind(_this))
    })
  },
  initImg(res) {
    makeImgCardSuccess = false
    let _this = this
    console.log(res)
    let beishu = 2.8
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    canvas.width = beishu * 1080;
    canvas.height = beishu * 1440;
    // this.reTry(ctx, canvas, num)
    trueCardRequest.createVerticalImage(ctx, canvas, trueCardInfo.card_info, qcCodeUrl, this.data.no_qccode, function (res) {
      _this.endTrueCardProgress()
    }, function (res) {
      makeImgCardSuccess = true
      _this.setData({
        no_qccode: false,
        true_card_wait: false,
        true_card_downloading: false,
        show_true_card_img: true,
        true_card_url: res.tempFilePath
      })

    })
  },
  endDownload(e) {
    let _this = this

    this.setData({
      show_img_card_animationData: '',
      progress_animation1: '',
      progress_animation2: '',
      progress_animation3: '',
      progress_animation4: '',
      progress_animation5: '',
      true_card_wait: true,
      true_card_downloading: false,
      show_true_card_img: false,
      show_true_card_video: false,
      show_img_card: false,
      just_show_img_card: false
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
  //跳转到热度蹿升榜单
  toHotUpPage(e) {
    wx.navigateTo({
      url: '../hot_up/hot_up'
    })
  },
  //跳转到实物碎片兑换页
  toExchageCard(e) {
    wx.navigateTo({
      url: '../excahnge_card/exchange_card'
    })
  },
  //判断是否登录，如果未登录显示登录请求
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
    _this.setData({
      login_mask: true,
      log_in_data: e,
      log_in_type: type
    })
    return false
  },
  //登录点击确认
  affirmToLogIn() {
    let _this = this
    this.setData({
      login_mask: false,
      first_open_toast: false
    })
    if (wx.getStorageSync('open_num') == 1) {
      wx.setStorageSync('open_num', wx.getStorageSync('open_num') + 1)
    }
    request.login(function (res) {
      _this.setData({
        account_info: res,
        show_login_loading: false,
      })
      let newAccount = wx.getStorageSync('new_account_toast')
      if (wx.getStorageSync('new_account_toast') && !_this.data.change_show) {
        wx.setStorageSync('new_account_toast', false)
        _this.setData({
          show_new_account_toast: true
        })
      }
      _this.againAccountBehavior(_this.data.log_in_data, _this.data.log_in_type, newAccount)
    }, this)
  },
  againAccountBehavior(e, type, new_account) {
    if (type == 'main') {
      this.showComtBox()
    } else if (type == 'reply') {
      this.mainCommentAction(e)
    } else if (type == 'comment_like') {
      this.commentLike(e)
    } else if (type == 'heart_card') {
      this.heartBtn(e)
    } else if (type == 'star_card') {
      this.starBtn(e)
    } else if (type == 'share_card') {
      this.judgeShare(e)
    } else if (type == 'to_me') {
      if (!new_account) {
        this.toMy()
      }

    } else if (type == 'toAddCard') {
      if (!new_account) {
        this.toAddCard()
      }

    } else if (type == 'get_card') {
      this.getCard()
    } else if (type == 'like_card') {
      this.likeCard(e)
    } else if (type == 'want_card') {
      this.wantCard(e)
    } else if (type == 'sellCard') {
      this.sellCard(e)
    } else if (type == 'showComtBox') {
      this.showComtBox(e)
    } else if (type == 'mainCommentAction') {
      this.mainCommentAction(e)
    } else if (type == 'commentLike') {
      this.commentLike(e)
    } else if (type == 'sendAssess') {
      this.sendAssess()
    } else if (type == 'showIPOToast') {
      this.showIPOToast()
    } else if (type == 'toMySquare') {
      this.toMySquare()
    }

  },
  metaSwiperLongTap(e) {
    if (this.data.change_show) {
      return
    }
    this.setData({
      show_assess_result_pop: {
        id: 1,
        show: false
      }
    })
    if (!this.judgeLogOn(e, '')) {
      if (!this.data.change_show) {
        wx.showToast({
          title: '您尚未登录，登录后即可拥有你的元宇宙！',
          icon: 'none',
          duration: 2000
        })
      }

      return
    }
    if (this.data.account_info.cpoint < 10) {
      this.setData({
        no_cp_toast: true

      })
      return
    }
    console.log(e.detail.currentTarget.dataset.item)
    let item = e.detail.currentTarget.dataset.item
    if (showSuccess) {
      return
    }
    if (item.card_type == 'BONUS') {
      if (this.data.change_show) {
        wx.showToast({
          title: '该卡片无法Pick',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '该碎片无法Pick',
          icon: 'none'
        })
      }

      return
    }
    if (item.card_type == 'SQUARE') {
      if (this.data.change_show) {
        wx.showToast({
          title: '地盘卡片无法Pick',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '地盘碎片无法Pick',
          icon: 'none'
        })
      }

      return
    }
    console.log('item', item)
    if (item.assessing) {
      if (this.data.change_show) {
        wx.showToast({
          title: '该卡片无法Pick',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '宇宙首发中的碎片无法Pick',
          icon: 'none'
        })
      }

      return
    }
    selectCardTouching = true
    let _this = this
    if (this.data.show_assess_result_pop.show) {
      setTimeout(function () {
        if (_this.data.change_show) {

          _this.setData({
            show_pick_card_first_loading: true,
            show_select_card_loading: true,
            get_card_bottom_content: '即将Pick卡片...',
            show_assess_result_pop: {
              id: 1,
              show: false
            }
          })
        } else {
          _this.setData({
            show_pick_card_first_loading: true,
            show_select_card_loading: true,
            get_card_bottom_content: '即将Pick宇宙碎片...',
            show_assess_result_pop: {
              id: 1,
              show: false
            }
          })
        }


        _this.circleAnimation(item)
      }, 500)
    } else {
      if (_this.data.change_show) {
        _this.setData({
          show_pick_card_first_loading: true,
          show_select_card_loading: true,
          get_card_bottom_content: '即将Pick卡片...',
        })
      } else {
        _this.setData({
          show_pick_card_first_loading: true,
          show_select_card_loading: true,
          get_card_bottom_content: '即将Pick宇宙碎片...',
        })
      }



      _this.circleAnimation(item)

    }



  },
  metaSwiperTouchEnd(e) {
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
        if (!wx.getStorageSync('have_pick')) {
          wx.setStorageSync('have_pick', true)
          _this.changeNotification()
        }
        // _this.selectSuccess()
      }
    }, 750)
  },
  pickCardTheSecondStep(item) {
    if (this.data.account_info.cpoint < 10) {
      // this.showToast('CP不足10，无法Pick；您可以[创造]或[售出]碎片，获取更多CP。', 2500)

      this.setData({
        show_pick_second_loading: false
      })
      showSuccess = false
      this.metaSwiperTouchEnd()
      return
    }

    let _this = this

    let endRequest = false
    let requestData = ''
    request.pickCardRequest(item.card_id, function (res) {
      endRequest = true
      requestData = res

      _this.getAccountInfo(true)
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
        _this.metaSwiperTouchEnd()
        return
      }

      let getProbability = 0.8 * ((item.total_card_num - item.surplus_card_num) / item.total_card_num) * Math.min(1.0, 50 / item.card_cpoint) * 100
      getProbability = getProbability.toFixed(1)

      let accountInfo = _this.data.account_info
      accountInfo.cpoint = accountInfo.cpoint - 10

      if (_this.data.change_show) {
        _this.setData({
          account_info: accountInfo,
          show_pick_card_first_loading: false,
          show_pick_second_loading: true,
          get_card_bottom_content: '尝试Pick卡片中，获取概率' + getProbability + '%...',
          no_touch: true
        })
      } else {
        _this.setData({
          account_info: accountInfo,
          show_pick_card_first_loading: false,
          show_pick_second_loading: true,
          get_card_bottom_content: '尝试Pick碎片中，获取概率' + getProbability + '%...',
          no_touch: true
        })
      }


      let second = 0;
      let interval = setInterval(function () {
        second += 5
        if (endRequest) {


          if (second >= 30) {
            clearInterval(interval)
            _this.getAccountInfo(false)

            if (requestData.data.id == 0) {
              _this.setData({
                show_pick_second_loading: false,
                get_card_bottom_content: '恭喜您，Pick成功！',
                loading_color: '#E7C385'
              })
              if (_this.data.change_show) {
                wx.showToast({
                  title: '恭喜您，Pick成功，获取了这张卡片+1',
                  icon: 'none',
                  duration: 2000
                })
              } else {
                wx.showToast({
                  title: '恭喜您，Pick成功，获取了这块宇宙碎片+1',
                  icon: 'none',
                  duration: 2000
                })
              }

              let list = _this.data.card_list
              let newItem = ''
              for (let i = 0; i < list.length; i++) {
                if (item.card_id == list[i].card_id) {
                  list[i].pick_num = list[i].pick_num + 1
                  list[i].card_lv_day1 = list[i].card_lv_day1 + 1
                  list[i].card_lv_day7 = list[i].card_lv_day7 + 1
                  list[i].card_lv_day30 = list[i].card_lv_day30 + 1
                  list[i].card_cpoint = list[i].card_cpoint + 3
                  list[i].surplus_card_num = list[i].surplus_card_num + 1
                  list[i].have_card_num = list[i].have_card_num + 1

                  list[i].card_cpoint_day1 = list[i].card_cpoint_day1 + 3
                  list[i].card_cpoint_day7 = list[i].card_cpoint_day7 + 3
                  list[i].card_cpoint_day30 = list[i].card_cpoint_day30 + 3
                  newItem = list[i]
                  _this.setData({
                    ['card_list[' + i + ']']: newItem,
                  })
                  break
                }
              }
              _this.selectComponent('#swiper').updateItem(newItem);

              setTimeout(function () {
                wx.navigateTo({
                  url: '../card_detail/card_detail?show_pick_toast=true&card_id=' + item.card_id
                })
                _this.setData({
                  show_pick_second_loading: false
                })

                setTimeout(function () {
                  _this.setData({
                    show_pick_second_loading: false,
                    no_touch: false
                  })
                }, 500)
                // item.have_card_num++
                // item.card_lv++
                // item.card_cpoint += 3
                // _this.selectComponent('#swiper').updateItem(item);

                showSuccess = false
                _this.metaSwiperTouchEnd()

              }, 2000)
            } else {
              if (_this.data.change_show) {
                _this.setData({
                  show_pick_second_loading: false,
                  get_card_bottom_content: '很遗憾，没有获取到卡片',
                  loading_color: '#F46563',
                  no_touch: false
                })
                _this.showToast('Pick失败，已为您加入[想要]，10分钟后可再次Pick。先去Pick别的卡片吧！', 3500)

              } else {
                _this.setData({
                  show_pick_second_loading: false,
                  get_card_bottom_content: '很遗憾，没有获取到碎片',
                  loading_color: '#F46563',
                  no_touch: false
                })
                _this.showToast('Pick失败，已为您加入[想要]，10分钟后可再次Pick。先去Pick别的碎片吧！', 3500)

              }


              _this.setData({
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
                  let list = _this.data.card_list
                  let newItem = ''
                  for (let i = 0; i < list.length; i++) {
                    if (item.card_id == list[i].card_id) {
                      list[i].pick_num = list[i].pick_num + 1
                      list[i].card_lv_day1 = list[i].card_lv_day1 + 1
                      list[i].card_lv_day7 = list[i].card_lv_day7 + 1
                      list[i].card_lv_day30 = list[i].card_lv_day30 + 1
                      list[i].card_cpoint = list[i].card_cpoint + 3
                      list[i].card_cpoint_day1 = list[i].card_cpoint_day1 + 3
                      list[i].card_cpoint_day7 = list[i].card_cpoint_day7 + 3
                      list[i].card_cpoint_day30 = list[i].card_cpoint_day30 + 3
                      list[i].wanted = true
                      newItem = list[i]
                      _this.setData({
                        ['card_list[' + i + ']']: newItem,
                        fail_pick_ant: '',
                        show_fail_pick_ant: false
                      })
                      break
                    }
                  }
                  _this.selectComponent('#swiper').updateItem(newItem);
                }, 3000)
              })


              setTimeout(function () {
                _this.setData({
                  show_pick_second_loading: false
                })
                showSuccess = false
                _this.metaSwiperTouchEnd()
              }, 3500)
            }
          }
        }
      }, 500)

    })

  },
  swiperChangeToReq(e) {
    let data = e.detail
    indexData = data

    browseCardNum++
    let _this = this
    setTimeout(function () {
      if (browseCardNum >= 10) {
        if (!wx.getStorageSync('not_the_first_show_crearte_card')) {
          wx.setStorageSync('show_crearte_card', true)
          wx.setStorageSync('not_the_first_show_crearte_card', true)
          browseCardNum = 0
          _this.changeNotification()
        } else if (browseCardNum >= 50) {
          wx.setStorageSync('show_crearte_card', true)
          browseCardNum = 0
          _this.changeNotification()
        }
      }
    }, 0)


    if (data.index == -1 && !data.showToast) {
      return
    }
    // if (data.showToast) {
    //   if (haveShowedAllCard) {
    //     wx.showToast({
    //       title: '暂无更多宇宙碎片了~~',
    //       icon: 'none'
    //     })
    //   } else {
    //     wx.showToast({
    //       title: '正在加载新的宇宙碎片...',
    //       icon: 'none'
    //     })
    //   }
    //   return
    // }
    setTimeout(function () {
      let index = data.index
      if (index >= (_this.data.card_list.length - 10)) {
        _this.getMetaList(false)
      }
      if (!wx.getStorageSync('have_slide')) {
        wx.setStorageSync('have_slide', true)
        _this.changeNotification()
      }
    }, 0)

    currentShowItem = data
    this.judegPop()

  },
  judegPop() {
    currentShowItem.platform = app.globalData.platform
    currentShowItem.getCardHeight = this.data.get_card_height
    currentShowItem.windowHeightpx = this.data.window_height_rpx




    if (currentShowItem.show_assess_pop) {

      let minutes = Math.round(Math.random() * 15 + 15);
      let seconds = minutes * 60

      this.setData({
        seconds: seconds,
        current_show_item: currentShowItem,
        show_assess_comment: {
          id: 1,
          show: false
        }
      })

      let data = {
        card_id: currentShowItem.card_id
      }
      request.createAssessBrowes(data, '')
      let list = wx.getStorageSync('assess_list')
      if (list == '') {
        wx.setStorageSync('assess_list', "" + currentShowItem.card_id)
      } else {
        list = list + ',' + currentShowItem.card_id
        wx.setStorageSync('assess_list', list)
      }
    } else {
      if (this.data.current_show_item != '') {
        this.setData({
          current_show_item: '',
        })
      }
    }

    if (currentShowItem.show_assess_result_pop) {
      if (changeContentAssessId == currentShowItem.card_id) {
        changeContentAssessId = -1
      }
      let meta_list_ids = wx.getStorageSync('meta_list')
      if (meta_list_ids == '') {
        meta_list_ids = []
      }
      meta_list_ids.push(currentShowItem.card_id)
      wx.setStorageSync('meta_list', meta_list_ids)
      this.setData({
        assess_pop_result_top: 0,
        current_assess_result_show_item: currentShowItem,
        show_assess_result_pop: {
          id: 1,
          show: true
        }
      })
    } else {
      if (this.data.show_assess_result_pop.show) {
        this.setData({
          show_assess_result_pop: {
            id: 1,
            show: false
          }
        })
      }

    }

    // if (this.data.change_show) {
    //   return
    // }
    // if (this.data.show_assess_pop) {
    //   this.hideAssessResultPop()
    // }
    // if (shouldShowAssessPop) {
    //   shouldShowAssessPop = false
    //   this.hideAssessPop()
    // }
    // if (currentShowItem.show_assess_pop || currentShowItem.show_assess_result_pop) {
    //   this.setData({
    //     current_show_item: currentShowItem,
    //     show_assess_comment: false
    //   })
    // }




  },

  notificationTap(e) {
    console.log(e)
  },
  changeNotification() {
    if (!onAction) {
      return
    }
    let _this = this
    let haveChagne = false
    let nowShowContent = ''
    if (!assessPopCanShow) {
      if (remindType == 'load_notice') {
        return
      } else {
        remindType = 'load_notice'
      }
      nowShowContent = {
        content: '一大波宇宙高价值碎片正在来袭~请稍候',
        type: -1
      }
      haveChagne = true
    } else if (!wx.getStorageSync('have_slide')) {
      if (remindType == 'have_slide') {
        return
      } else {
        remindType = 'have_slide'
      }
      nowShowContent = {
        content: '[上划]查看更多宇宙碎片，发现宇宙的每个角落~',
        type: -1
      }
      haveChagne = true
    } else if (!wx.getStorageSync('have_pick')) {
      if (remindType == 'have_pick') {
        return
      } else {
        remindType = 'have_pick'
      }
      nowShowContent = {
        content: '[长按碎片]即可Pick，尝试收集你的第一块宇宙',
        type: -2
      }
      wx.setStorageSync('show_meta_pick_toast', true)
      this.selectComponent('#swiper').showPickAnt();
      haveChagne = true
    } else if (remindList.length > 0) {

      if (remindType == 'normal') {
        return
      } else {
        remindType = 'normal'
      }
      this.showNormalNOtification()
      return
    } else if (wx.getStorageSync('show_buy_square_toast').show) {
      if (remindType == 'show_buy_square_toast') {
        return
      } else {
        remindType = 'show_buy_square_toast'
      }
      nowShowContent = {
        content: '去购买宇宙地盘，成为那里的唯一主人！',
        type: -4
      }
      haveChagne = true
    } else if (wx.getStorageSync('show_crearte_card')) {
      if (remindType == 'show_crearte_card') {
        return
      } else {
        remindType = 'show_crearte_card'
      }
      wx.setStorageSync('show_crearte_card', false)
      nowShowContent = {
        content: '[创造]你的高价值宇宙碎片，成为宇宙一员！',
        type: -3
      }
      haveChagne = true
      setTimeout(function () {
        remindType = ''

        _this.remindAnt('')
      }, 8000)
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
    if (!onAction) {
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
        // _this.hideNotification(function () {})
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
    if (!onAction) {
      return ''
    }
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
    if (!onAction) {
      return
    }
    let _this = this
    if (data.type == 11) {
      this.getAccountInfo(false)
    }
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
  toDetail() {
    let item = this.data.now_show_content
    if (item.type == -1 || item.type == -2) {
      request
    } else if (item.type == 6 || item.type == 7) {

      filter.jumpToMePage(item.from_account_id, '')
    } else if (item.type == -3) {
      wx.navigateTo({
        url: '../add_card/add_card'
      })
    } else if (item.type == -4) {
      wx.navigateTo({
        url: '/pages/map/map?lat=' + (-1.0) + '&lng=' + (-1.0) + '&cpoint=' + 0 + '&card_id=' + (-1)
      })
    } else if (item.type == 11) {
      wx.navigateTo({
        url: '../card_detail/card_detail?to_rank_page=true&card_id=' + item.card_id
      })
    } else {
      wx.navigateTo({
        url: '../card_detail/card_detail?card_id=' + item.card_id
      })
    }
  },
  toHandBook() {
    // this.showToast('按键我过军偶过过军奥无过军偶过军过军军过军够过军偶过军过军偶过军奥我偶偶偶',5000)
    wx.navigateTo({
      url: '/pages/map/map?lat=' + (-1.0) + '&lng=' + (-1.0) + '&cpoint=' + 0 + '&card_id=' + (-1)
    })
    // wx.navigateTo({
    //   url: '../handbook/handbook'
    // })
  },
  getAccountInfo(wait) {
    let _this = this
    request.getAccountInfo(function (res) {
      if (wait) {
        res.total_card_cp = _this.data.account_info.total_card_cp
      }
      _this.setData({
        account_info: res
      })
    })
  },
  backList() {
    this.setData({
      show_have_cp_toast: false,
      show_card_cp_toast: false,
      show_card_info_mask: false,
      unenough_cp_toast: false,
      no_cp_toast: false,
      show_new_account_toast: false,
      first_open_toast: false,
      show_inital_buy_toast: false,
      show_square_num_toast: false
    })

    if (wx.getStorageSync('open_num') == 1) {
      wx.setStorageSync('open_num', wx.getStorageSync('open_num') + 1)
    }
  },
  showHaveCpToast() {
    this.setData({
      show_have_cp_toast: true
    })
  },
  showSquareNumToast() {
    this.setData({
      show_square_num_toast: true
    })
  },
  showCardCpToast() {
    this.setData({
      show_card_cp_toast: true
    })
  },
  sellCard(e) {
    if (!this.judgeLogOn(e, 'sellCard')) {
      return
    }

    filter.jumpToMePage(-1, 'to_tab=three')
  },
  sellCard2(e) {
    if (!this.judgeLogOn(e, 'sellCard')) {
      return
    }

    filter.jumpToMePage(-1, 'to_tab=three&new_account_sell=true')
  },
  buyCard() {
    wx.navigateTo({
      url: '../handbook/handbook'
    })
  },
  toAddCard() {
    if (this.judgeLogOn('', 'toAddCard')) {
      wx.navigateTo({
        url: '../add_card/add_card'
      })

    }
  },
  showCardNum(e) {
    if (wx.getStorageSync('change_show')) {
      return
    }
    let cardInfo = e.detail.detail
    let toastContent = showCardInfoUtil.getShowCardNumContent(cardInfo)
    this.setData({
      show_card_info_mask: true,
      contents: toastContent
    })

  },
  showCardLv(e) {
    if (wx.getStorageSync('change_show')) {
      return
    }
    let cardInfo = e.detail.detail
    let toastContent = showCardInfoUtil.getShowCardLvContent(cardInfo)
    this.setData({
      show_card_info_mask: true,
      contents: toastContent
    })

  },
  showCardCPoint(e) {
    if (wx.getStorageSync('change_show')) {
      return
    }
    let cardInfo = e.detail.detail
    let toastContent = showCardInfoUtil.getShowCardCpContent(cardInfo)
    this.setData({
      show_card_info_mask: true,
      contents: toastContent
    })
  },

  showAllInfo(e) {
    let cardInfo = e.detail.detail
    this.setData({
      show_card_info_mask: true,
      contents: {
        backgroud_color: '#F46563',
        info_icon_urlj: '/pages/images/hot_white.png',
        info_icon_size: 100,
        info_icon_to_top_size: 15,
        info_title: '热门 No.' + cardInfo.hot_card_rank,
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
  wantCard(e) {
    let item = e.detail.detail
    let result
    if (!this.judgeLogOn(e, 'want_card')) {
      return
    }
    let origingList = this.data.card_list
    for (let i = 0; i < origingList.length; i++) {
      if (item.card_id == origingList[i].card_id) {
        if (item.wanted) {
          origingList[i].want_num--
          origingList[i].wanted = false;
          result = origingList[i]
        } else {
          origingList[i].want_num++
          origingList[i].wanted = true;
          result = origingList[i]
        }
      }
    }
    request.wantCardReq(result.card_id, result.wanted)
    this.selectComponent('#swiper').changeCardInfo(result);

    this.setData({
      card_list: origingList
    })
    if (result.wanted) {
      wx.showToast({
        title: '已添加到想要列表',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '已从想要列表移除',
        icon: 'none'
      })
    }
  },
  likeCard(e) {
    let item = e.detail.detail
    let result
    if (!this.judgeLogOn(e, 'like_card')) {
      return
    }
    let origingList = this.data.card_list
    for (let i = 0; i < origingList.length; i++) {
      if (item.card_id == origingList[i].card_id) {
        if (item.liked) {
          origingList[i].like_num--
          origingList[i].liked = false;
          result = origingList[i]
        } else {
          origingList[i].like_num++
          origingList[i].liked = true;
          result = origingList[i]
        }
      }
    }
    request.likeCardReq(result.card_id, result.liked)
    this.selectComponent('#swiper').changeCardInfo(result);

    this.setData({
      card_list: origingList
    })
    if (result.liked) {
      wx.showToast({
        title: '点赞成功',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '已取消点赞',
        icon: 'none'
      })
    }
  },
  updateNewItem() {
    let _this = this
    if (this.data.addData != '') {
      let toastContent = '碎片创造成功，正在全宇宙首发！\n首发产生初始[交易价值]后，即可用于后续交易。'
      if (this.data.change_show) {
        toastContent = '卡片创造成功'
      }
      let toIndex = 0 + indexData.index
      let result = []
      let targetIndex = 0
      index = 1
      let origingList = this.data.card_list
      for (let i = 0; i < origingList.length; i++) {

        origingList[i].index = index
        result.push(origingList[i])
        index++
        if (i + 1 == toIndex) {
          let data = this.data.addData
          data.index = index
          result.push(data)
          targetIndex = index
          index++
        }
      }
      let cardType = this.data.addData.card_type
      this.setData({
        card_list: result,
        addData: ''
      }, function () {
        _this.selectComponent('#swiper').init(targetIndex);
        indexData.index = targetIndex
        if (cardType != 'SQUARE') {
          _this.showToast(toastContent, 5500)

        }

      })

    }
  },
  showToast(content, duration) {
    this.setData({
      show_toast: true,
      toast_content: content,
      toast_duration: duration
    })
  },
  updateExistItem() {
    let _this = this
    if (this.data.update_item != '' && !this.data.update_item.assessing) {
      let updateItem = this.data.update_item
      let originList = this.data.card_list
      for (let i = originList.length - 1; i >= 0; i--) {

        if (updateItem.card_id == originList[i].card_id) {
          if (updateItem.card_cpoint < originList[i].card_cpoint) {
            return
          }
          updateItem.index = originList[i].index
          updateItem.assessing = originList[i].assessing
          updateItem.show_assess_pop = originList[i].show_assess_pop
          updateItem.show_assess_result_pop = originList[i].show_assess_result_pop
          // originList[i] = updateItem
          this.setData({
            ['card_list[' + i + ']']: updateItem,
            update_item: ''
          }, function () {
            _this.selectComponent('#swiper').updateItem(updateItem);
          })
          break;
        }
      }
    }
  },
  // 拖动过程中触发的事件
  sliderchanging(e) {
    var value = e.detail.value;
    this.setData({
      selected_value: true,
      value: value
    })
  },
  // 完成一次拖动后触发的事件
  sliderchange(e) {
    var value = e.detail.value;
    this.setData({
      selected_value: true,
      value: value
    })
  },
  showInputBox() {
    this.setData({
      assess_content_for_input: this.data.assess_content,
      input_place_holder: "发布吐槽 & 彩虹屁，获得10CP",
      showComtBox: true,

    })
  },
  // 失去焦点
  comtBlur() {

    this.setData({
      showComtBox: false,
      assess_content: assessContent,
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
    ctInput_top -= ctInput_h

    this.setData({
      ctInput_top: ctInput_top,
      keyboard_h: keyboard_h
    })
  },

  ctLineChange() {
    let e = {
      detail: {
        height: this.data.keyboard_h
      }
    }
    this.ctFocus(e)
  },
  doneTap(e) {

  },
  codeInput(e) {
    assessContent = e.detail.value
  },
  sentAssessComment() {
    if (currentShowItem.assess_comment) {
      this.showToast('您已为该碎片提交过首发评论了', 2500)
      return
    }

    this.setData({
      show_assess_comment: {
        id: 1,
        show: true
      },
      assess_content: assessContent,
    })

  },
  showIPOToast(e) {
    if (!this.judgeLogOn('', 'showIPOToast')) {
      return
    }
    if (this.data.current_show_item.show_ipoed) {
      this.showToast('每人只能认购1张同样的首发宇宙碎片\n您已认购该碎片', 2500)
      return
    }
    let showType = 0
    if (this.data.current_show_item.initial_cp > this.data.account_info.cpoint) {
      showType = 1
    }
    this.setData({
      show_inital_buy_toast: true,
      initial_cp_show_type: showType
    })
  },
  leftInitalBuy(e) {
    if (this.data.initial_cp_show_type == 0) {
      this.ipoCard()
    } else {

      filter.jumpToMePage(-1, 'to_tab=three')

    }
    this.setData({
      show_inital_buy_toast: false
    })
  },
  rightInitalBuy(e) {
    if (this.data.initial_cp_show_type == 0) {

    } else {
      wx.navigateTo({
        url: '../add_card/add_card'
      })
    }
    this.setData({
      show_inital_buy_toast: false
    })
  },
  ipoCard() {

    let data = {
      card_id: currentShowItem.card_id,
      assess_num: 0,
      content: ''
    }
    let _this = this
    request.createAssessInfo(data, function (add) {
      if (add.result == 0) {
        currentShowItem.show_ipoed = true
        currentShowItem.assess_surplus_card_num = currentShowItem.assess_surplus_card_num - 1

        currentShowItem.have_card_num = currentShowItem.have_card_num + 1
        _this.showToast('恭喜您，首发认购成功，获取了这块宇宙碎片+1', 3500)
        let list = _this.data.card_list
        for (let i = 0; i < list.length; i++) {
          if (currentShowItem.card_id == list[i].card_id) {
            // list[i] = currentShowItem
            _this.setData({
              ['card_list[' + i + ']']: currentShowItem,
              current_show_item: currentShowItem,
              no_touch: true
            })
            _this.selectComponent('#swiper').updateItem(currentShowItem);
            console.log("currentShowItem", currentShowItem)
            break
          }
        }


        setTimeout(function () {
          wx.navigateTo({
            url: '../card_detail/card_detail?show_assess_toast=true&card_id=' + currentShowItem.card_id
          })
          setTimeout(function () {
            _this.setData({
              no_touch: false
            })
          }, 500)
        }, 2000)
      } else {
        wx.showToast({
          title: add.msg,
          icon: 'none',
          duration: 2500
        })
      }
    })


    // shouldShowAssessPop = false
    // this.hideAssessPop()


  },
  sendAssess() {
    if (!this.judgeLogOn('', 'sendAssess')) {
      return
    }
    if (this.data.assess_content.length <= 0) {
      this.showToast('评论不能为空', 2000)
      return
    }
    let data = {
      card_id: currentShowItem.card_id,
      content: this.data.assess_content
    }
    let _this = this
    request.createAssessComment(data, function (add) {
      if (add.result == 0) {

        let accountInfo = _this.data.account_info
        accountInfo.cpoint = accountInfo.cpoint + 10
        _this.setData({
          account_info: accountInfo
        })
        wx.showToast({
          title: '提交评论成功，已为您+10CP！',
          icon: 'none',
          duration: 2500
        })
      } else {
        wx.showToast({
          title: add.msg,
          icon: 'none',
          duration: 2500
        })

      }
    })

    currentShowItem.assess_comment = true

    let list = this.data.card_list
    for (let i = 0; i < list.length; i++) {
      if (currentShowItem.card_id == list[i].card_id) {
        // list[i] = currentShowItem
        this.setData({
          show_assess_comment: {
            id: 1,
            show: false
          },
          ['card_list[' + i + ']']: currentShowItem,
          current_show_item: currentShowItem,
          assess_content: ''
        })
        this.selectComponent('#swiper').updateItem(currentShowItem);
        break
      }
    }



    // this.selectComponent('#swiper').init(currentShowItem.index + 1);

  },
  backInitalAssess() {

    this.setData({
      show_assess_comment: {
        id: 1,
        show: false
      }
    })
  },
  showAssessResult() {
    if (this.data.show_assess_result_pop.show) {
      this.setData({
        show_assess_result_pop: {
          id: 1,
          show: false
        }
      })
    } else {
      this.setData({
        assess_pop_result_top: 0,
        show_assess_result_pop: {
          id: 1,
          show: true
        },
        current_assess_result_show_item: currentShowItem
      })
    }
  },
  metaSwiperTap(e) {

    if (this.data.show_assess_result_pop.show) {
      // this.hideAssessResultPop()
      this.setData({
        show_assess_result_pop: {
          id: 1,
          show: false
        }
      })
      return
    }
    let cardInfo = e.detail.currentTarget.dataset.item
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + cardInfo.card_id
    })
  },
  getAssessList(getList) {
    // if (this.data.change_show) {
    //   this.getMetaList(true)
    //   return
    // }

    let _this = this
    let list = wx.getStorageSync('assess_list')

    let data = '-1,' + shareAssessId

    for (let i = 0; i < assessList.length; i++) {
      data = data + ',' + assessList[i].card_id
    }
    if (list != '') {
      data = data + ',' + list
    }

    let showResultList = '-1,' + shareAssessId
    for (let i = 0; i < assessList.length; i++) {
      if (assessList[i].show_assess_result_pop) {
        showResultList = showResultList + ',' + assessList[i].card_id
      }
    }

    request.getAssessList(data, showResultList, function (res) {
      if (isGettingMetaList) {
        return
      }

      let assessResultList = []
      let assessingList = []


      for (let i = 0; i < assessList.length; i++) {
        if (assessList[i].show_assess_result_pop) {
          assessResultList.push(assessList[i])
        } else {
          assessingList.push(assessList[i])
        }
      }
      for (let i = 0; i < res.length; i++) {
        res[i].have_added = false
        if (res[i].show_assess_result_pop) {
          assessResultList.push(res[i])
        } else {
          assessingList.push(res[i])
        }
      }
      assessList = assessResultList
      assessList = assessList.concat(assessingList)

      if (getList) {
        _this.getMetaList(true)
      } else {
        let haveChangeAssess = false
        let oldeList = _this.data.card_list
        if (oldeList == undefined || oldeList.length <= 0) {
          return
        }
        let num = addAssessIndex + 0
        for (let i = num; i < assessList.length; i++) {

          let assessItem = _this.getAssessItem(false)
          if (assessItem == '') {
            continue
          }
          let nextIndex = lastAdd + 5
          while (true) {
            if (currentShowItem.index > nextIndex - 2) {
              nextIndex = nextIndex + 5
            } else {
              break
            }
          }


          if (nextIndex <= oldeList.length) {
            let otherAdd = 0
            haveChangeAssess = true
            let nowAddIndex = nextIndex + 0
            let newList = []
            for (let i = 0; i < oldeList.length; i++) {
              let item = oldeList[i]
              if (item.index == nowAddIndex) {
                otherAdd++
                addAssessIndex++
                assessItem.index = nowAddIndex
                assessItem.have_added = true
                newList.push(assessItem)
                index++
                lastAdd = nextIndex
                nextIndex = nextIndex + 5
              }
              item.index = item.index + otherAdd
              newList.push(item)

            }
            oldeList = newList
          }
        }
        if (haveChangeAssess) {
          if (isGettingMetaList) {
            return
          }


          _this.setData({
            card_list: oldeList
          })
        }


      }
    })
  },
  watch: {
    isCreateShareImage: function (val, old) {
      // console.log('old, val==============');
      if (!val) {
        return
      }
      if (createShareImageResolve != '') {
        // contentString.substr(0, 8)
        let contentString = ''
        if (currentShowItem.title.length > 0) {
          contentString = currentShowItem.title
        } else if (currentShowItem.content.length > 0) {
          contentString = currentShowItem.content
        } else {
          contentString = currentShowItem.card_show_id
        }

        if (contentString.length > 8) {
          contentString = contentString.substr(0, 8) + '...'
        }

        let content = '[' + contentString + ']有' + currentShowItem.total_assess_num + '人认购起价' + currentShowItem.initial_cp_result + 'CP，离元宇宙购地更近一步'

        wx.hideLoading()
        this.setData({
          isCreateShareImage: false
        })
        createShareImageResolve({
          title: content,
          path: '/pages/explore_metaverse/explore_metaverse?card_id=' + currentShowItem.card_id + '&share_type=1',
          imageUrl: shareInfo.image_url
        })
      }
    }
  },
  init(res) {
    let _this = this
    console.log(res)
    let beishu = 8
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    canvas.width = beishu * 250;
    canvas.height = beishu * 200

    if (currentShowItem.images[0].vertical) {
      trueCardRequest.createShareVerticalImage(ctx, canvas, currentShowItem, _this, function (res) {
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
      trueCardRequest.createHorizontalImage(ctx, canvas, currentShowItem, _this, function () {
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
  showComment(e) {
    let cardInfo = e.detail.detail
    showCommentCardItem = cardInfo
    let _this = this
    request.getCardComment(cardInfo.card_id, function (res) {
      totalComments = res.list;
      let totalCommentNum = 0;
      for (let i = 0; i < totalComments.length; i++) {
        totalCommentNum++;
        totalCommentNum = totalCommentNum + totalComments[i].reply_comment.length
        // product[i].ratio=product[i].images[0].height/product[i].images[0].width
      }
      _this.setData({
        comments: totalComments,
        totalCommentNum: totalCommentNum,
        show_comment: true
      })

    })

  },
  showComtBox(e) {
    if (!this.judgeLogOn(e, 'showComtBox')) {
      return
    }
    console.log(e)
    commentType = "main"
    this.setData({
      input_place_holder: "说点什么吧…",
      showCommentBox: true
    })
  },
  mainCommentAction(e) {
    if (!this.judgeLogOn(e, 'mainCommentAction')) {
      return
    }
    commentType = "reply"


    mainComment = e.currentTarget.dataset.item
    this.setData({
      input_place_holder: "回复  @" + mainComment.account_name + ":",
      showCommentBox: true
    })

  },
  // 失去焦点
  commentBlur() {
    this.setData({
      showCommentBox: false
    })
  },
  async commentInputFocus(e) {
    let {
      windowHeight
    } = this.data
    let keyboard_h = e.detail.height
    let ctInput_top = windowHeight - keyboard_h
    let ctInput_h = await app.queryNodes('#commentInput', 'height')
    ctInput_top -= ctInput_h

    this.setData({
      ctInput_top: ctInput_top,
      keyboard_h: keyboard_h
    })
  },
  commentLineChange() {
    // let e = {
    //   detail: {
    //     height: this.data.keyboard_h
    //   }
    // }
    // this.ctFocus(e)
  },
  sentComment(e) {
    let _this = this
    console.log(e)
    console.log(this.data.comments)
    let userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo)
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
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    wx.request({
      url: prefix + '' + showCommentCardItem.card_id + '/comments', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: newComment,
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        console.log("????????????????????????????????????????????")
        console.log(res)
        showCommentCardItem.comment_num++
        _this.setData({
          update_item: showCommentCardItem
        })
        _this.updateExistItem()
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
        let cardInfo = showCommentCardItem
        if (!cardInfo.have_self_inscription && cardInfo.have_card_num > 0) {
          comment.owner_inscription = true
          cardInfo.have_self_inscription = true
          _this.setData({
            data: cardInfo
          })
        }
        if (commentType == 'main') {
          let commentss = [comment]
          console.log("1111111111????????????????????????????????????????????")
          console.log(comment)
          commentss = commentss.concat(totalComments)

          totalComments = commentss
          console.log(totalComments)
          let totalCommentNum = _this.data.totalCommentNum
          totalCommentNum++
          _this.setData({
            totalCommentNum: totalCommentNum,
            comments: commentss
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
            comments: totalComments
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
  commentLike(e) {
    if (!this.judgeLogOn(e, 'commentLike')) {
      return
    }
    let commentInfo = e.currentTarget.dataset.item
    console.log(totalComments)
    for (let i = 0; i < totalComments.length; i++) {
      if (commentInfo.reply_comment_id == undefined) {
        if (totalComments[i].id == commentInfo.id) {
          let reqResult = {
            reply_comment_id: -1,
            card_id: showCommentCardItem.card_id,
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
                card_id: showCommentCardItem.card_id,
                comment_id: commentInfo.comment_id
              }
              console.log(reqResult)
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
      comments: totalComments
    })
    console.log(e)
  },
  likeComentReq(e) {
    let userInfo = wx.getStorageSync('userInfo')
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
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
  putScanQcCode(e, jumpAccountID) {
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
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    wx.request({
      url: prefix + 'account_scan?card_id=' + e + '&account_id=' + jumpAccountID, //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      success(res) {

      }
    })
  },
  universeAnt() {
    var animation2 = wx.createAnimation({
      duration: 5000,
      timingFunction: "linear",
      delay: 0
    })
    animation2.rotate(360).step();

    this.setData({
      universe_ant: animation2.export()
    })
    let _this = this
    let num = 1
    setInterval(function () {
      num++
      animation2.rotate(360 * num).step();
      _this.setData({
        universe_ant: animation2.export()
      }, )

    }, 5000)
  },
  saveCardToast() {
    this.setData({
      show_dialog: true
    })
  },
  toTheOtherMyPage() {

    filter.jumpToMePage(currentShowItem.account_id, '')

  },
  loadedImg(e) {


    let updateItem = e.detail.detail
    let originList = this.data.card_list
    for (let i = 0; i < originList.length; i++) {

      if (updateItem.card_id == originList[i].card_id) {
        updateItem.loaded_img = true
        this.setData({
          ['card_list[' + i + ']']: updateItem
        })
        this.selectComponent('#swiper').updateItem(updateItem);
      }
    }
  },
  toBuySquare() {
    wx.navigateTo({
      url: '/pages/map/map?lat=' + (-1.0) + '&lng=' + (-1.0) + '&cpoint=' + 0 + '&card_id=' + (-1)
    })
    this.setData({
      show_square_num_toast: false
    })
  },
  toMySquare() {
    if (!this.judgeLogOn('', 'toMySquare')) {
      return
    }

    filter.jumpToMePage(-1, 'to_tab=four')
    this.setData({
      show_square_num_toast: false
    })
  }
})