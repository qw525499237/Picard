var request = require('../common/request.js');
var showCardInfoUtil = require('../common/utils/show_card_info_util.js');
var ctx_urils = require("../common/utils/ctx_utils");
var filter = require("../common/utils/filter");

let prefix = ''


var EARTH_RADIUS = 6378137.0; //单位M
//当前定位位置
var nlatitude = 0.0
var nlongitude = 0.0
//当前所选择功能碎片  0 未选择，1 扩块碎片，2 Plus碎片，3 远程碎片
var nowGetCard = 0

//扩块碎片扩块过程中进制点击状态
var forbid_click = false;

//获取的应用二维码url
let qcCodeUrl = ''

//是否正在登陆
let isLogining = false

//点击地图上的marke
let isClickMarket = false //是否点击了地图上的marke
let nowShowDetailID = 0 //当前选中的地图上stack id
let marketClickTimeOut = "" //点击了地图以取消中间态

//是否在下载视频（暂时弃用）
let isDownloadingVideo = false

//充能定时器 
let rechargeInternal = '' //充能定时器
let haveCountDown = false //充能定时器是否正在运行
let rechargeTime = 0 //定时器宣誓时间

//判断碎片是否是范围内的碎片所限定范围
let distance = 100;

let touchDotX = 0; //X按下时坐标
let touchDotY = 0; //y按下时坐标
let interval; //计时器
let time = 0; //从按下到松开共多少时间*100

//当前页面是否处于活动状态
let onAction = true;

//抽碎片
let nowSelectCardPercent = 0 //长按抽碎片进度条百分比
let showSuccess = false //长按抽碎片当前状态
let selectCardTouching = false
let getCardLoadingInterval = '' //长按抽碎片进度定时器
let updateAccountCpUp = false //抽碎片完成后何时更新兑字内容

//是否正在获取视野范围内碎片
let isGettingZoneCard = false

//地图上所显示marke
let allMarkers = []
var map = new Map();

//定位范围内的碎片
let mapZoneCard = [];


//swiper 自定义圆点显示
let listNowSHow = 0
let lastListNowSHow = 0
let lastListNowSHowPointStatus = 'down'

//信息栏当前显示list
let nowShowList = []
//热碎片列表
let hotListResult = []

//实体碎片
let canShowNowShowTrueCardList = true //能否展示弹出实体碎片
let numPercent = '' //生成实体碎片进度计时器
let showTureCardListType = '' //当前显示的实体碎片列表
let isShowToast = false //是否展示弹出实体碎片toast
let makeImgCardSuccess = false //实体碎片制作状态
let downloadList = [] //实体碎片视频下载列表（暂时弃用）

//兑换帮列表数据及当前所显示index
let loopShowList = []
let loopNowNum = 0

//热碎片列表所显示进度以及是否是显示的热碎片列表
let cardInfoCurrent = 0
let isShowHotCardList = false
let hotCardListPointStatus = 'down'

let zoomCardListCurrent = 0
let zoomCardListPointStatus = 'down'

//重定位计时器
let reGetLocationInterval = ''
//判断文字宽度所用canvas
let judgeCOntentLineContext = ''

let jumpMyLocation = false

let cardInfo = ''
let showCardDetail = false

let mapIsReadied = false

let buySquareRefresh = false

let squareInfo = {
  lat: 0.0,
  lng: 0.0,
  title: "",
  content: ""
}

let showTitleItem = ''


var QQMapWX = require('../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

let _locationChangeFn = ''

const app = getApp()
let ctx = ''
let diffLat = [0.0038139659801288417, 0.0037917575024550842, 0.003768394018702992, 0.003743882645668606, 0.0037182308496888083, 0.0036914464445771955, 0.003663537589137178, 0.003634512784639554, 0.0036043808723142945, 0.003573151030707322, 0.0035408327726784705, 0.003507435942651682, 0.0034729707136982313, 0.003437447584222042, 0.0034008773748759324, 0.003363271225325093, 0.0033246405908258225, 0.003284997238580445, 0.003244353244340914, 0.0032027209886820174, 0.003160113153171551, 0.0031165427165760207, 0.0030720229509171304, 0.0030265674172937906, 0.0029801899619101846, 0.0029329047117911955, 0.0028847260705120448, 0.002835668713672135, 0.002785747584688636, 0.002734977890050061, 0.0026833750945982615, 0.002630954917108852, 0.0025777333252676726, 0.0025237265309030477, 0.0024689509849693536, 0.0024134233726442744, 0.002357160608170261]


Page({
  /**
   * 页面的初始数据
   */
  data: {
    latitude: 39.908429,
    longitude: 116.45972,
    show_buy_btn: true,
    square_width: 96,
    scale: 17.656, //地图缩放等级
    can_zoom: true, //地图是否可以缩放
    can_scroll: true, //地图是否可以滑动
    min_scale: 14, //地图最小缩小层级
    show_circle: false, //是否显示扩块碎片动画圆
    show_mask: true, //是否显示抽碎片swiper
    toast_content: '创造碎片，让别人在这里集碎片', //通知栏内容
    card4: "随机Pick", //抽碎片btn文字
    showCardList: true, //信息栏是否展示列表
    showCardDetail: false, //信息栏是否展示stack列表
    animationData: '', //扩块碎片圆的动画
    ssr_num: 0, //范围内稀有碎片数量
    sr_num: 0, //范围内普通碎片数量
    account_info: {
      account_id: 0,
      zomm_card_num: 0,
      plus_card_num: 0,
      move_card_num: 0,
      can_get_prize_num: '登录后可以兑换黄油啤酒',
      cpoint: 0
    }, //用户信息
    loop_show_content: '价值蹿升榜', //价值蹿升榜内容
    show_zoom_toast: false,
    show_select_card_loading: false,
    get_card_bottom_content: '选择一块碎片，长按获取该碎片',
    show_get_card_animation: false,
    show_getting_card_loading: false,
    show_getting_card_animation: '',
    auto_play_swiper: false,
    auto_play_swiper_interval: 500,
    imgUrls: [],
    get_card_inofs: [],
    show_arrow_up: false,
    arrow_down_url: '/pages/images/arrow_down.png',
    current: 0,
    current2: 0,
    current3: 0,
    recharge_time: '',
    get_card_num: 3,
    create_card_num: 1,
    no_qccode: false,
    select_zoom_skill: false,
    select_plus_skill: false,
    select_move_skill: false,
    zoom_skill_num: 3,
    plus_skill_num: 4,
    move_skill_num: 2,
    select_card_percent: 0,
    loading_width: 0,
    use_function_card: false,
    card_icon: '/pages/images/triple.png',
    lv_up_list: [],
    // 触摸开始时间
    touchStartTime: 0,
    // 触摸结束时间
    touchEndTime: 0,
    // 最后一次单击事件点击发生时间
    lastTapTime: 0,
    // 单击事件点击后要触发的函数
    lastTapTimeoutFunc: null,
    current_status: 'mid',
    show_schedule: true,
    get_true_card_content: '暂无实体碎片',
    true_card_now_show_list: [],
    true_card_show_list_in_bar: [],
    true_card_wait: true,
    true_card_downloading: false,
    now_true_card_type: '[图片碎片]',
    show_true_card_img: false,
    show_true_card_video: false,
    just_show_img_card: false,
    just_show_img_card_animationData: '',
    show_img_card_animationData: '',
    true_card_url: '',
    show_img_card: false,
    show_downloaded_video: false,
    show_downloaded_video_animationData: '',
    video_muted: true,
    video_muted_icon: '/pages/images/mute.png',
    swiperCanMove: true,
    show_img_card_point: false,
    platform: getApp().globalData.platform,
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    show_mid_btn: true,
    deal_info: {
      total_sold_square: 0,
      last_day_sold_square: 0,
      total_account_deal_square: 0,
      last_day_account_deal_square: 0
    },
    markers: [],
    show_markers: [],
    change_show: wx.getStorageSync('change_show')
  },
  ckickCard1() {
    let _this = this
    if (forbid_click) {
      return
    }
    if (nowGetCard == 1) {
      nowGetCard = 0
      this.onReset()
      return
    }
    if (!this.judgeLogOn('', 'ckickCard1')) {
      return;
    }
    if (this.data.account_info.zomm_card_num <= 0) {
      wx.showToast({
        title: '暂未拥有扩块碎片',
        icon: 'none'
      })
      return
    }


    wx.getSetting({
      success(res) {
        var authMap = res.authSetting;
        if (authMap['scope.userLocation']) {
          _this.ckickCard1TrueFunction()
        } else {
          _this.setData({
            get_location_auth_again: true,
          })
        }
      }
    })
  },
  ckickCard1TrueFunction() {
    if (!this.judgeLogOn('', 'ckickCard1')) {
      return;
    }
    if (this.data.account_info.zomm_card_num <= 0) {
      wx.showToast({
        title: '暂未拥有扩块碎片',
        icon: 'none'
      })
      return
    }
    if (forbid_click) {
      return
    }
    if (nowGetCard == 1) {
      nowGetCard = 0
      this.onReset()
    } else {
      forbid_click = true;
      nowGetCard = 1
      zoomCardListCurrent = 0
      zoomCardListPointStatus = 'down'

      this.setData({
        card4: "扩块Pick",
        card_icon: '/pages/images/triple.png',
        can_zoom: false,
        can_scroll: false,
        select_zoom_skill: true,
        select_move_skill: false,
        select_plus_skill: false,
      })

      let _this = this
      const mapCtx = wx.createMapContext('map', this);
      distance = 100
      let itemss = _this.getShowItem(true)
      _this.zoomtMarket({
        id: -100
      })
      let swiperIndex = 0
      if (isShowHotCardList) {
        swiperIndex = cardInfoCurrent
      }
      let toastContent = "已使用[扩块碎片]，范围内Pick概率提高"
      if (isShowHotCardList) {
        toastContent = "范围内没有碎片，无需使用[扩块碎片]"
      }
      this.setData({
        latitude: nlatitude,
        longitude: nlongitude,
        toast_content: toastContent,
        showCardDetail: false,
        showCardList: true,
        // markers: allMarkers,
        // imgUrls: itemss,
        current3: swiperIndex,
        current: swiperIndex,
        markers: allMarkers,
        use_function_card: true,
      })
      mapCtx.moveToLocation({
        latitude: nlatitude,
        longitude: nlongitude,
        success: () => {
          setTimeout(function () {
            // _this.setData({
            //   scale: 17.656,
            // });
            setTimeout(function () {
              _this.setData({
                show_circle: true
              });
            }, 500);
            setTimeout(function () {
              var animation = wx.createAnimation({
                duration: 1500,
                timingFunction: "linear",
                delay: 0
              })
              animation.scale(28, 28).step();
              _this.setData({
                animationData: animation.export()
              })
              setTimeout(function () {

                if (nowGetCard == 1) {
                  _this.setData({
                    animationData: '',
                    circles: [],
                    show_circle: false
                  })
                }
                forbid_click = false;
              }, 1500)
            }, 600)
          }, 200)
        },
        fail: () => {}
      });
    }
  },
  ckickCard2() {
    if (!this.judgeLogOn('', 'ckickCard2')) {
      return;
    }
    if (this.data.account_info.plus_card_num <= 0) {
      wx.showToast({
        title: '暂未拥有Plus碎片',
        icon: 'none'
      })
      return
    }
    if (forbid_click) {
      return
    }
    if (nowGetCard == 2) {
      nowGetCard = 0
      this.onReset()
    } else {
      let itemss = this.getShowItem(false)
      if (nowGetCard == 1 && !this.data.showCardDetail) {
        nowGetCard = 2
        itemss = this.getShowItem(true)
      } else {
        nowGetCard = 2
      }
      let swiperIndex = this.data.current
      if (isShowHotCardList) {
        swiperIndex = cardInfoCurrent
      }
      distance = 100

      this.setData({
        // imgUrls: itemss,
        current3: swiperIndex,
        current: swiperIndex,
        can_zoom: true,
        can_scroll: true,
        show_zoom_toast: false,
        card4: "Plus Pick",
        animationData: '',
        card_icon: '/pages/images/quadruple.png',
        use_function_card: true,
        show_circle: false,
        select_zoom_skill: false,
        select_move_skill: false,
        select_plus_skill: true,
        toast_content: '已使用[PLus]碎片，多收集一块备选碎片',
        circles: []
      })
    }
  },
  ckickCard3() {
    if (!this.judgeLogOn('', 'ckickCard3')) {
      return;
    }
    if (this.data.account_info.move_card_num <= 0) {
      wx.showToast({
        title: '暂未拥有远程碎片',
        icon: 'none'
      })
      return
    }
    if (forbid_click) {
      return
    }
    if (nowGetCard == 3) {
      nowGetCard = 0
      this.onReset()
    } else {
      let itemss = this.getShowItem(false)
      if (nowGetCard == 1 && !this.data.showCardDetail) {
        nowGetCard = 3
        itemss = this.getShowItem(true)
      } else {
        nowGetCard = 3
      }
      let swiperIndex = this.data.current
      if (isShowHotCardList) {
        swiperIndex = cardInfoCurrent
      }
      distance = 100
      // let itemss = this.getShowItem(false)

      let content = '请选择任意位置的碎片'
      if (this.data.showCardDetail) {
        let list = this.data.imgUrls
        if (list.length > 0) {
          if (list[0].card_type == 'SR') {
            content = '已使用[远程碎片]，Pick概率+20%'
          } else {
            let cpoint = list[0].card_cpoint
            if (cpoint <= 500) {
              content = '已使用[远程碎片]，Pick概率+5%'
            } else {
              let probability = (500 / cpoint * 5).toFixed(1)
              content = '已使用[远程碎片]，Pick概率+' + probability + '%'
            }
          }
        } else {
          content = '已使用[远程碎片]，Pick概率+20%'
        }
      }
      this.setData({
        // imgUrls: itemss,
        current3: swiperIndex,
        current: swiperIndex,
        can_zoom: true,
        can_scroll: true,
        use_function_card: true,
        show_zoom_toast: false,
        card4: "远程Pick",
        card_icon: '/pages/images/triple.png',
        animationData: '',
        show_circle: false,
        select_zoom_skill: false,
        select_plus_skill: false,
        select_move_skill: true,
        toast_content: content,
        circles: []
      })
    }
  },
  callouttap(e) {

    clearTimeout(marketClickTimeOut)
    isClickMarket = true
    marketClickTimeOut = setTimeout(function () {
      isClickMarket = false
    }, 200)
    let item = ''
    for (let i = 0; i < allMarkers.length; i++) {
      if (allMarkers[i].id == e.detail.markerId) {
        item = allMarkers[i]
        break
      }
    }

    if (item.group_type == 'square' || item.id == -100) {
      wx.navigateTo({
        url: '../card_detail/card_detail?card_id=' + item.card_info_list[0].card_id
      })
      return
    }
  },
  markertap(e) {
    clearTimeout(marketClickTimeOut)
    isClickMarket = true
    marketClickTimeOut = setTimeout(function () {
      isClickMarket = false
    }, 200)

    let item = ''
    for (let i = 0; i < allMarkers.length; i++) {
      if (allMarkers[i].id == e.detail.markerId) {
        item = allMarkers[i]
        break
      }
    }

    if (item.group_type == 'square' || item.id == -100) {
      wx.navigateTo({
        url: '../card_detail/card_detail?card_id=' + item.card_info_list[0].card_id
      })
      return
    }
    if (nowShowDetailID == e.detail.markerId) {
      this.backCardList()
      return
    }
    nowShowDetailID = e.detail.markerId
    showCardDetail = true
    // console.log(item)
    this.selectedCardDetail(item, false)
  },

  onReset() {
    nowGetCard = 0
    forbid_click = false;
    distance = 100
    let itemss = this.getShowItem(false)

    let swiperIndex = this.data.current
    if (isShowHotCardList) {
      swiperIndex = cardInfoCurrent
    }
    this.setData({
      imgUrls: itemss,
      current3: swiperIndex,
      current: swiperIndex,
      use_function_card: false,
      card4: "随机Pick",
      can_zoom: true,
      can_scroll: true,
      show_circle: false,
      show_zoom_toast: false,
      animationData: '',
      toast_content: '可以在这里收集碎片呦',
      select_zoom_skill: false,
      select_plus_skill: false,
      select_move_skill: false,
      card_icon: '/pages/images/triple.png',
      circles: [],
    })


  },
  getCard() {
    if (!this.judgeLogOn('', 'get_card')) {
      return
    }

    if (nowGetCard == 1 && this.data.ssr_num <= 0 && this.data.sr_num <= 0) {
      wx.showToast({
        title: '[扩块碎片]范围内没有碎片，无需使用。请取消后再进行随机Pick。',
        icon: 'none',
        duration: 1500
      })
      return
    }
    if (this.data.showCardDetail) {
      let item = ''
      for (let i = 0; i < allMarkers.length; i++) {
        if (allMarkers[i].id == nowShowDetailID) {
          item = allMarkers[i]
          break
        }
      }
      // console.log(item)
      if (!this.judgePointInCircle(item.lat, item.lng)) {
        if (nowGetCard != 3) {
          this.setData({
            bottom_pop_content: '您选中了碎片，只有使用[远程碎片]才能提高这些碎片的Pick概率。是否仍进行随机Pick？',
            show_bottom_pop: true
          })
          return
        }
      } else {
        if (nowGetCard != 1 || nowGetCard != 2 || nowGetCard != 3) {
          this.setData({
            bottom_pop_content: '您选中了碎片，只有使用[扩块碎片]或[远程碎片]才能提高这些碎片的Pick概率。是否仍进行随机Pick？',
            show_bottom_pop: true
          })
          return
        }
      }
    }
    this.getCardRequest()
  },
  getCardRequest() {
    if (this.data.get_card_num <= 0) {
      this.setData({
        show_mask4: true,
        card_toast2_data: {
          info_icon_size: 80,
          info_icon_to_top_size: 15,
          info_title: '充能',
          icon_size: 40

        }
      })
      return
    }
    let _this = this
    if (nowGetCard == 3 && !this.data.showCardDetail) {
      this.setData({
        show_zoom_toast: true,
        toast_content2: '请先选择任意位置的碎片，即有机会远程收集到它'
      })
      setTimeout(function () {
        _this.setData({
          show_zoom_toast: false
        })
      }, 1500)
      return
    }

    let cardNum = 3
    if (nowGetCard == 2) {
      cardNum = 4
    }

    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let points = []



    if (nowGetCard == 3) {
      points = this.data.imgUrls
    } else if (nowGetCard == 1) {
      if (this.data.ssr_num + this.data.sr_num > 0) {
        points = mapZoneCard
      }
    }

    let functionCardType = -1
    if (nowGetCard == 1) {
      functionCardType = 1
    }
    if (nowGetCard == 2) {
      functionCardType = 2
    }
    if (nowGetCard == 3) {
      functionCardType = 3
    }
    nowSelectCardPercent = 0
    showSuccess = false
    wx.request({
      url: prefix + 'extract_card?get_num=' + cardNum + '&function_card_type=' + functionCardType, //仅为示例，并非真实的接口地址
      method: 'POST',
      header: header,
      data: points,
      success(res) {
        let getCardInfos = []
        getCardInfos = res.data.data;

        for (let i = 0; i < getCardInfos.length; i++) {
          getCardInfos[i].images[0].image_zoom = 100
          getCardInfos[i].item_id = i
          getCardInfos[i].video_loaded = false
          if (getCardInfos[i].images[0].vertical) {
            if (getCardInfos[i].images[0].width > 1000) {
              getCardInfos[i].images[0].image_zoom = parseInt((1000 / getCardInfos[i].images[0].width) * 100)
            }
          } else {
            if (getCardInfos[i].images[0].width > 1000) {
              getCardInfos[i].images[0].image_zoom = parseInt((1000 / getCardInfos[i].images[0].width) * 100)
            }
          }
        }



        _this.setData({
          // show_getting_card_animation:animation1.export(),
          // show_loading: false,
          show_mask: false,
          current2: 0,
          show_get_card_animation: true,
          get_card_inofs: getCardInfos,
          get_card_inofs_for_video_show: getCardInfos,
        })
        let animationTIme = 1000
        setTimeout(function () {
          var animation1 = wx.createAnimation({
            duration: animationTIme,
            timingFunction: "linear",
            delay: 0
          })
          animation1.translateX(-1000).step();

          _this.setData({
            show_getting_card_animation: animation1.export(),
          })
        }, 100)
        setTimeout(function () {
          for (let i = 1; i < getCardInfos.length; i++) {
            setTimeout(function () {
              _this.setData({
                current2: i,
              })
            }, 1500 * (i - 1))
          }
          // _this.setData({
          //   show_getting_card_loading: true,
          // })
        }, animationTIme + 100 + 1500)
        setTimeout(function () {
          _this.setData({
            show_get_card_animation: false,
            show_getting_card_loading: false,
          })
        }, animationTIme + 100 + 1500 + 1500 * (getCardInfos.length - 1))
      }
    })
  },
  afterEnter(e) {
    let _this = this
    setTimeout(function () {
        _this.setData({
          auto_play_swiper: true
        })
        setTimeout(function () {
          _this.setData({
            auto_play_swiper_interval: 2500
          })
        }, 1000)
      },
      500)
  },
  getCard1() {
    this.getCard1Funcation()
  },
  getCard1Funcation() {
    let _this = this
    this.setData({
      show_card1: false
    })
    setTimeout(function () {
      var animation1 = wx.createAnimation({
        duration: 1000,
        timingFunction: "linear",
        delay: 0
      })
      animation1.translateY('2000%').scale(75, 75).step();
      _this.setData({
        animationGetCard1: animation1.export()
      })
      setTimeout(function () {
        var animation2 = wx.createAnimation({
          duration: 1300,
          timingFunction: "linear",
          delay: 0
        })
        animation2.translateY("10000%").scale(75, 75).step();
        _this.setData({
          animationGetCard1: animation2.export()
        })
        _this.getCard2()
      }, 1300)
    }, 300)
  },
  touchStart: function (e) {
    touchDotX = e.touches[0].pageX; // 获取触摸时的原点
    touchDotY = e.touches[0].pageY;
    // 使用js计时器记录时间    
    // interval = setInterval(function () {
    //   time++;
    // }, 100);
  },
  // 触摸结束事件
  touchEnd: function (e) {
    let _this = this
    setTimeout(function () {
      if (isClickMarket) {
        return
      }
      let touchMoveX = e.changedTouches[0].pageX;
      let touchMoveY = e.changedTouches[0].pageY;
      let tmX = touchMoveX - touchDotX;
      let tmY = touchMoveY - touchDotY;
      // if (time < 20) {
      let absX = Math.abs(tmX);
      let absY = Math.abs(tmY);
      if (absX > 2 * absY) {
        if (tmX < 0) {
          // console.log("左滑=====")
          _this.showToast('已使用[扩块碎片]，取消才可移动视野')
        } else {
          // console.log("右滑=====")
          _this.showToast('已使用[扩块碎片]，取消才可移动视野')
        }
      } else if (absY > 0 && tmY < 0) {
        // console.log("上滑动=====")
        _this.showToast('已使用[扩块碎片]，取消才可移动视野')
      } else if (absY > 0 && tmY > 0) {
        // console.log("下滑动=====")
        _this.showToast('已使用[扩块碎片]，取消才可移动视野')
      } else {
        _this.backCardList()
      }
    }, 300)


  },
  showToast(e) {
    let _this = this
    // if (!this.data.can_zoom && !this.data.show_zoom_toast) {

    if (true) {
      this.setData({
        show_zoom_toast: true,
        toast_content2: e
      })
      setTimeout(function () {
        _this.setData({
          show_zoom_toast: false
        })
      }, 2500)

    }
  },
  showToast2(e) {
    let _this = this
    this.setData({
      show_zoom_toast: true,
      toast_content2: e
    })
    setTimeout(function () {
      _this.setData({
        show_zoom_toast: false
      })
    }, 2500)

  },
  showToast3(content, duration) {
    this.setData({
      show_toast: true,
      toast_content3: content,
      toast_duration: duration
    })
  },
  showToast4(e) {
    let _this = this
    // if (!this.data.can_zoom && !this.data.show_zoom_toast) {

    if (true) {
      this.setData({
        show_to_toast: true,
        toast_to_content: e
      })
      setTimeout(function () {
        _this.setData({
          show_to_toast: false
        })
      }, 2500)

    }
  },
  selectCard() {
    var card1Ant = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    card1Ant.top('30%').width('9rpx').height('16rpx').step()
    var card2Ant = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    card2Ant.top('30%').width('9rpx').height('16rpx').step()
    var card3Ant = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    card3Ant.top('30%').width('9rpx').height('16rpx').step()
    this.setData({
      show_mask: true,
      animationGetCard: '',
      animationGetCard1: card1Ant.export(),
      animationGetCard2: card2Ant.export(),
      animationGetCard3: card3Ant.export(),
      show_card1: true,
      show_card2: true,
      show_card3: true,
      show_loading: true,
      show_btn: true
    })
    setTimeout(function () {
      this.setData({
        animationGetCard: '',
        animationGetCard1: '',
        animationGetCard2: '',
        animationGetCard3: '',
      })
    }, 100)
  },
  initMidShowID() {
    // console.log("222222")
    const mapCtx = wx.createMapContext('map', this);
    let _this = this
    mapCtx.getCenterLocation({
      success: (res) => {

        let item = _this.judgePointInSquareItem(res.latitude, res.longitude)
        if (item != '') {
          showTitleItem = item
          if (ctx == '') {
            ctx = app.globalData.ctx
          }
          // console.log(this.data.square_width * 0.690)
          let width = 65
          ctx.font = 'bold ' + 10 + 'px Arial';
          let titleLists = ctx_urils.spliceString(item.card_info_list[0].title, 10000, width, ctx)

          ctx.font = 'bold ' + 8 + 'px Arial';
          let titleLists2 = ctx_urils.spliceString(item.card_info_list[0].content, width * 5.5, width, ctx)

          // console.log(titleLists)

          // console.log(titleLists2)
          let height = 10 + titleLists.length * 15 + titleLists2.length * 12 + 12

          let move = height + this.data.square_width * (1 - 0.812) / 2
          let localPoint = {
            id: -100,
            card_id: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            width: _this.data.square_width,
            height: _this.data.square_width,
            iconPath: "/pages/images/lucency.png",
            anchor: {
              x: .5,
              y: .5
            },
            zIndex: 1000,
            customCallout: {
              display: 'ALWAYS',
              anchorX: _this.data.square_width * (0.812 + 0.094),
              anchorY: move
            },
            card_info_list: item.card_info_list
          }
          let content = ''
          for (let i = 0; i < titleLists2.length; i++) {
            content = content + titleLists2[i].content
          }
          localPoint.card_info_list[0].content = content



          let list = [localPoint]
          let list2 = _this.data.markers
          let added = false
          let update = false
          for (let i = 0; i < list2.length; i++) {
            if (list2[i].id == -100) {
              added = true

              if (list2[i].card_id != localPoint.card_id) {

                list2[i] = localPoint
                update = true
              }
              if (list2[i].customCallout == '' && list2[i].card_id == localPoint.card_id) {
                list2[i] = localPoint
                update = true
              }

              break
            }
          }
          if (!added) {
            update = true
            list2.push(localPoint)
          }
          if (update) {
            _this.setData({
              square_content_height: height,
              midContents: list
            }, function () {
              _this.setData({

                markers: list2,
              })
            })
          }
        } else {
          let list2 = _this.data.markers
          let update = false
          for (let i = 0; i < list2.length; i++) {
            if (list2[i].id == -100) {
              if (list2[i].customCallout != '') {
                update = true
              }
              list2[i].customCallout = ''
              break
            }
          }
          if (update) {
            _this.setData({
              midContents: [],
              markers: list2,
            })
          }

        }
      }
    })
  },
  regionchange(e) {
    // console.log(e)
    let _this = this
    let animation = wx.createAnimation({
      duration: 300, // 以毫秒为单位 
      timingFunction: 'liner',
      delay: 0,
      success: function (res) {}
    });
    if (e.type == 'begin' && e.causedBy != 'update') {
      if (!this.data.show_mid_btn) {
        this.setData({
          show_mid_btn: true
        })
      }

      animation.opacity(0).step()

      this.setData({
        buy_btn_animation: animation.export(),
        show_buy_btn: false
      })
    } else {
      animation.opacity(1).step()
      this.setData({
        buy_btn_animation: animation.export(),
        show_buy_btn: true
      })
    }

    if (e.type == 'end') {
      this.initMidShowID()
      // this.changeShowShouldPoint()

    }

    if (isGettingZoneCard) {
      return
    }

    isGettingZoneCard = true

    const mapCtx = wx.createMapContext('map', this);
    mapCtx.getRegion({
      success(result) {
        let existingIds = []
        for (let i = 0; i < allMarkers.length; i++) {
          existingIds.push(allMarkers[i].id)
        }
        let data = {
          point1_x: result.northeast.latitude,
          point1_y: result.southwest.longitude,
          point2_x: result.southwest.latitude,
          point2_y: result.northeast.longitude,
          existing_stacks: existingIds
        }
        wx.request({
          url: prefix + 'map_stack', //仅为示例，并非真实的接口地址
          method: 'POST',
          data: data,
          header: {
            'wy-platform': 'mini_programe' // 默认值
            // 'Authorization':'Bearer b3739cb5-2de1-492f-9d38-f0ef9c44b79b'
          },
          success(res) {
            // let circle = _this.data.circles

            let resultList = allMarkers
            for (let i = 0; i < res.data.data.length; i++) {
              let addCard = true
              if (map.get(res.data.data[i].id)) {
                addCard = false
              }
              if (addCard) {
                let point = res.data.data[i]
                map.set(point.id, true)

                point.latitude = point.lat;
                point.longitude = point.lng;

                if (point.group_type == 'stack') {
                  point.width = 50;
                  point.height = 50;
                  point.url = _this.changePointUrl(point.url)
                  point.origin_url = point.url;
                  point.iconPath = point.url;
                  point.zIndex = point.id / 100;
                  point.anchor = {
                    x: .5,
                    y: 1
                  };
                } else {
                  // circle.push({
                  //   latitude: point.latitude,
                  //   longitude: point.longitude,
                  //   radius: 25,
                  //   color: "#F5C551",
                  //   fillColor: "#F5C55159"
                  // })
                  let width = _this.getSquareWidth(point.lat)
                  point.width = width;
                  point.height = width;
                  console.log("point", point)
                  if (_this.data.account_info.account_id != point.card_info_list[0].account_id) {

                    point.url = "/pages/images/square_blue.png"
                  } else {

                    point.url = "/pages/images/square_green.png"
                  }
                  point.origin_url = point.url;
                  point.iconPath = point.url;
                  point.zIndex = 1;
                  point.anchor = {
                    x: .5,
                    y: .5
                  };
                  point.customCallout = {
                    display: 'ALWAYS',
                    anchorX: 0,
                    anchorY: width * (0.812 + 0.094)
                  };
                }


                for (let i = 0; i < point.card_info_list.length; i++) {
                  point.card_info_list[i].titleLine = _this.judgeContentLines(point.card_info_list[i].title, 31, 290)
                  point.card_info_list[i].contentLine1 = _this.judgeContentLines(point.card_info_list[i].content, 31, 290)
                  point.card_info_list[i].contentLine2 = _this.judgeContentLines(point.card_info_list[i].content, 21, 290)
                  point.card_info_list[i].add_pick_probability = (500 / point.card_info_list[i].card_cpoint * 5).toFixed(1)
                  // console.lo(point)
                  point.card_info_list[i].images[0].image_zoom = 100
                  if (point.card_info_list[i].images[0].vertical) {
                    if (point.card_info_list[i].images[0].width > 100) {
                      point.card_info_list[i].images[0].image_zoom = parseInt((300 / point.card_info_list[i].images[0].width) * 100)
                    }
                  } else {
                    if (point.card_info_list[i].images[0].width > 200) {
                      point.card_info_list[i].images[0].image_zoom = parseInt((400 / point.card_info_list[i].images[0].width) * 100)
                    }
                  }

                  if (point.card_info_list[i].card_id == cardInfo.card_id && point.card_info_list[i].card_type != "SQUARE") {
                    cardInfo.from_stack = point
                  }
                }
                // point.width = 50;
                // point.height = 50;
                // point.url = _this.changePointUrl(point.url)
                // point.origin_url = point.url;
                // point.iconPath = point.url;
                // point.zIndex = point.id;
                // point.anchor = {
                //   x: .5,
                //   y: 1
                // };
                resultList.push(point)

              } else {
                let point = res.data.data[i]
                for (let i = 0; i < resultList.length; i++) {
                  if (point.id == resultList[i].id) {
                    // console.log('肥肥诶')
                    // console.log(point)
                    // console.log(resultList[i])
                    if (point.card_info_list.length != resultList[i].card_info_list.length) {

                      for (let i = 0; i < point.card_info_list.length; i++) {
                        point.card_info_list[i].titleLine = _this.judgeContentLines(point.card_info_list[i].title, 31, 290)
                        point.card_info_list[i].contentLine1 = _this.judgeContentLines(point.card_info_list[i].content, 31, 290)
                        point.card_info_list[i].contentLine2 = _this.judgeContentLines(point.card_info_list[i].content, 21, 290)
                        point.card_info_list[i].add_pick_probability = (500 / point.card_info_list[i].card_cpoint * 5).toFixed(1)
                        point.card_info_list[i].images[0].image_zoom = 100
                        if (point.card_info_list[i].images[0].vertical) {
                          if (point.card_info_list[i].images[0].width > 100) {
                            point.card_info_list[i].images[0].image_zoom = parseInt((300 / point.card_info_list[i].images[0].width) * 100)
                          }
                        } else {
                          if (point.card_info_list[i].images[0].width > 200) {
                            point.card_info_list[i].images[0].image_zoom = parseInt((400 / point.card_info_list[i].images[0].width) * 100)
                          }
                        }
                      }
                      point.latitude = point.lat;
                      point.longitude = point.lng;
                      point.width = resultList[i].width;
                      point.height = resultList[i].height;
                      point.url = _this.changePointUrl(point.url)
                      point.origin_url = point.url;
                      if (resultList[i].width > 50) {
                        point.iconPath = resultList[i].iconPath;
                      } else {
                        point.iconPath = point.url;
                      }
                      point.zIndex = point.id / 100;
                      if (point.group_type == 'stack') {

                        point.anchor = {
                          x: .5,
                          y: 1
                        };
                      } else {
                        point.zIndex = 1;

                        point.anchor = {
                          x: .5,
                          y: .5
                        };
                        point.customCallout = {
                          display: 'ALWAYS',
                          anchorX: 0,
                          anchorY: _this.data.square_width * (0.812 + 0.094)
                        };
                      }
                      // point.anchor = {
                      //   x: .5,
                      //   y: 1
                      // };
                      resultList[i] = point
                      // resultList.push(point)
                    }
                    break
                  }

                }
              }
            }
            allMarkers = resultList
            isGettingZoneCard = false
            if (mapIsReadied && onAction) {
              _this.setData({
                // circles: circle,
                markers: allMarkers
              }, function () {
                if (cardInfo.from_stack != '') {
                  nowShowDetailID = cardInfo.from_stack.id
                  showCardDetail = true
                  // console.log(cardInfo.from_stack)
                  _this.selectedCardDetail(cardInfo.from_stack, true)
                  cardInfo.from_stack = ''
                }
              })
            } else {
              let internal = setInterval(function () {

                if (mapIsReadied && onAction) {
                  clearInterval(internal)
                  _this.setData({
                    // circles: circle,
                    markers: allMarkers
                  }, function () {

                    if (cardInfo.from_stack != '') {
                      nowShowDetailID = cardInfo.from_stack.id
                      showCardDetail = true
                      // console.log(cardInfo.from_stack)
                      _this.selectedCardDetail(cardInfo.from_stack, true)
                      cardInfo.from_stack = ''
                    }
                  })
                }
              }, 500)
            }
            // _this.changeShowShouldPoint()
          },
          fail(res) {
            // console.log(res)
            isGettingZoneCard = false
          }
        })
      }
    })

  },
  regionchangeNoWait(lat, lon, carryExistPoint) {
    let _this = this

    let point1_x = Number(lat) + 0.0012
    let point1_y = Number(lon) - 0.0012
    let point2_x = Number(lat) - 0.0012
    let point2_y = Number(lon) + 0.0012

    let existingIds = []
    if (carryExistPoint) {
      for (let i = 0; i < allMarkers.length; i++) {
        existingIds.push(allMarkers[i].id)
      }
    }

    let data = {
      point1_x: point1_x,
      point1_y: point1_y,
      point2_x: point2_x,
      point2_y: point2_y,
      existing_stacks: existingIds
    }


    wx.request({
      url: prefix + 'map_stack',
      method: 'POST',
      data: data,
      header: {
        'wy-platform': 'mini_programe' // 默认值
        // 'Authorization':'Bearer b3739cb5-2de1-492f-9d38-f0ef9c44b79b'
      },
      success(res) {
        let resultList = allMarkers
        for (let i = 0; i < res.data.data.length; i++) {
          let addCard = true
          if (map.get(res.data.data[i].id)) {
            addCard = false
          }
          if (addCard) {
            let point = res.data.data[i]
            map.set(point.id, true)



            point.latitude = point.lat;
            point.longitude = point.lng;


            if (point.group_type == 'stack') {
              point.width = 50;
              point.height = 50;
              point.url = _this.changePointUrl(point.url)
              point.origin_url = point.url;
              point.iconPath = point.url;
              point.zIndex = point.id / 100;
              point.anchor = {
                x: .5,
                y: 1
              };
            } else {
              let width = _this.getSquareWidth(point.lat)
              point.width = width;
              point.height = width;

              if (_this.data.account_info.account_id != point.card_info_list[0].account_id) {

                point.url = "/pages/images/square_blue.png"
              } else {

                point.url = "/pages/images/square_green.png"
              }
              point.origin_url = point.url;
              point.iconPath = point.url;
              point.zIndex = 1;
              point.anchor = {
                x: .5,
                y: .5
              };
              point.customCallout = {
                display: 'ALWAYS',
                anchorX: 0,
                anchorY: width * (0.812 + 0.094)
              };
            }



            for (let i = 0; i < point.card_info_list.length; i++) {

              point.card_info_list[i].titleLine = _this.judgeContentLines(point.card_info_list[i].title, 31, 290)
              point.card_info_list[i].contentLine1 = _this.judgeContentLines(point.card_info_list[i].content, 31, 290)
              point.card_info_list[i].contentLine2 = _this.judgeContentLines(point.card_info_list[i].content, 21, 290)
              point.card_info_list[i].add_pick_probability = (500 / point.card_info_list[i].card_cpoint * 5).toFixed(1)
              point.card_info_list[i].images[0].image_zoom = 100
              if (point.card_info_list[i].images[0].vertical) {
                if (point.card_info_list[i].images[0].width > 100) {
                  point.card_info_list[i].images[0].image_zoom = parseInt((300 / point.card_info_list[i].images[0].width) * 100)
                }
              } else {
                if (point.card_info_list[i].images[0].width > 200) {
                  point.card_info_list[i].images[0].image_zoom = parseInt((400 / point.card_info_list[i].images[0].width) * 100)
                }
              }

              if (point.card_info_list[i].card_id == cardInfo.card_id && point.card_info_list[i].card_type != "SQUARE") {
                cardInfo.from_stack = point
              }
            }
            // point.width = 50;
            // point.height = 50;
            // point.url = _this.changePointUrl(point.url)
            // point.origin_url = point.url;
            // point.iconPath = point.url;
            // point.zIndex = point.id;
            // point.anchor = {
            //   x: .5,
            //   y: 1
            // };


            resultList.push(point)

          } else {

            let point = res.data.data[i]

            for (let i = 0; i < resultList.length; i++) {
              if (point.id == resultList[i].id) {
                if (point.card_info_list.length != resultList[i].card_info_list.length) {
                  for (let i = 0; i < point.card_info_list.length; i++) {
                    point.card_info_list[i].titleLine = _this.judgeContentLines(point.card_info_list[i].title, 31, 290)
                    point.card_info_list[i].contentLine1 = _this.judgeContentLines(point.card_info_list[i].content, 31, 290)
                    point.card_info_list[i].contentLine2 = _this.judgeContentLines(point.card_info_list[i].content, 21, 290)
                    point.card_info_list[i].add_pick_probability = (500 / point.card_info_list[i].card_cpoint * 5).toFixed(1)
                    point.card_info_list[i].images[0].image_zoom = 100
                    if (point.card_info_list[i].images[0].vertical) {
                      if (point.card_info_list[i].images[0].width > 100) {
                        point.card_info_list[i].images[0].image_zoom = parseInt((300 / point.card_info_list[i].images[0].width) * 100)
                      }
                    } else {
                      if (point.card_info_list[i].images[0].width > 200) {
                        point.card_info_list[i].images[0].image_zoom = parseInt((400 / point.card_info_list[i].images[0].width) * 100)
                      }
                    }
                  }
                  point.latitude = point.lat;
                  point.longitude = point.lng;
                  point.width = resultList[i].width;
                  point.height = resultList[i].height;
                  point.url = _this.changePointUrl(point.url)
                  point.origin_url = point.url;
                  if (resultList[i].width > 50) {
                    point.iconPath = resultList[i].iconPath;

                  } else {
                    point.iconPath = point.url;
                  }
                  point.zIndex = point.id / 100;



                  if (point.group_type == 'stack') {
                    point.anchor = {
                      x: .5,
                      y: 1
                    };
                  } else {
                    point.zIndex = 1;
                    point.anchor = {
                      x: .5,
                      y: .5
                    };
                    point.customCallout = {
                      display: 'ALWAYS',
                      anchorX: 0,
                      anchorY: _this.data.square_width * (0.812 + 0.094)
                    };
                  }

                  // point.anchor = {
                  //   x: .5,
                  //   y: 1
                  // };
                  resultList[i] = point
                }
                break
              }
            }
          }
        }
        allMarkers = resultList
        let list = _this.getShowItem(false)


        if (mapIsReadied && onAction) {
          _this.setData({
            markers: allMarkers,
            // imgUrls: list
          }, function () {

            if (cardInfo.from_stack != '') {
              nowShowDetailID = cardInfo.from_stack.id
              showCardDetail = true

              _this.selectedCardDetail(cardInfo.from_stack, true)
              cardInfo.from_stack = ''
            }
          })
        } else {
          let internal = setInterval(function () {
            if (mapIsReadied && onAction) {
              clearInterval(internal)
              _this.setData({
                markers: allMarkers,
                // imgUrls: list
              }, function () {

                if (cardInfo.from_stack != '') {
                  nowShowDetailID = cardInfo.from_stack.id
                  showCardDetail = true

                  _this.selectedCardDetail(cardInfo.from_stack, true)
                  cardInfo.from_stack = ''
                }
              })
            }
          }, 500)
        }
        // _this.changeShowShouldPoint()

      }
    })
  },
  toMy() {
    if (this.judgeLogOn('', 'to_me')) {

      filter.jumpToMePage(-1, '')

    }
  },
  toHandBook() {
    wx.navigateTo({
      url: '../handbook/handbook'
    })
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
    // this.test()
    if (options.reload) {
      this.reload()
    }
    let hotPoi = ''
    if (wx.getStorageSync('hot_poi') != '') {
      hotPoi = wx.getStorageSync('hot_poi')
    }
    this.setData({
      change_show: wx.getStorageSync('change_show'),
      hot_poi: hotPoi
    })
    if (wx.getStorageSync('login') != '') {
      this.setData({
        account_info: wx.getStorageSync('userInfo')
      })
    }
    allMarkers = []
    map = new Map()
    showTitleItem = ''
    if (options.buy_refresh != undefined) {
      buySquareRefresh = options.buy_refresh
    } else {
      buySquareRefresh = false
    }
    // console.log(options)
    qqmapsdk = new QQMapWX({
      key: '5YIBZ-ODW64-2MDU5-DZZTO-NMNCO-SYFJN'
    });
    //计算文字宽度
    const canvas = wx.createOffscreenCanvas({
      type: '2d',
      width: 1,
      height: 1
    })
    judgeCOntentLineContext = canvas.getContext('2d')

    mapIsReadied = false
    cardInfo = {
      lat: options.lat,
      lng: options.lng,
      cpoint: options.cpoint,
      card_id: options.card_id,
      from_stack: ''
    }
    showCardDetail = false
    //扫码跳转逻辑
    // console.log("扫码逻辑")
    // console.log(options)


    //计算相应组件高度
    this.setViewHeight()

    var _this = this;


    //升值榜循环播放数据
    // this.loopShowContent()
    //热碎片列表
    // this.getHotcardList()
    //通知栏体提醒列表与定时任务
    // this.getCardRemind()
    // setInterval(function () {
    //   _this.getCardRemind()
    // }, 10000)

    //获取用户信息
    // if (wx.getStorageSync('login') != '') {
    //   let userInfo = wx.getStorageSync('userInfo')
    //   this.setData({
    //     account_info: userInfo
    //   })
    // }
    this.getCardDeal()
    // console.log(options)
    if (cardInfo.lat != "-1") {
      this.setData({
        show_mid_btn: false
      })
      //跳转到环球影城
      jumpMyLocation = false
      _this.setData({
        latitude: cardInfo.lat,
        longitude: cardInfo.lng,
        circles: []
      })
      let x = _this.getSquareWidth(cardInfo.lat)
      _this.setData({
        square_width: x,
      })
      // setTimeout(function () {

      // }, 500)

      this.getLoacationAuth(false)
      this.regionchangeNoWait(cardInfo.lat, cardInfo.lng, true)

    } else if (this.data.hot_poi != '') {
      jumpMyLocation = false
      _this.setData({
        latitude: this.data.hot_poi.lat,
        longitude: this.data.hot_poi.lng,
        circles: []
      })
      let x = _this.getSquareWidth(this.data.hot_poi.lat)
      _this.setData({
        square_width: x,
      })
      this.showToast4(this.data.hot_poi.content)

      this.getLoacationAuth(false)
      this.regionchangeNoWait(this.data.hot_poi.lat, this.data.hot_poi.lng, true)
    } else {
      jumpMyLocation = true
      this.getLoacationAuth(true)
    }


    //获取定位权限及定位

    //从分享进入小程序显示内容
    if (options.share != undefined) {
      if (!this.judgeLogOn('', '')) {
        let content = {
          title: '登录后，您可以：',
          content: '收集碎片，兑换环球影城门票！',
          top_bg: 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/toast_top_bg.png'
        }
        this.setData({
          show_mask2: true,
          toast_data: content
        })
      }
    }

    //跳转到详情页
    // if(jumpCardID!=undefined){
    //   if (jumpCardID != -1) {
    //     wx.navigateTo({
    //       url: '../card_detail/card_detail?card_id=' + jumpCardID
    //     })
    //   }
    // }
    // this.reJudgeShow()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    // this.getAllTureCard()
    // this.judgeScope()
    // let _this = this
    // setInterval(function () {
    //   // _this.getAllTureCard()
    // }, 20000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


    this.judgeLocationAuth()
    if (_locationChangeFn == '') {
      _locationChangeFn = function (res) {
        nlatitude = res.latitude;
        nlongitude = res.longitude;
      }
    }
    wx.startLocationUpdate({
      success(res) {
        wx.onLocationChange(_locationChangeFn)
      }
    })

    if (getApp().globalData.isReload) {
      let pageList = getCurrentPages()

      if (pageList.length == 1) {
        this.cancelFunctionCard()
        getApp().globalData.isReload = false
      }
    }
    isShowToast = false
    onAction = true
    let _this = this

    _this.regionchange('')

    let createCardInfo = wx.getStorageSync('haveCreatedCards')
    if (createCardInfo.create) {
      this.regionchangeNoWait(createCardInfo.lat, createCardInfo.lng, false)
    }

    this.reGetLocation()
    reGetLocationInterval = setInterval(function () {
      _this.reGetLocation()
    }, 120 * 1000)
    // this.startProgerss()
    this.getAccountInfo('', '')
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }

    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    } else {
      return
    }

    let time = wx.getStorageSync('handbook_list_date')

    wx.request({
      url: prefix + 'account_info?last_time=' + time, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        if (res.data.result == 0) {
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
          if (!haveCountDown) {
            haveCountDown = true
            rechargeTime = 3600 - accountInof.surplus_seconds
            _this.recharge()
          }

          _this.setData({
            get_card_num: accountInof.get_card_num,
            account_info: accountInof
          })


          let scanList = []
          if (wx.getStorageSync('scan_list') != "") {
            scanList = wx.getStorageSync('scan_list')
          }
          for (let i = 0; i < scanList.length; i++) {
            _this.putScanQcCode(scanList[i].jumpCardID, scanList[i].jumpAccountID)
          }

          wx.setStorageSync('scan_list', '')
        }

      }
    })


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.offLocationChange(_locationChangeFn)
    clearInterval(reGetLocationInterval)
    this.selectFail()
    onAction = false
    haveCountDown = false
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.offLocationChange(_locationChangeFn)
    onAction = false
    clearInterval(rechargeInternal)
    this.selectFail()
    haveCountDown = false
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

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
  toLocation(e) {
    if (nowGetCard == 1) {
      this.showToast('已使用[扩块碎片]，取消才可移动视野')
      return
    }
    let _this = this
    wx.getSetting({
      success(res) {
        var authMap = res.authSetting;
        if (authMap['scope.userLocation']) {

          _this.getLocation(function () {
            _this.locationDataBind()
            const mapCtx = wx.createMapContext('map', this);

            _this.moveToLocation(nlongitude, nlatitude, function () {}, function () {})

          })
        } else {
          _this.setData({
            get_location_auth_again: true,
          })
        }
      }
    })
  },
  clickBottomCard(e) {
    let item = e.currentTarget.dataset.item
    this.selectedCardDetail(item, true)
  },
  selectedCardDetail(item, isMove) {
    if (item == '' || item == undefined) {
      return
    }
    const mapCtx = wx.createMapContext('map', this);
    this.zoomtMarket(item)

    let _this = this
    if (isMove) {
      let current = 0

      for (let i = 0; i < item.card_info_list.length; i++) {
        if (cardInfo.card_id == item.card_info_list[i].card_id) {
          current = i
          break
        }
      }
      _this.moveToLocation(item.lng, item.lat, function () {
        isShowHotCardList = false
        _this.setData({
          current: current,
          current3: current,
          showCardList: false,
          showCardDetail: true,
          markers: allMarkers,
          card_info_content: item.content,
          imgUrls: item.card_info_list
        })
      }, function () {
        listNowSHow = 0
        isShowHotCardList = false
        _this.setData({
          current: current,
          current3: current,
          showCardList: false,
          showCardDetail: true,
          markers: allMarkers,
          card_info_content: item.content,
          imgUrls: item.card_info_list
        })
      })

    } else {
      listNowSHow = 0
      isShowHotCardList = false
      this.setData({
        current: 0,
        current3: 0,
        showCardList: false,
        showCardDetail: true,
        markers: allMarkers,
        // card_info_content: item.content,
        imgUrls: item.card_info_list
      })
    }
  },
  zoomtMarket(item) {
    for (let i = 0; i < allMarkers.length; i++) {
      if (allMarkers[i].id == -1 || allMarkers[i].id == -100) {

      } else if (allMarkers[i].group_type == 'square') {

      } else if (item.id == allMarkers[i].id) {
        allMarkers[i].width = 70
        allMarkers[i].height = 70
        allMarkers[i].iconPath = "/pages/images/card_selected.png"
      } else {
        allMarkers[i].width = 50
        allMarkers[i].height = 50
        allMarkers[i].iconPath = allMarkers[i].origin_url
      }
    }
  },
  backCardList(e) {
    this.zoomtMarket({
      id: -100
    })
    let content = this.data.toast_content
    if (nowGetCard == 3) {
      content = '请选择任意位置的碎片'
    }
    listNowSHow = 0
    nowShowDetailID = 0
    showCardDetail = false
    let itemss = this.getShowItem(true)
    let swiperIndex = 0
    // if (isShowHotCardList) {
    //   swiperIndex = cardInfoCurrent
    // } else if (nowGetCard == 1) {
    //   swiperIndex = zoomCardListCurrent
    // }
    this.setData({
      current: swiperIndex,
      current3: swiperIndex,
      showCardList: true,
      showCardDetail: false,
      markers: allMarkers,
      toast_content: content,
      // imgUrls: itemss
    })
  },
  judgePointInCircle(lat, lng) {
    // console.log(paramObj)
    var lng1 = cardInfo.lng
    var lat1 = cardInfo.lat

    var lng2 = lng
    var lat2 = lat

    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    s = s * 1000
    if (s > distance) {
      return false
    } else {
      return true
    }
  },
  getShowItem(jumpJudge) {
    if (showCardDetail) {
      return this.data.imgUrls
    }
    isShowHotCardList = false

    let itemss = []
    let ssrNum = 0
    let srNum = 0
    mapZoneCard = []
    var zoneCardMap = new Map();
    for (let i = 0; i < allMarkers.length; i++) {
      let card = allMarkers[i]
      if (card.id == -1 || card.id == -100) {
        continue
      }
      if (this.judgePointInCircle(card.lat, card.lng)) {
        if (zoneCardMap.get(card.id)) {} else {
          zoneCardMap.set(card.id, true)
          itemss = itemss.concat(card.card_info_list)
          mapZoneCard = mapZoneCard.concat(card.card_info_list)
          for (let n = 0; n < card.card_info_list.length; n++) {
            if (card.card_info_list[n].card_type == 'SSR') {
              ssrNum++
            } else {
              srNum++
            }
          }
        }
      }
    }
    this.setData({
      ssr_num: ssrNum,
      sr_num: srNum
    })
    // if (itemss.length == 0 || nowGetCard != 1) {
    //   isShowHotCardList = true
    //   itemss = hotListResult
    // }
    // if (!isShowHotCardList) {
    var len = itemss.length;

    for (var i = 0; i < len - 1; i++) {
      for (var j = 0; j < len - 1 - i; j++) {
        if (itemss[j].card_cpoint < itemss[j + 1].card_cpoint) { // 相邻元素两两对比
          var temp = itemss[j + 1]; // 元素交换
          itemss[j + 1] = itemss[j];
          itemss[j] = temp;
        }
      }
    }
    // }
    // console.log(itemss)
    // console.log(itemss)

    let rank = 1
    for (let i = 0; i < itemss.length; i++) {
      if (cardInfo.card_id == itemss[i].card_id) {
        break
      } else {
        rank++
      }
    }
    this.setData({
      show_card_rank: '在周边100米的碎片中，暂时排名第' + rank
    })
    nowShowList = itemss
    return itemss
  },
  addCard(e) {
    if (this.judgeLogOn('', 'add_card')) {
      wx.navigateTo({
        url: '../add_card/add_card'
      })
    }

  },
  swiperChange(e) {
    lastListNowSHow = listNowSHow
    listNowSHow = e.detail.current

    if (isShowHotCardList) {
      cardInfoCurrent = e.detail.current
    } else if (nowGetCard == 1 && !this.data.showCardDetail) {
      zoomCardListCurrent = e.detail.current
    }

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

    if (isShowHotCardList) {
      hotCardListPointStatus = lastListNowSHowPointStatus
    } else if (nowGetCard == 1 && !this.data.showCardDetail) {
      zoomCardListPointStatus = lastListNowSHowPointStatus
    }


    this.setData({
      current: e.detail.current,
      current_status: lastListNowSHowPointStatus
    })

  },
  swiperChange2(e) {
    // console.log(e)
    let _this = this
    if (e.detail.current == this.data.get_card_inofs.length - 1 && this.data.auto_play_swiper) {
      setTimeout(function () {
        _this.setData({
          auto_play_swiper: false,
          show_get_card_animation: false
        })
      }, 1500)
    }
    this.setData({
      current2: e.detail.current
    })

  },
  recharge() {
    let _this = this

    _this.rechargeIntrenal()
    rechargeInternal = setInterval(function () {
      _this.rechargeIntrenal()
    }, 1000)
  },
  rechargeIntrenal() {
    if (!onAction) {
      clearInterval(rechargeInternal)
      haveCountDown = false
      return
    }
    if (this.data.get_card_num >= 5) {
      clearInterval(rechargeInternal)
      rechargeTime = 3600
      haveCountDown = false
      return
    }
    this.formatSeconds()
    rechargeTime--
  },
  formatSeconds() {
    var theTime = parseInt(rechargeTime); // 需要转换的时间秒
    var theTime1 = 0; // 分
    var theTime2 = 0; // 小时
    var theTime3 = 0; // 天
    if (theTime > 60) {
      theTime1 = parseInt(theTime / 60);
      theTime = parseInt(theTime % 60);
      if (theTime1 > 60) {
        theTime2 = parseInt(theTime1 / 60);
        theTime1 = parseInt(theTime1 % 60);
        if (theTime2 > 24) {
          theTime3 = parseInt(theTime2 / 24);
          theTime2 = parseInt(theTime2 % 24);
        }
      }
    }
    var result = '';
    if (theTime > 0) {
      if (theTime < 10) {
        result = "0" + parseInt(theTime) + "";
      } else {
        result = "" + parseInt(theTime) + "";
      }
    }
    if (theTime == 0) {
      result = "00";
    }


    if (theTime1 > 0 && theTime2 > 0) {
      // if (theTime1 < 10) {
      //   result = "0" + parseInt(theTime1)+60 + ":" + result;
      // } else {
      result = "" + (parseInt(theTime1 + 60)) + ":" + result;
      // }
    } else if (theTime1 > 0) {
      if (theTime1 < 10) {
        result = "0" + parseInt(theTime1) + ":" + result;
      } else {
        result = "" + parseInt(theTime1) + ":" + result;
      }
    }
    if (theTime1 == 0 && theTime2 == 0) {
      result = "00" + ":" + result;
    }


    if (theTime3 > 0) {
      result = "" + parseInt(theTime3) + "天" + result;
    }
    this.setData({
      recharge_time: result
    })
    if (rechargeTime == 0) {
      rechargeTime = 3600
      let getCardNum = this.data.get_card_num
      if (getCardNum < 5) {
        getCardNum++
        this.setData({
          get_card_num: getCardNum
        })
      }
    }
  },
  select_card_start(e) {

    this.touchStartTime = e.timeStamp
    if (showSuccess) {
      return
    }
    selectCardTouching = true
    let _this = this
    setTimeout(function (ee) {

      if (selectCardTouching) {
        let cardInfo = _this.data.get_card_inofs[_this.data.current2]
        let accountInfo = _this.data.account_info
        if (cardInfo.card_id == 165) {
          if (accountInfo.plus_card_num == 5) {
            wx.showToast({
              title: '每种功能碎片最多拥有5块，请选择其它碎片',
              icon: 'none'
            })
            return
          }
        } else if (cardInfo.card_id == 166) {
          if (accountInfo.move_card_num == 5) {
            wx.showToast({
              title: '每种功能碎片最多拥有5块，请选择其它碎片',
              icon: 'none'
            })
            return
          }
        } else if (cardInfo.card_id == 167) {
          if (accountInfo.zomm_card_num == 5) {
            wx.showToast({
              title: '每种功能碎片最多拥有5块，请选择其它碎片',
              icon: 'none'
            })
            return
          }
        } else if (cardInfo.card_id == 168) {
          if (accountInfo.create_card_num == 5) {
            wx.showToast({
              title: '每种功能碎片最多拥有5块，请选择其它碎片',
              icon: 'none'
            })
            return
          }
        }
        nowSelectCardPercent = 0
        let londingIcon = ''
        if (e.currentTarget.id == 0) {
          londingIcon = "/pages/images/function.png"
        } else if (e.currentTarget.id == 1) {
          londingIcon = "/pages/images/function.png"
        } else if (e.currentTarget.id == 2) {
          londingIcon = "/pages/images/function.png"
        } else if (e.currentTarget.id == 3) {
          londingIcon = "/pages/images/function.png"
        } else if (e.currentTarget.id == 4) {
          londingIcon = "/pages/images/ssr.png"
        }

        _this.setData({
          select_card_percent: nowSelectCardPercent,
          loading_width: nowSelectCardPercent,
          show_select_card_loading: true,
          get_card_bottom_content: '获取碎片中...',
          show_get_card_animation11: true,
          mid_loading_icon: londingIcon
        })

        _this.circleAnimation()
      }
    }, 300)
    // console.log(e)

  },
  select_card_end(e) {
    this.touchEndTime = e.timeStamp
    if (showSuccess) {
      return
    }
    this.selectFail()

    // console.log(e)
  },
  selectFail() {
    clearInterval(getCardLoadingInterval)
    selectCardTouching = false
    nowSelectCardPercent = 0
    let animation = wx.createAnimation({
      duration: 10, // 以毫秒为单位 
      timingFunction: 'liner',
      delay: 0,
      success: function (res) {}
    });
    animation.width("0%").step()

    this.setData({
      get_card_loading_animation: animation.export(),
      select_card_percent: nowSelectCardPercent,
      show_select_card_loading: false,
      get_card_bottom_content: '选择一块碎片，长按获取该碎片',
    })
  },
  circleAnimation() {
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
      get_card_loading_animation: animation.export()
    })
    getCardLoadingInterval = setInterval(function (e) {
      // if(!onAction){

      //   console.log('停了停了')
      //   _this.selectFail()
      //   return
      // }
      nowSelectCardPercent = nowSelectCardPercent + 50
      _this.setData({
        select_card_percent: nowSelectCardPercent,
      })
      if (nowSelectCardPercent == 100) {
        clearInterval(getCardLoadingInterval)
        _this.selectSuccess()
      }
    }, 750)
  },
  selectSuccess() {
    canShowNowShowTrueCardList = false
    showSuccess = true
    updateAccountCpUp = false
    let _this = this
    _this.setData({
      get_card_bottom_content: '收集该碎片成功！',
    })

    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }

    let data = {
      zomm_card_num: 0,
      plus_card_num: 0,
      move_card_num: 0
    }

    this.cancelFunctionCard()
    let cardInfo = this.data.get_card_inofs[this.data.current2]
    wx.request({
      url: prefix + '' + cardInfo.card_id + '/collect_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      data: data,
      header: header,
      success(res) {
        let time = wx.getStorageSync('handbook_list_date')

        wx.request({
          url: prefix + 'account_info?last_time=' + time, //仅为示例，并非真实的接口地址
          method: 'GET',
          header: header,
          success(res) {
            if (res.data.result == 0) {

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
                get_card_num: accountInof.get_card_num,
              })
              if (accountInof.get_card_num == 4) {
                rechargeTime = 3600 - accountInof.surplus_seconds
                if (!haveCountDown) {
                  haveCountDown = true
                  _this.recharge()
                } else {
                  _this.formatSeconds()
                }
              }
              let updateInterval = setInterval(function () {
                if (updateAccountCpUp) {
                  clearInterval(updateInterval)
                  _this.setData({
                    account_info: accountInof
                  })
                }
              }, 100)
            }
          }
        })
      }
    })
    setTimeout(function () {
        _this.showToast('收集碎片成功')
        nowSelectCardPercent = 0
        showSuccess = false

        _this.setData({
          current2: 0,
          show_getting_card_animation: '',
          get_card_loading_animation: '',
          show_select_card_loading: false,
          select_card_percent: nowSelectCardPercent,
          loading_width: nowSelectCardPercent,
          get_card_bottom_content: '选择一块碎片，长按获取该碎片',
          show_mask: true,
          show_getting_card_loading: false,
          auto_play_swiper: false,
          auto_play_swiper_interval: 500,
          current2: 0,
          show_get_card_animation: false,
          get_card_inofs: [],
        })
        if (cardInfo.card_type != 'FUNCATION') {
          _this.addCPAnimation('+' + cardInfo.card_cpoint, cardInfo);
        } else {
          // clearInterval(interval1)
          if (cardInfo.card_id == 165) {
            wx.showToast({
              title: 'Plus碎片数量+1',
              icon: 'none'
            })
          } else if (cardInfo.card_id == 166) {
            wx.showToast({
              title: '远程碎片数量+1',
              icon: 'none'
            })
          } else if (cardInfo.card_id == 167) {
            wx.showToast({
              title: '扩块碎片数量+1',
              icon: 'none'
            })
          } else if (cardInfo.card_id == 168) {
            wx.showToast({
              title: '创造碎片数量+1',
              icon: 'none'
            })
          }
        }
      },
      500)
  },
  setViewHeight() {
    var SystemInfo = wx.getSystemInfoSync();
    // console.log(SystemInfo.windowWidth + '?????' + SystemInfo.windowHeight)
    let heightRpx = 750 * (SystemInfo.windowHeight / SystemInfo.windowWidth);
    // console.log(heightRpx)
    let mapHeight = heightRpx - 728 + 240
    let getCardHeight = heightRpx * 0.76
    if ((SystemInfo.windowWidth / SystemInfo.windowHeight) > 0.6) {
      getCardHeight = heightRpx * 0.85
    }
    this.setData({
      map_height: mapHeight,
      get_card_height: getCardHeight,
      window_height: heightRpx,
      window_height_px: SystemInfo.windowHeight
    })
  },
  clearLvUpInfo(e) {
    let list = this.data.lv_up_list
    if (list.length > 0) {
      list.splice(0, 1)
      if (list.length > 0) {
        this.updateCardRemind(list[0])
      }
    }

    this.setData({
      lv_up_list: list
    })
  },
  cancelFunctionCard(e) {
    if (forbid_click) {
      return
    }
    this.onReset()
  },
  toCardDertail(e) {
    // console.log(e)
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + this.data.lv_up_list[this.data.lv_up_list.length - 1].card_id
    })
    let _this = this
    // setTimeout(function () {
    //   _this.clearLvUpInfo()
    // }, 500)
  },
  toCardDertail2(e) {
    // console.log(e)
    if (this.data.true_card_wait) {
      let data = e.currentTarget.dataset.item
      wx.navigateTo({
        url: '../card_detail/card_detail?card_id=' + data.card_id
      })
      let _this = this
    }

    // setTimeout(function () {
    //   _this.clearLvUpInfo()
    // }, 500)
  },
  toDetail(e) {
    // console.log(e)
    let list = this.data.lv_up_list
    // console.log(list[0])
    if (list[0].type == 6 || list[0].type == 7) {
      wx.navigateTo({
        url: '../other_me/other_me?account_id=' + list[0].from_account_id
      })
    } else {
      wx.navigateTo({
        url: '../card_detail/card_detail?card_id=' + list[0].card_id
      })
    }

    let _this = this
    setTimeout(function () {
      _this.clearLvUpInfo()
    }, 500)
  },
  toCardInfoPage(e) {
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + this.data.imgUrls[this.data.current].card_id
    })
  },
  toHotUpPage(e) {
    wx.navigateTo({
      url: '../hot_up/hot_up'
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
        show_loading: false,
        show_login_loading: false,
      });
      _this.afterLogin(e, type)
      if (res.new_account) {
        if (wx.getStorageSync('share_info') != '') {
          _this.updateShareInfo()
        }
      }
      isLogining = false
    }, this)

  },
  backList(e) {
    this.setData({
      show_mask3: false,
      show_mask4: false,
      show_square_deal_toast: false,
      show_have_cp_toast: false,
      no_cp_toast: false
    })
  },
  toCardInfoPage2(e) {
    let cardInfo = this.data.get_card_inofs[this.data.current2]
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + cardInfo.card_id
    })
  },
  heartBtn2(e) {
    if (!this.judgeLogOn('', 'heartBtn2')) {
      return
    }
    let data = this.data.imgUrls[this.data.current]
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
  heartBtn(e) {
    let data = this.data.get_card_inofs[this.data.current2]
    let list = this.data.get_card_inofs
    if (!data.liked) {
      data.liked = true
      data.like_num++
      list.splice(this.data.current2, 1, data)
      this.setData({
        get_card_inofs: list
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
        get_card_inofs: list
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
        // console.log(res)
      }
    })
  },
  starBtn2(e) {
    if (!this.judgeLogOn('', 'starBtn2')) {
      return
    }
    let data = this.data.imgUrls[this.data.current]
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
  starBtn(e) {
    let data = this.data.get_card_inofs[this.data.current2]
    let list = this.data.get_card_inofs
    if (!data.wanted) {
      data.wanted = true
      data.want_num++
      list.splice(this.data.current2, 1, data)
      this.setData({
        get_card_inofs: list
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
        get_card_inofs: list
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
        // console.log(res)
      }
    })
  },
  /// 长按
  longTap: function (e) {
    // console.log("long tap")
  },
  /// 单击、双击
  multipleTap: function (e) {
    var that = this
    // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
    if (that.touchEndTime - that.touchStartTime < 350) {
      // 当前点击的时间
      var currentTime = e.timeStamp
      var lastTapTime = that.lastTapTime
      // 更新最后一次点击时间
      that.lastTapTime = currentTime
      that.lastTapTimeoutFunc = setTimeout(function () {
        // console.log("tap")
        let cardInfo = that.data.get_card_inofs[that.data.current2]
        wx.navigateTo({
          url: '../card_detail/card_detail?card_id=' + cardInfo.card_id
        })
      }, 300);
    }
  },
  getCardTodetail() {
    let cardInfo = this.data.get_card_inofs[this.data.current2]
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + cardInfo.card_id
    })
  },
  toExchageCard(e) {
    wx.navigateTo({
      url: '../excahnge_card/exchange_card'
    })
  },
  addCPAnimation(e, cardInfo) {
    this.showCollectToast('收集碎片成功')
    this.setData({
      add_cp: true,
      add_cp_num: e
    })
    let height = this.data.map_height - 83
    var circleCount = 0;
    let _this = this
    // 心跳的外框动画 
    let animationMiddleHeaderItem = wx.createAnimation({
      duration: 250, // 以毫秒为单位 
      timingFunction: 'ease-out',
      delay: 0,
      success: function (res) {}
    });
    let interval1 = setInterval(function () {
      if (circleCount % 2 == 0) {

        animationMiddleHeaderItem.left('85rpx').top(height + 'rpx').step();
      } else {
        animationMiddleHeaderItem.scale(1.0).step();
      }
      this.setData({
        animation_exchange: animationMiddleHeaderItem.export(),
        same_animation: true,
        show_schedule: false
      });
      circleCount++;
      if (circleCount == 1) {
        clearInterval(interval1)
        setTimeout(function () {
          let animationWord = wx.createAnimation({
            duration: 700, // 以毫秒为单位 
            timingFunction: 'linear'
          });
          animationWord.opacity(0).left('30rpx').top(height + 'rpx').step()
          _this.setData({
            same_animation: false,
            animation_exchange2: animationWord.export()
          });
          setTimeout(function () {
            canShowNowShowTrueCardList = true
            _this.getTrueCard(cardInfo)
            _this.setData({
              same_animation: false,
              animation_exchange2: '',
              animation_exchange: '',
              add_cp: false,
              show_schedule: true
            });
            updateAccountCpUp = true
          }, 900)
        }, 1200)
      }
    }.bind(this), 2500);


  },
  getHotcardList() {
    let _this = this
    wx.request({
      url: prefix + 'hot_card_list', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: {
        'wy-platform': 'mini_programe' // 默认值
        // 'Authorization':'Bearer b3739cb5-2de1-492f-9d38-f0ef9c44b79b'
      },
      success(res) {
        hotListResult = res.data.data;

        nowShowList = hotListResult
        for (let i = 0; i < hotListResult.length; i++) {
          hotListResult[i].titleLine = _this.judgeContentLines(hotListResult[i].title, 31, 290)
          hotListResult[i].contentLine1 = _this.judgeContentLines(hotListResult[i].content, 31, 290)
          hotListResult[i].contentLine2 = _this.judgeContentLines(hotListResult[i].content, 21, 290)
          hotListResult[i].add_pick_probability = (500 / hotListResult[i].card_cpoint * 5).toFixed(1)
          hotListResult[i].images[0].image_zoom = 100
          if (hotListResult[i].images[0].vertical) {
            if (hotListResult[i].images[0].width > 100) {
              hotListResult[i].images[0].image_zoom = parseInt((300 / hotListResult[i].images[0].width) * 100)
            }
          } else {
            if (hotListResult[i].images[0].width > 200) {
              hotListResult[i].images[0].image_zoom = parseInt((400 / hotListResult[i].images[0].width) * 100)
            }
          }
        }



        isShowHotCardList = true

        listNowSHow = 0
      }
    })
  },
  loopShowContent() {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let _this = this
    wx.request({
      url: prefix + 'loop_hot_up', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        // console.log(res)
        let a
        loopShowList = res.data.data;
        // console.log(loopShowList)
        if (loopShowList.length <= 0) {
          clearInterval(a)
          return
        } else {
          loopNowNum = 0
          _this.setData({
            loop_show_content: loopShowList[loopNowNum].content
          })
          loopNowNum++
          a = setInterval(function () {

            if (loopNowNum == loopShowList.length) {
              loopNowNum = 0
            }
            _this.setData({
              loop_show_content: loopShowList[loopNowNum].content
            })
            loopNowNum++
          }, 5000)
        }

        // _this.setData({
        //   lv_up_list: list
        // })
      }
    })



  },
  moveToUs(e) {
    if (nowGetCard == 1) {
      this.showToast('已使用[扩块碎片]，取消才可移动视野')
      return
    }
    let _this = this
    if (_this.data.scale != 17) {
      // _this.setData({
      //   scale: 17.656,
      // });
    } else {
      // _this.setData({
      //   scale: 17.656,
      // });
    }

    // setTimeout(function () {
    const mapCtx = wx.createMapContext('map', this);
    _this.setData({
      latitude: 39.856145,
      longitude: 116.683782,
    })
    // mapCtx.moveToLocation({
    //   latitude: 39.856145,
    //   longitude: 116.683782,
    //   success: () => {

    //   }
    // })
    // }, 50)
    // wx.getSetting({
    //   success(res) {

    //     var authMap = res.authSetting;
    //     if (authMap['scope.userLocation']) {

    //     } else {
    //       _this.setData({
    //         get_location_auth_again: true,
    //       })
    //     }
    //   }
    // })


  },
  moveToHot(e) {
    if (nowGetCard == 1) {
      this.showToast('已使用[扩块碎片]，取消才可移动视野')
      return
    }
    let _this = this
    if (_this.data.scale != 17) {
      // _this.setData({
      //   scale: 17.656,
      // });
    } else {
      // _this.setData({
      //   scale: 17.656,
      // });
    }
    let jumplatitude = 39.908429
    let jumplongitude = 116.45972
    let hotPoi = wx.getStorageSync('hot_poi')
    if (hotPoi != '') {
      jumplatitude = hotPoi.lat
      jumplongitude = hotPoi.lng
    }
    // setTimeout(function () {
    // latitude: 39.856145,
    // longitude: 116.683782,

    _this.moveToLocation(jumplongitude, jumplatitude, function () {
      if (hotPoi != '') {
        _this.showToast4(hotPoi.content)
      }
    }, function () {

    })

    // }, 50)
    // wx.getSetting({
    //   success(res) {

    //     var authMap = res.authSetting;
    //     if (authMap['scope.userLocation']) {

    //     } else {
    //       _this.setData({
    //         get_location_auth_again: true,
    //       })
    //     }
    //   }
    // })


  },
  showCollectToast(e) {
    let _this = this
    this.setData({
      show_collect_toast: true,

    })
    setTimeout(function () {
      _this.setData({
        show_collect_toast: false
      })
    }, 2500)

  },
  getTrueCard(data) {
    let _this = this
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    let reqData = {
      card_id: data.card_id
    }

    wx.request({
      url: prefix + 'true_card', //仅为示例，并非真实的接口地址
      method: 'POST',
      header: header,
      data: reqData,
      success(res) {
        _this.getAllTureCard();
      }
    })

  },
  getAllTureCard() {
    let _this = this
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    wx.request({
      url: prefix + 'true_card', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        if (res.data.result == 0) {
          let dataList = res.data.data

          let nowShowList = []
          let getImgList = []
          let getVideoList = []
          let showParcentList = []

          for (let i = 0; i < dataList.length; i++) {
            let item = dataList[i]
            if (item.type == 'show_toast') {
              nowShowList.push(item)
            } else if (item.get_img) {
              getImgList.push(item)
            } else if (item.get_video && item.make_video) {
              getVideoList.push(item)
            } else if (item.get_video && !item.make_video) {
              showParcentList.push(item)
            }
          }

          if (!_this.data.show_img_card) {
            _this.setData({
              true_card_show_list_in_bar: getImgList
            })
          }
          if (!_this.data.just_show_img_card) {
            _this.setData({
              true_card_now_show_list: nowShowList,
            })
          }

          if (nowShowList.length > 0 && canShowNowShowTrueCardList) {
            setTimeout(function () {
              showTureCardListType = 'now_show'
              if (!isShowToast && !_this.data.just_show_img_card) {
                isShowToast = true
                wx.showToast({
                  title: '您的实体碎片已生成，可供下载',
                  icon: 'none',
                  duration: 2500
                })
              }
              _this.setData({
                current4: 0,
                just_show_card: nowShowList[0],
                just_show_img_card: true,
                swiperCanMove: true
              })
              setTimeout(function () {
                var animation = wx.createAnimation({
                  duration: 800,
                  timingFunction: 'linear',
                  delay: 0
                });
                animation.translateY(-1500).step()
                _this.setData({
                  just_show_img_card_animationData: animation
                })
              }, 200)
              // _this.changeCardList()


            }, 200)

          }
          if (getVideoList.length > 0) {
            //TODO 下载视频
            // for (let i = getVideoList.length - 1; i >= 0; i--) {
            //   let add = true;
            //   for (let j = 0; j < downloadList.length; j++) {
            //     if (downloadList[j].card_id == getVideoList[i].getVideoList) {
            //       add = false
            //       break
            //     }
            //   }
            //   if (add) {
            //     downloadList.push(getVideoList[i])
            //   }
            // }
            // _this.downLoadVideo()
          }
          if (showParcentList.length > 0) {

            // _this.startProgerss()
            // let nowParcentItem = showParcentList[0]
            // let item = nowParcentItem
            // if (item.now_percent >= 95) {
            //   console.log(nowParcentItem)
            //   var animation = wx.createAnimation({
            //     duration: 10,
            //     timingFunction: 'linear',
            //     delay: 0
            //   });
            //   clearInterval(numPercent)
            //   animation.width('95%').step()
            //   _this.setData({
            //     get_true_card_content: '正在生成实体碎片95%',
            //     get_true_card_progress_num: 95,
            //     progress_animation: animation
            //   })
            // } else {
            //   var animation = wx.createAnimation({
            //     duration: 10,
            //     timingFunction: 'linear',
            //     delay: 0
            //   });
            //   animation.width(item.now_percent + '%').step()
            //   _this.setData({
            //     get_true_card_content: '正在生成实体碎片 ' + item.now_percent + '%',
            //     get_true_card_progress_num: item.now_percent,
            //     progress_animation: animation
            //   })
            //   setTimeout(function () {
            //     let totalduration = 200000
            //     var animation2 = wx.createAnimation({
            //       duration: totalduration,
            //       timingFunction: 'linear',
            //       delay: 0
            //     });

            //     animation2.width('95%').step()

            //     _this.setData({
            //       progress_animation: animation2

            //     })
            //     let num = item.now_percent
            //     clearInterval(numPercent)
            //     numPercent = setInterval(function () {
            //       num++
            //       _this.setData({
            //         get_true_card_content: '正在生成实体碎片 ' + num + '%',
            //         get_true_card_progress_num: num,
            //       })
            //       if (num == 95) {
            //         clearInterval(numPercent)
            //       }
            //     }, totalduration / (99 - item.now_percent))
            //   }, 200)
            // }

          } else {
            let progresses = []

            let progress = {
              time: 0,
              percent: 0,
              making: false
            }
            progresses.push(progress)

            wx.setStorageSync('make_video_progress', progresses)
            clearInterval(numPercent)

            if (getImgList.length > 0) {
              let totalduration = 10
              var animation = wx.createAnimation({
                duration: totalduration,
                timingFunction: 'linear',
                delay: 0
              });
              animation.width('0%').step()
              _this.setData({
                get_true_card_content: getImgList.length + '块实体碎片待生成 ',
                progress_animation: animation,
                get_true_card_progress_num: 0,
              })
            }
          }
        }
      }
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
        no_qccode: false
      })
    }, 100)

    // this.gettedImgCard(data)
  },
  stopTouchMove: function () {
    return false;
  },
  cancelNowShowTrueCard(e) {
    let _this = this
    let data = e.currentTarget.dataset.item
    var animation = wx.createAnimation({
      duration: 10,
      timingFunction: 'linear',
      delay: 0
    });
    animation.translateY(1500).step()
    this.setData({
      just_show_img_card_animationData: animation
    })
    setTimeout(function () {
      _this.setData({
        show_img_card: false,
        just_show_img_card: false,
        no_qccode: false
      })
      _this.changeCardList()
    }, 100)
    // console.log(data)
    this.endNowShowImgCard(data)
  },
  makedNowShowTrueCard(e) {
    let _this = this
    let data = e.currentTarget.dataset.item
    var animation = wx.createAnimation({
      duration: 10,
      timingFunction: 'linear',
      delay: 0
    });
    animation.translateY(1500).step()
    this.setData({
      just_show_img_card_animationData: animation
    })
    setTimeout(function () {
      _this.endDownload()
      // _this.setData({
      //   show_img_card: false,
      //   just_show_img_card: false,
      //   no_qccode: false
      // })
      // _this.changeCardList()
    }, 100)
    // console.log(data)
    // this.endNowShowImgCard(data)
  },
  updateGetImgCard(data) {
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
      card_id: data.card_id
    }
    if (showTureCardListType == 'bar') {
      let list = this.data.true_card_show_list_in_bar
      list.splice(0, 1)
      if (list.length == 0) {
        this.setData({
          show_true_card_list: false,
          true_card_show_list_in_bar: list
        })
      } else {
        this.setData({
          true_card_show_list_in_bar: list
        })
      }
      if (this.data.get_true_card_content.indexOf('块实体碎片待下载') != -1) {
        if (list.length == 0) {
          var animation = wx.createAnimation({
            duration: 0,
            timingFunction: 'linear',
            delay: 0
          });
          animation.width('0%').step()
          _this.setData({
            get_true_card_content: '暂无新实体碎片 ',
            progress_animation: animation,
            get_true_card_progress_num: 0,
          })
        } else {
          var animation = wx.createAnimation({
            duration: 0,
            timingFunction: 'linear',
            delay: 0
          });
          animation.width('0%').step()
          this.setData({
            get_true_card_content: list.length + '块实体碎片待下载 ',
            progress_animation: animation,
            get_true_card_progress_num: 0,
          })
        }
      }
    } else {
      let list = this.data.true_card_now_show_list
      list.splice(0, 1)
      this.setData({
        true_card_now_show_list: list
      })
    }
    wx.request({
      url: prefix + 'end_img_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: reqData,
      success(res) {}
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
  downloadPhoto(trueCardData, url, type) {
    let _this = this
    if (type == 'img') {
      this.setData({
        now_true_card_type: '[图片碎片]'
      })
    } else {
      this.setData({
        now_true_card_type: '[视频碎片]'
      })
    }
    // 下载监听进度
    const downloadTask = wx.downloadFile({
      url: url,
      success: function (res) {
        if (res.statusCode === 200) {
          if (type == 'img') {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res1) {
                _this.setData({
                  show_true_card_img: true,
                  true_card_url: res.tempFilePath
                })
                if (_this.data.no_qccode) {
                  _this.downloadPhoto(trueCardData, trueCardData.no_qrcode_video_url, 'video')

                } else {
                  _this.downloadPhoto(trueCardData, trueCardData.video_url, 'video')
                }
              },
              fail: function (res) {}
            })
          } else {
            wx.saveVideoToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res1) {
                _this.setData({
                  show_true_card_video: true,
                  true_card_url: res.tempFilePath
                })
                _this.setData({
                  true_card_wait: false,
                  true_card_downloading: false
                })
              },
              fail: function (res) {
                // console.log(res)
              }
            })
          }
        }
      }
    })
    downloadTask.onProgressUpdate((res) => {
      if (res.progress === 100) {
        _this.downloadProgress(100, type)
      } else {
        _this.downloadProgress(res.progress, type)
      }
    })
  },
  endDownload(e) {
    let _this = this
    this.initProgress()

    var animation = wx.createAnimation({
      duration: 10,
      timingFunction: 'linear',
      delay: 0
    });
    animation.translateY(1500).step()
    this.setData({
      show_img_card_animationData: animation
    })


    setTimeout(function () {
      _this.changeCardList()
      _this.setData({
        true_card_wait: true,
        true_card_downloading: false,
        show_true_card_img: false,
        show_true_card_video: false,
        show_img_card: false,
        just_show_img_card: false
      })
    }, 100)
    // let data = e.currentTarget.dataset.item
    // this.updateGetImgCard(data)
  },
  showAllTrueCard(e) {
    let _this = this
    showTureCardListType = 'bar'

    if (this.data.true_card_show_list_in_bar.length > 0) {
      this.setData({
        current: 0,
        current3: 0,
        swiperCanMove: true,
        show_img_card: true,
        show_img_card_point: false,
        bar_card: this.data.true_card_show_list_in_bar[0]
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

    } else if (this.data.get_true_card_content.indexOf('正在生成') != -1) {
      wx.showToast({
        title: '[视频实体碎片]正在生成中，完成后将自动下载，请稍候',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: 'Pick或创造新碎片后，可生成实体碎片',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //生成图片实体碎片文字内容部分
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
    // console.log(titleLists)
    let contentFontSize = 38 * beishu * changeRate
    cxt.font = 'bold ' + contentFontSize + 'px Arial';
    let contentLists
    if (titleLists.length > 1) {
      contentLists = this.spliceString(content, contentFontSize * 11 * 1.8, contentFontSize * 11, cxt)
    } else {
      contentLists = this.spliceString(content, contentFontSize * 11 * 3.8, contentFontSize * 11, cxt)
    }
    // console.log(contentLists)


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
    // console.log(splieContent)
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
          // console.log(result)
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
            // console.log(result)

            return result;
          }
          content = content.substring(j - 1);
          break;
        }
      }
    }
    return result;
  },
  //切割字符串
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
      this.drawWord2(cxt, (246 - 79 + 79) * beishu + contentleft, (118 + 15) * beishu + contenttop, 36 * beishu, "#000000", "人想Pick这块碎片")
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
  init(res) {
    makeImgCardSuccess = false
    let _this = this
    // console.log(res)
    let beishu = 2.8
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    canvas.width = beishu * 1080;
    canvas.height = beishu * 1440;
    let num = 1
    this.reTry(ctx, canvas, num)

  },
  reTry(ctx, canvas, num) {
    let _this = this
    if (showTureCardListType == "bar") {
      this.createVerticalImage(ctx, canvas, this.data.bar_card.card_info, num)
    } else {
      this.createVerticalImage(ctx, canvas, this.data.just_show_card.card_info, num)
    }
  },
  /**该方法用来绘制一个有填充色的圆角矩形 
   *@param cxt:canvas的上下文环境 
   *@param x:左上角x轴坐标 
   *@param y:左上角y轴坐标 
   *@param width:矩形的宽度 
   *@param height:矩形的高度 
   *@param radius:圆的半径 
   *@param fillColor:填充颜色 
   **/
  fillRoundRect(cxt, x, y, width, height, radius, /*optional*/ fillColor) {
    //圆的直径必然要小于矩形的宽高          
    if (2 * radius > width || 2 * radius > height) {
      return false;
    }

    cxt.save();
    cxt.translate(x, y);
    //绘制圆角矩形的各个边  
    this.drawRoundRectPath(cxt, width, height, radius);
    cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
    cxt.fill();
    cxt.restore();
  },
  drawRoundRectPath(cxt, width, height, radius) {
    cxt.beginPath(0);
    //从右下角顺时针绘制，弧度从0到1/2PI  
    cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
    //矩形下边线  
    cxt.lineTo(radius, height);
    //左下角圆弧，弧度从1/2PI到PI  
    cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
    //矩形左边线  
    cxt.lineTo(0, radius);
    //左上角圆弧，弧度从PI到3/2PI  
    cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
    //上边线  
    cxt.lineTo(width - radius, 0);
    //右上角圆弧  
    cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);
    //右边线  
    cxt.lineTo(width, height - radius);
    cxt.closePath();
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
    // console.log(width)
    // console.log(height)
    // console.log(pointX)
    // console.log(pointY)
    // console.log(imageCorner)
    // console.log(iamgePath)
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
    ctx.restore()
  },
  drawWordNoBold(cxt, x, y, size, /*optional*/ fillColor, content) {
    cxt.font = 'bold ' + size + 'px Arial';
    cxt.textAlign = 'center';
    cxt.textBaseline = 'middle';
    cxt.fillStyle = fillColor;
    cxt.fillText(content, x, y);
  },
  drawWord(cxt, x, y, size, /*optional*/ fillColor, content) {
    cxt.font = 'bold ' + size + 'px Arial';
    cxt.textAlign = 'center';
    cxt.textBaseline = 'middle';
    cxt.fillStyle = fillColor;
    cxt.fillText(content, x, y);

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
  //图片实体碎片生成主体
  createVerticalImage(ctx, canvas, data, retryNum) {
    let _this = this
    let beishu = 2.8
    let left = 0
    let top = 0
    let cardInfo = data
    // console.log(data)
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
        accountName = accountName + ''
        let moveLeft = _this.judgeContentWidth(ctx, accountName, 32)
        _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft / 2 - 32) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#FFFFFF", accountName)
        if (cardInfo.card_type == 'TRUE_CARD') {
          _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '兑换')
          moveLeft = moveLeft + 8 + 64 + 32 - 8
        } else if (cardInfo.account_id == userInfo.account_id) {
          _this.drawWord(ctx, beishu * (132 + 6 + 16 + moveLeft + 8) + left, beishu * (51 + 6 + 18) + top, beishu * 32, "#F46563", '创造')
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


          // console.log("生成了，哈哈哈哈")
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
                  // console.log('图片生成成功，已存入相册')
                  makeImgCardSuccess = true

                  wx.showToast({
                    title: '[实体碎片]生成完成  已存入相册',
                    icon: 'none'
                  })

                },
                fail: function (res) {
                  // console.log(res)
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
              // console.log(res)
            }
          }, _this)
        }, 200)
      }

    }, 500)

    this.createImgCardBottom(cardInfo, ctx, canvas)
    let num = canvas.createImage();
    if (cardInfo.card_type == "SSR") {
      num.src = '/pages/images/ssr.png';
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
  createTrueCard(e) {
    let _this = this
    let data = e.currentTarget.dataset.item
    wx.getSetting({
      success(res) {
        // console.log('相册权限')
        // console.log(res.authSetting)
        var authMap = res.authSetting;
        if (authMap['scope.writePhotosAlbum']) {
          _this.setData({
            true_card_wait: false,
            true_card_downloading: true,
            swiperCanMove: false
          })
          _this.gettedImgCard(data)
          _this.createTrueCardProgress()

          let userInfo = wx.getStorageSync('userInfo')
          let otherInfo = userInfo.account_id + ',' + data.card_id
          let header = {
            'wy-platform': 'mini_programe', // 默认值
          }

          header.Authorization = 'Bearer ' + userInfo.access_token
          wx.request({
            url: prefix + 'qc_code?other_info=' + otherInfo + '&env_version=release', //仅为示例，并非真实的接口地址
            method: 'GET',
            header: header,
            success(res) {
              qcCodeUrl = res.data.data
              wx.createSelectorQuery()
                .select('#canvas')
                .fields({
                  node: true,
                  size: true,
                })
                .exec(_this.init.bind(_this))
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

        }
        // console.log(res)
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
        // console.log('scope.address 权限获取成功')
        _this.setData({
          true_card_wait: false,
          true_card_downloading: true,
          swiperCanMove: false
        })
        _this.gettedImgCard(data)
        _this.createTrueCardProgress()

        let userInfo = wx.getStorageSync('userInfo')
        let otherInfo = userInfo.account_id + ',' + data.card_id
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
              .select('#canvas')
              .fields({
                node: true,
                size: true,
              })
              .exec(_this.init.bind(_this))
          }
        })

      },

      fail: () => {
        // console.log('scope.address 权限获取失败')
      }
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

    } catch (e) {

      // Do something when catch error

    }

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
    // this.getVideoCardReq(data)
  },
  getVideoCardReq(data) {
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
      card_id: data.card_id,
      make_id: data.make_id
    }
    wx.request({
      url: prefix + 'true_card/get_video_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: reqData,
      success(res) {
        wx.showToast({
          title: '后台正在生成视频实体碎片，请稍后...',
          icon: 'none'
        })
        let percent = (data.wait_time * 60) / 100
        var timestamp = parseInt((new Date()).valueOf()) / 1000 + percent;
        let progresses = wx.getStorageSync('make_video_progress')
        if (progresses == undefined || progresses == '') {
          progresses = []
        }
        let progress = {
          time: timestamp,
          percent: percent,
          making: true
        }
        progresses.push(progress)

        wx.setStorageSync('make_video_progress', progresses)
        _this.startProgerss()
        // let totalduration = 10
        // var animation = wx.createAnimation({
        //   duration: totalduration,
        //   timingFunction: 'linear',
        //   delay: 0
        // });

        // animation.width('1%').step()
        // setTimeout(function () {
        //   let percent = (data.wait_time * 60) / 100
        //   var timestamp = parseInt((new Date()).valueOf()) / 1000 + percent;

        //   let progresses = wx.getStorageSync('make_video_progress')
        //   if (progresses == undefined || progresses == '') {
        //     progresses = []
        //   }
        //   let progress = {
        //     time: timestamp,
        //     percent: percent,
        //     making: true
        //   }
        //   progresses.push(progress)

        //   wx.setStorageSync('make_video_progress', progresses)
        //   _this.setData({
        //     progress_animation: animation,
        //     get_true_card_content: '正在生成实体碎片 1%',
        //     get_true_card_progress_num: 1,
        //   })
        //   setTimeout(function () {
        //     let totalduration = (data.wait_time * 60) * 1000
        //     var animation = wx.createAnimation({
        //       duration: totalduration,
        //       timingFunction: 'linear',
        //       delay: 0
        //     });
        //     animation.width('95%').step()
        //     setTimeout(function () {
        //       _this.setData({
        //         progress_animation: animation,
        //         get_true_card_content: '正在生成实体碎片 1%',
        //         get_true_card_progress_num: 1,
        //       })
        //       let num = 0
        //       clearInterval(numPercent)
        //       numPercent = setInterval(function () {
        //         num++
        //         _this.setData({
        //           get_true_card_content: '正在生成实体碎片 ' + num + '%'
        //         })
        //         if (num >= 95) {
        //           clearInterval(numPercent)
        //         }
        //       }, totalduration / 95)
        //     }, 1000)
        //   }, 200)

        // })
      }
    })
  },
  endNowShowImgCard(data) {
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
      card_id: data.card_id,
      type: data.type
    }
    wx.request({
      url: prefix + 'true_card/end_now_show_img_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: reqData,
      success(res) {
        _this.getAllTureCard()
      }
    })
  },
  gettedImgCard(data) {
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
      card_id: data.card_id,
      type: data.type
    }
    wx.request({
      url: prefix + 'true_card/end_img_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: reqData,
      success(res) {}
    })
  },
  changeCardList() {
    if (showTureCardListType == 'bar') {
      let list = this.data.true_card_show_list_in_bar
      list.splice(this.data.current3, 1)
      this.setData({
        true_card_show_list_in_bar: list
      })
      // console.log(this.data.get_true_card_content)
      if (this.data.get_true_card_content.indexOf('块实体碎片待生成') != -1) {
        if (list.length == 0) {
          var animation = wx.createAnimation({
            duration: 0,
            timingFunction: 'linear',
            delay: 0
          });
          animation.width('0%').step()
          this.setData({
            get_true_card_content: '暂无新实体碎片可生成',
            progress_animation: animation,
            get_true_card_progress_num: 0,
          })
        } else {
          this.setData({
            get_true_card_content: list.length + '块实体碎片待生成 '
          })
        }
      }
    } else {
      let list = this.data.true_card_now_show_list
      list.splice(0, 1)
      this.setData({
        true_card_now_show_list: list
      })
    }
  },
  downLoadVideo() {
    if (isDownloadingVideo) {
      return
    }
    if (downloadList.length == 0) {
      this.setData({
        is_downloading_video_card: false,
      })
      return
    }
    let _this = this
    isDownloadingVideo = true
    _this.setData({
      is_downloading_video_card: true,
    })
    // for (let i = 0; i < downloadList.length; i++) {
    // console.log(downloadList[0])
    wx.downloadFile({
      url: downloadList[0].video_url,
      success: function (res) {
        // console.log(res)
        if (res.statusCode === 200) {
          wx.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (res1) {
              let progresses = wx.getStorageSync('make_video_progress')
              if (progresses == undefined || progresses == '') {
                progresses = []
              }
              progresses.splice(0, 1)
              if (progresses.length == 0) {
                let progress = {
                  time: 0,
                  percent: 0,
                  making: false
                }
                progresses.push(progress)
              }
              wx.setStorageSync('make_video_progress', progresses)
              // console.log(res)
              // if (i == downloadList.length - 1) {
              //   _this.setData({
              //     is_downloading_video_card: false,
              //   })
              // }
              if (!_this.data.show_downloaded_video) {

                _this.setData({

                  show_downloaded_video: true,
                })
                setTimeout(function () {
                  var animation = wx.createAnimation({
                    duration: 800,
                    timingFunction: "linear",
                    delay: 0
                  })

                  // var SystemInfo = wx.getSystemInfoSync();
                  // // console.log(SystemInfo.windowWidth + '?????' + SystemInfo.windowHeight)
                  // let heightRpx = (SystemInfo.windowWidth / 750);

                  // _this.animation = animation
                  // let top = (2.13 - 0.13) * _this.data.get_card_height * heightRpx
                  // console.log(top)
                  animation.translateY(-1500).step();
                  _this.setData({
                    show_downloaded_video_animationData: animation.export()
                  })
                }, 200)
              }
              // 
              _this.setData({
                show_downloaded_video: true,
                downloaded_video_path: res.tempFilePath
              })
              wx.showToast({
                title: '您的[视频实体碎片]已成功生成  已存入您的相册',
                icon: 'none'
              })
              _this.gettedVideoCard(downloadList[0])

            },
            fail: function (res) {
              // console.log(res)
            }
          })
        }
      }
    })
    // }
  },
  gettedVideoCard(data) {
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
      card_id: data.card_id
    }
    wx.request({
      url: prefix + 'true_card/end_video_card', //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      data: reqData,
      success(res) {}
    })
  },
  changeCOntent() {
    let list = this.data.true_card_show_list_in_bar

    if (list.length == 0) {
      var animation = wx.createAnimation({
        duration: 0,
        timingFunction: 'linear',
        delay: 0
      });
      animation.width('0%').step()
      this.setData({
        get_true_card_content: '暂无新实体碎片可生成',
        progress_animation: animation,
        get_true_card_progress_num: 0,
      })
    } else {
      var animation = wx.createAnimation({
        duration: 0,
        timingFunction: 'linear',
        delay: 0
      });
      animation.width('0%').step()
      this.setData({
        get_true_card_content: list.length + '块实体碎片待生成 ',
        progress_animation: animation,
        get_true_card_progress_num: 0,
      })
    }

  },
  swiperChange3(e) {

    this.setData({
      current3: e.detail.current,
      bar_card: this.data.true_card_show_list_in_bar[e.detail.current]
    })

  },
  swiperChange4(e) {

    this.setData({
      current4: e.detail.current,
      just_show_card: this.data.true_card_now_show_list[e.detail.current]
    })

  },
  hideDownload() {
    let _this = this
    var animation = wx.createAnimation({
      duration: 10,
      timingFunction: "linear",
      delay: 0
    })
    animation.translateY(1500).step();
    this.setData({
      show_downloaded_video_animationData: animation.export()
    })


    this.setData({
      show_downloaded_video: false,
      downloaded_video_path: '',
      show_downloaded_video_animationData: '',
      video_muted: true,
      video_muted_icon: '/pages/images/mute.png'
    })

    setTimeout(function () {
      isDownloadingVideo = false
      // _this.changeCOntent()
      downloadList.splice(0, 1)
      // _this.downLoadVideo()
    }, 200)



  },
  changeMute(e) {
    if (this.data.video_muted) {
      this.setData({
        video_muted: false,
        video_muted_icon: '/pages/images/unmute.png'
      })
    } else {
      this.setData({
        video_muted: true,
        video_muted_icon: '/pages/images/mute.png'
      })
    }
  },
  showDownaloadToast() {
    wx.showToast({
      title: '您的[视频实体碎片]已保存，请打开系统相册查看',
      icon: 'none'
    })
  },
  showMakedImgCardToast() {
    wx.showToast({
      title: '您的[实体碎片]已保存，请打开系统相册查看',
      icon: 'none'
    })
  },
  startProgerss() {
    let _this = this
    // if (this.data.get_true_card_content.indexOf('正在生成') != -1) {
    //   return
    // }

    let progresss = wx.getStorageSync('make_video_progress')
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>')
    // console.log(progresss)
    if (progresss == undefined || progresss == '') {
      return
    }
    let progress = progresss[0]
    if (!progress.making && progresss.length > 1) {
      for (let i = 0; i < progresss.length;) {
        if (!progresss[i].making) {
          progresss.splice(i, 1)
        }
        i++
      }
      if (progresss.length <= 0) {
        return
      } else {
        progress = progresss[0]
        wx.setStorageSync('make_video_progress', progresss)
      }
    }
    if (!progress.making) {
      return
    }
    var timestamp = parseInt((new Date()).valueOf()) / 1000
    let toTime = timestamp - progress.time
    let nowPercent = toTime / progress.percent
    // console.log(nowPercent)
    nowPercent = Math.ceil(nowPercent)
    if (nowPercent == 0) {
      nowPercent = 1
    }
    if (nowPercent > 95) {
      nowPercent = 95
    }
    let totalduration = 10
    var animation = wx.createAnimation({
      duration: totalduration,
      timingFunction: 'linear',
      delay: 0
    });

    animation.width(nowPercent + '%').step()

    this.setData({
      progress_animation: animation,
      get_true_card_content: '正在生成实体碎片 ' + nowPercent + '%',
      get_true_card_progress_num: nowPercent,
    })


    setTimeout(function () {
      let totalduration = (100 - nowPercent) * progress.percent * 1000
      var animation = wx.createAnimation({
        duration: totalduration,
        timingFunction: 'linear',
        delay: 0
      });
      animation.width('95%').step()
      _this.setData({
        progress_animation: animation,
      })
      let num = nowPercent
      clearInterval(numPercent)
      numPercent = setInterval(function () {
        if (_this.data.get_true_card_content.indexOf('95%') != -1) {
          clearInterval(numPercent)
          return
        }
        num++
        _this.setData({
          get_true_card_content: '正在生成实体碎片 ' + num + '%'
        })
        if (num >= 95) {
          clearInterval(numPercent)
        }
      }, progress.percent * 1000)
    }, 200)
  },
  judgeScope() {
    wx.getSetting({
      success(res) {}
    })
  },

  getLoacationAuth(jumpToMyLocal) {
    let _this = this
    _this.getLocation(function () {
      if (jumpToMyLocal) {

        _this.moveToLocation(nlongitude, nlatitude, function () {}, function () {})

        _this.regionchangeNoWait(nlatitude, nlongitude, true)
      }
      _this.locationDataBind()
    })
  },
  affirmToGetLocation(e) {
    let data = e.currentTarget.dataset.item
    let _this = this
    this.setData({
      get_location_auth: false,
    })
    wx.authorize({
      scope: "scope.userLocation", // 权限名称
      success: () => {
        _this.getLocation(function () {
          _this.locationDataBind()
        })
      },

      fail: () => {
        // console.log('scope.address 权限获取失败')
      }
    })
  },
  affirmToGetLocationAgain(e) {
    this.setData({
      get_location_auth_again: false,
    })
  },
  toCardDetail2() {
    if (loopShowList.length <= 0) {
      return
    }
    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + loopShowList[loopNowNum - 1].card_id
    })
  },
  toLogin() {
    this.judgeLogOn('', '')
  },
  getCardRemind() {
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
      url: prefix + 'card_remind', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        // console.log(res)
        let list = res.data.data;
        let haveUpdate = false
        for (let i = 0; i < list.length; i++) {
          let lineNums = _this.judgeContentLines(list[0].content, 29, 550)
          if (lineNums > 1) {
            list[0].change_size = true
          } else {
            list[0].change_size = false
          }
          if (!haveUpdate && list[0].content.indexOf('您的Pick次数+1') != -1) {
            haveUpdate = true
            _this.getAccountInfo('', '')
          }
        }
        // console.log(res)
        let originList = _this.data.lv_up_list
        if (originList.length == 0) {

          _this.setData({
            lv_up_list: list
          })
          _this.updateCardRemind(list[0])
        } else {

          let result = []
          result = _this.mergeList(originList, list)
          // result.push(originList[0])
          // result.concat(list)
          _this.setData({
            lv_up_list: result
          })
        }
      }
    })
  },
  mergeList(originList, nowList) {
    let result = []
    result.push(originList[0])
    let four = []
    for (let i = 1; i < originList.length; i++) {
      let origin = originList[i]
      if (origin.type == 4) {
        let add = true
        for (let j = 0; j < nowList.length; j++) {
          let now = nowList[j]
          if (now.type == 4 && now.card_id == origin.card_id) {
            add = false
            break;
          }
        }
        if (add) {
          four.push(origin)
        }
      }
    }
    // console.log("four")
    // console.log(four)
    let haveAddFour = false
    if (nowList.length == 0) {
      result = result.concat(four);
    }
    for (let i = 0; i < nowList.length; i++) {
      let now = nowList[i]
      if (now.type == 4 || now.type > 4) {
        if (!haveAddFour) {
          result = result.concat(four);
          haveAddFour = true
        }
      }
      result.push(now)
      if (i + 1 == nowList.length && !haveAddFour) {
        result = result.concat(four);
        haveAddFour = true
      }
    }

    // console.log("result")
    // console.log(result)
    return result
  },
  updateCardRemind(data) {
    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    } else {
      return
    }

    wx.request({
      url: prefix + 'card_remind', //仅为示例，并非真实的接口地址
      method: 'PUT',
      data: data,
      header: header,
      success(res) {}
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
        if (res.data.result == 0) {
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
            get_card_num: accountInof.get_card_num,
            account_info: accountInof,
            show_loading: false,
            show_login_loading: false,
          });
          _this.afterLogin(e, type)
          rechargeTime = 3600 - accountInof.surplus_seconds
          if (!haveCountDown) {
            haveCountDown = true
            _this.recharge()
          }


          isLogining = false
        }
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
    } else if (type == 'showBuySquareSteps') {
      _this.showBuySquareSteps()
    } else if (type == 'sellCard') {
      _this.sellCard()
    }
  },
  affirmBottomPop() {

    this.setData({
      show_bottom_pop: false
    })
    this.getCardRequest()
  },
  cancelBottomPop() {
    this.setData({
      show_bottom_pop: false
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

    wx.request({
      url: prefix + 'account_scan?card_id=' + e + '&account_id=' + jumpAccountID, //仅为示例，并非真实的接口地址
      method: 'PUT',
      header: header,
      success(res) {

      }
    })
  },
  updateShareInfo() {
    // console.log("没翻车吗??????????????????")
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

      }
    })
  },
  toOtherAccountInfo(e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../other_me/other_me?account_id=' + item
    })
  },
  reGetLocation() {
    if (nowGetCard == 1) {
      return
    }
    let _this = this
    this.getLocation(function () {
      _this.locationDataBind()
    })
  },
  getLocation(callBack) {

    // const _locationChangeFn = function (res) {
    //   console.log('location change', res)
    //   nlatitude = res.latitude
    //   nlongitude = res.longitude
    // }
    // wx.onLocationChange(_locationChangeFn)
    // wx.offLocationChange(_locationChangeFn)
    if (nlatitude == 0.0) {
      // let num = 1
      let internel = setInterval(function () {
        // num++

        if (nlatitude != 0.0) {
          clearInterval(internel)
          callBack()
        } else {
          // if (num == 10) {
          //   nlatitude = 39.908429
          //   nlongitude = 116.45972
          //   clearInterval(internel)
          //   callBack()
          // }
        }

      }, 500)
    } else {
      callBack()
    }


    // wx.getLocation({
    //   type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
    //   success: function (res) {
    //     nlatitude = res.latitude
    //     nlongitude = res.longitude
    //     _this.locationDataBind()
    //   }
    // })
  },
  judgeContentLines(content, rpxNum, maxWidthRpx) {
    if (content == null || content == undefined || content.length == 0) {
      return 0;
    }
    var SystemInfo = wx.getSystemInfoSync();
    // console.log(SystemInfo.windowWidth + '?????' + SystemInfo.windowHeight)
    let rpxToPx = SystemInfo.windowWidth / 750 * rpxNum;
    let maxWidth = SystemInfo.windowWidth / 750 * maxWidthRpx;
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
  toBadge() {
    let item = this.data.imgUrls[this.data.current].badge_id
    wx.navigateTo({
      url: '../badge_card/badge_card?badge_id=' + item
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
  reload() {
    // console.log("reload")
    getApp().globalData.isReload = true
    // let pageList=getCurrentPages()
    // console.log(pageList)
    // for(let i=0;i<pageList.length;i++){
    //   if(pageList[i].route=='pages/map/map'){
    //     pageList[i].data=this.data
    //   }
    // }
    //当前定位位置
    // nlatitude = 0.0
    // nlongitude = 0.0
    //当前所选择功能碎片  0 未选择，1 扩块碎片，2 Plus碎片，3 远程碎片
    nowGetCard = 0

    //扩块碎片扩块过程中进制点击状态
    forbid_click = false;

    //获取的应用二维码url
    qcCodeUrl = ''

    //是否正在登陆
    isLogining = false

    //点击地图上的marke
    isClickMarket = false //是否点击了地图上的marke
    nowShowDetailID = 0 //当前选中的地图上stack id
    marketClickTimeOut = "" //点击了地图以取消中间态

    //是否在下载视频（暂时弃用）
    isDownloadingVideo = false

    //充能定时器 
    rechargeInternal = '' //充能定时器
    haveCountDown = false //充能定时器是否正在运行
    rechargeTime = 0 //定时器宣誓时间

    //判断碎片是否是范围内的碎片所限定范围
    distance = 100;

    touchDotX = 0; //X按下时坐标
    touchDotY = 0; //y按下时坐标
    interval; //计时器
    time = 0; //从按下到松开共多少时间*100

    //当前页面是否处于活动状态
    onAction = true;

    //抽碎片
    nowSelectCardPercent = 0 //长按抽碎片进度条百分比
    showSuccess = false //长按抽碎片当前状态
    selectCardTouching = false
    getCardLoadingInterval = '' //长按抽碎片进度定时器
    updateAccountCpUp = false //抽碎片完成后何时更新兑字内容

    //是否正在获取视野范围内碎片
    isGettingZoneCard = false

    //地图上所显示marke
    // allMarkers = []
    // map = new Map();
    //定位范围内的碎片
    mapZoneCard = [];

    //swiper 自定义圆点显示
    listNowSHow = 0
    lastListNowSHow = 0
    lastListNowSHowPointStatus = 'down'

    //信息栏当前显示list
    nowShowList = []
    //热碎片列表
    hotListResult = []

    //实体碎片
    canShowNowShowTrueCardList = true //能否展示弹出实体碎片
    numPercent = '' //生成实体碎片进度计时器
    showTureCardListType = '' //当前显示的实体碎片列表
    isShowToast = false //是否展示弹出实体碎片toast
    makeImgCardSuccess = false //实体碎片制作状态
    downloadList = [] //实体碎片视频下载列表（暂时弃用）

    //兑换帮列表数据及当前所显示index
    // loopShowList = []
    // loopNowNum = 0

    //热碎片列表所显示进度以及是否是显示的热碎片列表
    cardInfoCurrent = 0
    isShowHotCardList = false
    hotCardListPointStatus = 'down'

    zoomCardListCurrent = 0
    zoomCardListPointStatus = 'down'

    //重定位计时器
    reGetLocationInterval = ''
    //判断文字宽度所用canvas
    judgeCOntentLineContext = ''
  },
  changePointUrl(url) {
    return url
    // if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_ssr.png') {
    //   return '/pages/images/card_group_ssr.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_sr.png') {
    //   return '/pages/images/card_group_sr.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_2.png') {
    //   return '/pages/images/card_group_2.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_3.png') {
    //   return '/pages/images/card_group_3.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_4.png') {
    //   return '/pages/images/card_group_4.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_5.png') {
    //   return '/pages/images/card_group_5.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_6.png') {
    //   return '/pages/images/card_group_6.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_7.png') {
    //   return '/pages/images/card_group_7.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_8.png') {
    //   return '/pages/images/card_group_8.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_9.png') {
    //   return '/pages/images/card_group_9.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_10.png') {
    //   return '/pages/images/card_group_10.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_20.png') {
    //   return '/pages/images/card_group_20.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_30.png') {
    //   return '/pages/images/card_group_30.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_40.png') {
    //   return '/pages/images/card_group_40.png'
    // } else if (url == 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/card_group_50.png') {
    //   return '/pages/images/card_group_50.png'
    // }
  },
  videoerror(e) {
    // console.log("视频出错了！！！")
    // console.log(e)
  },
  videoWaiting(e) {
    // console.log("视频缓冲中了！！！")
    // console.log(e)
  },
  videoLoaded(e) {

    let list = this.data.get_card_inofs_for_video_show
    for (let i = 0; i < list.length; i++) {

      if (list[i].card_id == e.currentTarget.dataset.item) {
        list[i].video_loaded = true
      }
    }
    this.setData({
      get_card_inofs_for_video_show: list
    })
    // console.log("视频缓冲好了！！！")
    // console.log(e)
  },
  pausepause(e) {
    // console.log("视频被暂停了？？？？？？！")
    // console.log(e)
  },
  locationDataBind() {
    this.regionchangeNoWait(nlatitude, nlongitude, true)

    let localPoint = {
      id: -1,
      latitude: nlatitude,
      longitude: nlongitude,
      width: 20,
      height: 20,
      iconPath: "/pages/images/location.png",
      anchor: {
        x: .5,
        y: .5
      }
    }
    if (map.get(-1)) {
      for (let i = 0; i < allMarkers.length; i++) {
        if (allMarkers[i].id == -1 || allMarkers[i].id == -100) {
          allMarkers[i] = localPoint
          break
        }
      }
    } else {
      map.set(-1, true)
      allMarkers.push(localPoint)
    }

    if (nowGetCard != 1) {
      this.setData({
        markers: allMarkers
      })
    } else {
      this.setData({
        markers: allMarkers,
        circles: []
      })
    }
  },
  buyChipSquare() {
    if (squareInfo.title.length <= 0) {
      wx.showToast({
        title: '地盘名称不能为空',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '正在生成地盘..',
    })
    let _this = this



    qqmapsdk.reverseGeocoder({
      location: {
        latitude: squareInfo.lat,
        longitude: squareInfo.lng
      },
      success: (res2) => {
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

        // console.log(res2)
        squareInfo.city_name = res2.result.address_component.city
        squareInfo.area_name = res2.result.address_component.district

        request.buySquare(squareInfo, function (res) {
          wx.setStorageSync('show_buy_square_toast', {
            show: false
          })
          _this.regionchangeNoWait(squareInfo.lat, squareInfo.lng, true)
          _this.getAccountInfo('', '')
          _this.getCardDeal()
          _this.setData({
            no_touch: true
          })
          wx.hideLoading()
          if (res.result == 0) {

            let pages = getCurrentPages();
            //获取所需页面
            let prevPage = pages[pages.length - 2]; //上一页
            prevPage.setData({
              addData: res.data, //你需要传过去的数据
            });
            _this.refresList()
            _this.showToast3("恭喜您，成功购得宇宙地盘" + res.data.card_show_id + "，即将为您生成地盘碎片…", 2500)

            _this.cancelBuySquare()

            setTimeout(function () {
              wx.navigateTo({
                url: '../card_detail/card_detail?show_create_suqare_toast=true&card_id=' + res.data.card_id
              })
              setTimeout(function () {
                _this.setData({
                  no_touch: false
                })
              }, 500)
            }, 2500)

          } else {
            _this.setData({
              no_touch: false
            })
            wx.showToast({
              title: res.msg,
              icon: 'none'
            })
          }
        })
      }
    })



  },
  cancelBuySquare() {
    this.setData({
      buy_square_first_step: false,
      buy_square_second_step: false
    })
  },
  showBuySquareSteps() {
    if (this.data.change_show) {
      this.searchPlace()
      return
    }
    if (!this.judgeLogOn('', 'showBuySquareSteps')) {
      return;
    }

    if (!this.data.show_buy_btn) {
      return
    }
    if (this.data.account_info.cpoint < 500) {
      this.setData({
        no_cp_toast: true
      })
      return
    }
    squareInfo = {
      lat: 0.0,
      lng: 0.0,
      title: "",
      content: ""
    }
    const mapCtx = wx.createMapContext('map', this);
    let _this = this
    mapCtx.getCenterLocation({
      success: (res) => {
        squareInfo.lat = res.latitude
        squareInfo.lng = res.longitude
        if (!_this.judgePointInSquare(squareInfo.lat, squareInfo.lng)) {
          wx.showToast({
            title: '压盖了其它地盘，无法在该地购买地盘',
            icon: 'none'
          })
          return
        }
        _this.setData({
          buy_square_first_step: true
        })
      },
      fail: (res) => {
        console.log("???????????????????4444", res)
      },
    })





  },
  buySquareSecondStep() {
    this.setData({
      buy_square_first_step: false,
      buy_square_second_step: true
    })
  },
  titleInput(e) {
    let content = e.detail.detail.value
    squareInfo.title = content
  },
  contentInput(e) {
    let content = e.detail.detail.value
    squareInfo.content = content
  },
  mapTap(e) {
    // console.log(e)
    if (isClickMarket) {
      return
    }
    this.backCardList()
  },

  showSquareDealToast() {
    if (this.data.change_show) {

      return
    }
    this.setData({
      show_square_deal_toast: true
    })
  },
  sonPageBack(e) {
    this.setData({
      selected_place: false,
      get_search_focus: false
    })
  },
  searchPlace(e) {
    this.setData({
      selected_place: true,
      no_data: true,
      toast_icon: '/pages/images/search_icon.png',
      toast_content: '快输入关键词来传送到附近吧'
    })
    let _this = this
    setTimeout(function () {
      _this.setData({
        get_search_focus: true
      })
    }, 200)
  },
  searchPlaceByKey(e) {
    let _this = this
    // console.log(e);
    if (e.detail.value == "") {
      this.setData({
        places: default_list,
        no_data: false,
        toast_icon: '/pages/images/search_icon.png',
        toast_content: '快输入关键词来传送到附近吧'
      })
    }
    let searchLat = 39.856145
    let searchLon = 116.683782
    if (nlatitude != 0.0) {
      searchLat = nlatitude
      searchLon = nlongitude
    }

    qqmapsdk.search({
      keyword: e.detail.value,
      auto_extend: 0,
      page_size: 20,
      auto_extend: 1,
      region: "北京",
      location: {
        latitude: searchLat,
        longitude: searchLon
      },
      success: function (res) {
        // console.log(res);
        if (res.data.length == 0) {
          _this.setData({
            places: res.data,
            no_data: true,
            toast_icon: '/pages/images/search_no_data_icon.png',
            toast_content: '这里好像是一块荒地哦!'
          })
        } else {
          _this.setData({
            places: [],
            no_data: false
          })
          setTimeout(function () {
            _this.setData({
              places: res.data,
              no_data: false
            })
          }, 300)

        }

      },
      fail: function (res) {
        // console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });

  },
  placeAction(e) {
    // console.log(e)
    let place = e.currentTarget.dataset.item
    console.log(place)
    this.setData({
      selected_place: false,
      places: []
    })
    let _this = this
    this.moveToLocation(place.location.lng, place.location.lat, function () {
      _this.showToast4(place.title)
    }, function () {})

    if (!this.data.show_mid_btn) {
      this.setData({
        show_mid_btn: true
      })
    }
    // this.setData({
    //   selected_place: false,
    //   show_content: true,
    //   place_name_color: '#33A3DE',
    //   place_name_icon: '/pages/images/location3_blue.png',
    //   place_name: e.currentTarget.dataset.item.title,
    //   title_value: titeltString,
    //   content_value: contentString,
    //   places: []
    // })
  },
  placeAction2(e) {
    let place = e.currentTarget.dataset.item
    this.setData({
      selected_place: false,
      places: []
    })
    let _this = this
    this.moveToLocation(place.lng, place.lat, function () {
      _this.showToast4(place.content)
    }, function () {})


    if (!this.data.show_mid_btn) {
      this.setData({
        show_mid_btn: true
      })
    }

  },
  backLastPage(e) {
    if (this.data.selected_place) {
      this.sonPageBack()
      return
    }
    wx.navigateBack({
      delta: 1
    })
  },
  jumpToLocation() {
    // console.log('eeeeeeeee')
    mapIsReadied = true
    if (jumpMyLocation) {
      jumpMyLocation = false
      // console.log(nlatitude, nlongitude)
      this.setData({

        circles: []
      })

      this.moveToLocation(nlongitude, nlatitude, function () {}, function () {})

    }
    let _this = this
    // if (showTitleItem == '') {
    //   _this.initMidShowID()
    // } else {
    //   clearInterval(timer)
    // }
    let timer = setInterval(function () {
      if (showTitleItem == '') {
        _this.initMidShowID()
      } else {
        clearInterval(timer)
      }
    }, 5000)
  },
  judgePointInSquare(lat, lng) {

    let north = this.getNextPoint(lng, lat, 0, 50)
    let south = this.getNextPoint(lng, lat, 180, 50)
    let east = this.getNextPoint(lng, lat, 90, 50)
    let west = this.getNextPoint(lng, lat, 270, 50)
    let list = this.data.markers
    if (list == null || list == undefined) {
      return true
    }
    for (let i = 0; i < list.length; i++) {


      if (list[i].id == -1 || list[i].id == -100) {
        continue
      }
      let inLat = list[i].latitude >= south.lat && list[i].latitude <= north.lat;
      let inLon = list[i].longitude >= west.lng && list[i].longitude <= east.lng;

      // console.log(inLat, inLon)
      if (inLat && inLon) {
        // console.log("333333")

        if (list[i].card_info_list[0].card_type == 'SQUARE') {
          return false
        }
      }

    }
    return true

  },
  judgePointInSquareItem(lat, lng) {

    let north = this.getNextPoint(lng, lat, 0, 50)
    let south = this.getNextPoint(lng, lat, 180, 50)
    let east = this.getNextPoint(lng, lat, 90, 50)
    let west = this.getNextPoint(lng, lat, 270, 50)
    let list = this.data.markers
    if (list == null || list == undefined) {
      return ''
    }
    let returnItem = ''
    for (let i = 0; i < list.length; i++) {

      if (list[i].id == -1 || list[i].id == -100) {
        continue
      }
      let inLat = list[i].latitude >= south.lat && list[i].latitude <= north.lat;
      let inLon = list[i].longitude >= west.lng && list[i].longitude <= east.lng;

      if (inLat && inLon) {

        if (list[i].card_info_list[0].card_type == 'SQUARE') {
          if (returnItem == '') {
            list[i].distance = this.getFlatternDistance(lat, lng, list[i].latitude, list[i].longitude)
            returnItem = list[i]
          } else {
            list[i].distance = this.getFlatternDistance(lat, lng, list[i].latitude, list[i].longitude)
            if (list[i].distance < returnItem.distance) {
              returnItem = list[i]
            }
          }
        }
      }
    }
    return returnItem

  },
  getRad(d) {
    return d * Math.PI / 180.0;
  },
  /*参数：两地的经纬度数值*/
  getFlatternDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = this.getRad(lat1);
    var radLat2 = this.getRad(lat2);
    var a = radLat1 - radLat2;
    var b = this.getRad(lng1) - this.getRad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为米
    s = s.toFixed(0);
    return s;
  },
  getNextPoint(lng, lat, heading, distance) {
    //计算扇形的眯点坐标
    heading = (heading + 360) % 360;
    var rad = Math.PI / 180,
      radInv = 180 / Math.PI,
      R = 6378137, // approximation of Earth's radius
      lon1 = lng * rad,
      lat1 = lat * rad,
      rheading = heading * rad,
      sinLat1 = Math.sin(lat1),
      cosLat1 = Math.cos(lat1),
      cosDistR = Math.cos(distance / R),
      sinDistR = Math.sin(distance / R),
      lat2 = Math.asin(
        sinLat1 * cosDistR + cosLat1 * sinDistR * Math.cos(rheading)
      ),
      lon2 =
      lon1 +
      Math.atan2(
        Math.sin(rheading) * sinDistR * cosLat1,
        cosDistR - sinLat1 * Math.sin(lat2)
      );
    lon2 = lon2 * radInv;
    lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
    lat2 = lat2 * radInv
    var lngLatObj = {
      lng: lon2,
      lat: lat2
    }
    return lngLatObj;
    // return [lon2, lat2]
  },
  getCardDeal() {
    let _this = this
    request.getCardDeal(function (res) {
      _this.setData({
        deal_info: res
      })
    })
  },
  judgeLocationAuth() {
    let _this = this
    wx.getSetting({
      success(res) {
        var authMap = res.authSetting;
        if (authMap['scope.userLocation'] == undefined) {
          setTimeout(function () {
            _this.judgeLocationAuth()
          }, 500)

        } else if (authMap['scope.userLocation'] == true) {

        } else if (authMap['scope.userLocation'] == false) {

          nlatitude = 39.908429
          nlongitude = 116.45972
          let hotPoi = wx.getStorageSync('hot_poi')
          if (hotPoi != '') {
            nlatitude = hotPoi.lat
            nlongitude = hotPoi.lng
          }

        }
      }
    })
  },
  sellCard() {
    if (!this.judgeLogOn('', 'sellCard')) {
      return;
    }
    filter.jumpToMePage(-1, 'to_tab=three')
  },
  showHaveCpToast() {
    this.setData({
      show_have_cp_toast: true
    })
  },
  reJudgeShow() {
    // let _this=this
    // setTimeout(function () {
    //   _this.reJudgeShow()
    //   _this.changeShowShouldPoint()

    // },10000)
  },
  changeShowShouldPoint() {
    let _this = this
    let list = _this.data.markers
    if (list.length <= 30) {
      return
    }

    const mapCtx = wx.createMapContext('map', this);
    mapCtx.getRegion({
      success(result) {

        let nowShowList = _this.data.show_markers

        let showList = []
        for (let i = 0; i < nowShowList.length; i++) {
          if (nowShowList[i].id == -100 && nowShowList[i].id == -1) {
            let item = nowShowList[i]
            showList.push(item)
          }
        }

        for (let i = 0; i < list.length; i++) {
          if (list[i].id != -100 && list[i].id != -1) {
            let item = list[i]
            if (item.lat < result.northeast.latitude + 0.001 &&
              item.lat > result.southwest.latitude - 0.001 &&
              item.lng < result.northeast.longitude + 0.001 &&
              item.lng > result.southwest.longitude - 0.001) {
              showList.push(item)
            }
          }
        }

        _this.setData({
          markers: showList
        })
      }
    })
  },
  test() {
    let north = this.getNextPoint(116.679855, 31.232807493271157, 0, 50)
    let north2 = this.getNextPoint(116.679855, 21.55773, 0, 50)
    let north3 = this.getNextPoint(116.679855, 52.26233, 0, 50)

    console.log('north', north, north.lat - 39.849771, this.calculateSquare(116.679855, 39.849771))
    console.log('north2', north2, north2.lat - 21.55773, this.calculateSquare(116.679855, 21.55773))
    console.log('north3', north3, north3.lat - 52.26233, this.calculateSquare(116.679855, 52.26233))
  },
  calculateSquare(lon, lat) {
    var north = this.getNextPoint(lon, lat, 0, 50)
    let north1 = this.getNextPoint(116.679855, 39.849771, 0, 50)

    let width = 120 * (((north.lat - lat) * 2) / ((north1.lat - 39.849771) * 2))
    return width
  },
  moveToLocation(lon, lat, callback, callback2) {
    let _this = this
    this.setData({
      latitude: lat,
      longitude: lon,
    })
    const mapCtx = wx.createMapContext('map', this);
    mapCtx.moveToLocation({
      latitude: lat,
      longitude: lon,
      success: () => {
        let x = _this.getSquareWidth(lat)
        _this.setData({
          square_width: x,
        })
        callback()
      },
      fail: (res) => {
        callback2()
      }
    })
  },
  getSquareWidth(lat) {
    let base1 = parseInt(lat)
    let base2 = base1 + 1
    let d1 = lat - base1
    let d2 = base2 - lat
    let getIndex = 0
    if (d2 - d1 > 0) {
      getIndex = diffLat[base1 - 18]
    } else {
      getIndex = diffLat[base2 - 18]
    }
    let x = 96 * (0.0030787583831966003 / getIndex)
    return x
  },
  refresList() {
    if (!buySquareRefresh) {
      return
    }
    buySquareRefresh = false
    let pages = getCurrentPages();
    //获取所需页面
    if (pages.length >= 2) {
      let prevPage = pages[pages.length - 2]; //上一页
      prevPage.setData({
        refresh_square_list: true, //你需要传过去的数据
      });
    }
  },
})