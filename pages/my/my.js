var showCardInfoUtil = require('../common/utils/show_card_info_util.js');
var request = require('../common/request.js');
let prefix = ''

let maxTop = 0
let maxTopPx = 0
let tabHeight = 0
let newAccountSell = false
let newAccountSellPassToast = false

let now_tab = 'one'

let want_card_list = []
let created_card_list = []
let have_card_list = []
let square_card_list = []

let isSelf = true

let createPageNum = 0
let wantPageNum = 0
let havePageNum = 0
let squarePageNum = 0

let isGettingCardList = false
let otherAccount = false
let otherAccountID = 0

var ctx_urils = require("../common/utils/ctx_utils");
let app = getApp()
let sellList = []

let multInternal = ''

//跳转判断
let jumpJudegeTab = false
let createListFirstRequest = false
let wantListFirstRequest = false
let squareListFirstRequest = false
let haveListFirstRequest = false



let windowHeight = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sell_card_num: 0,
    sell_card_cp: 0,
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    account_name: "请点击登录",
    icon_url: "/pages/images/default_account_icon.png",
    not_have_card: false,
    not_have_card_icon: '',
    navi_bar_color: '#3497D2',
    show_top_bar: false,
    cure: false,
    acccount_icon_width: 148,
    now_key: 'one',
    create_card_opacity: 1,
    show_mask: false,
    show_loading: false,
    account_info: {},
    isSelf: true,
    show_top_loading: false,
    change_show: wx.getStorageSync('change_show'),
    loading: true,
    refresh_square_list: false,
    update_item: ''
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
    this.setViewHeight()
    want_card_list = []
    created_card_list = []
    have_card_list = []
    square_card_list = []
    createListFirstRequest = false
    wantListFirstRequest = false
    squareListFirstRequest = false
    haveListFirstRequest = false
    let _this = this
    if (options.new_account_sell != undefined) {
      newAccountSell = true
    } else {
      newAccountSell = false

    }
    newAccountSellPassToast = false
    if (options.show_toast != undefined) {
      setTimeout(function (e) {
        wx.showToast({
          title: options.show_toast,
          icon: "none",
          duration: 2500
        })
      }, 1000)
    }
    setTimeout(function (e) {
      _this.setData({
        create_card_opacity: 0.4
      })
    }, 2500)
    now_tab = 'one'
    createPageNum = 0
    wantPageNum = 0
    havePageNum = 0
    squarePageNum = 0
    let accountID = options.account_id;
    isSelf = false
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      if (accountID != undefined) {
        if (accountID == userInfo.account_id) {
          isSelf = true
        }
      }
    }
    if (options.to_tab != undefined) {
      jumpJudegeTab = true
      this.setData({
        now_key: options.to_tab
      })
    } else {
      jumpJudegeTab = false
    }

    if (accountID != undefined && accountID != -1 && !isSelf) {
      otherAccountID = accountID
      otherAccount = true
      this.setData({
        isSelf: true,
        log_in: true
      });
      this.getOtherAccountInfo(accountID)
      this.initOtherCreateList(accountID, true, true)
      this.initOtherWantList(accountID, true)
      this.initOtherHaveList(accountID, true)
    } else {
      isSelf = true
      otherAccount = false
      if (wx.getStorageSync('login') != '') {
        let userInfo = wx.getStorageSync('userInfo')
        console.log(userInfo)
        this.setData({
          isSelf: false,
          account_name: userInfo.account_name,
          icon_url: userInfo.account_icon,
          weiyu_id: userInfo.weiyu_id,
          log_in: true,
          account_info: userInfo
        });
      }
      this.initCreatedList(false)
      this.initWantList(false)
      this.initHaveList(false, false)
      this.initHaveSquareList(false, false)
    }
    if (!jumpJudegeTab) {
      let judgeJumpAndLoading = setInterval(function () {
        if (createListFirstRequest && wantListFirstRequest && squareListFirstRequest && haveListFirstRequest) {
          clearInterval(judgeJumpAndLoading)
          let toTab = 'one'
          if (created_card_list.length > 0) {
            return
          } else if (have_card_list.length > 0) {
            toTab = 'three'
          } else if (square_card_list.length > 0) {
            if(_this.data.change_show){
              toTab = 'three'
            }else{
              toTab = 'four'
            }
            
          } else if (want_card_list.length > 0) {
            toTab = 'two'
          }
          _this.setData({
            loading: false,
          })
          let e = {
            detail: {
              activeKey: toTab
            }
          }
          _this.changeTabs(e)
        }
      }, 1000)
    }

    this.setData({
      isSelf: isSelf
    })
  },
  setViewHeight() {
    var SystemInfo = wx.getSystemInfoSync();
    let heightRpx = 750 * (SystemInfo.windowHeight / SystemInfo.windowWidth);
    let mapHeight = heightRpx - 728
    let top = heightRpx * 0.10
    windowHeight = SystemInfo.windowHeight
    maxTop = 3.78 * this.data.acccount_icon_width * (SystemInfo.windowWidth / 750)
    maxTopPx = SystemInfo.windowHeight * 0.10
    let getCardHeight = heightRpx * 0.76
    let heighter = true
    if ((SystemInfo.windowWidth / SystemInfo.windowHeight) >= 0.5) {
      getCardHeight = heightRpx * 0.85
      heighter = false
    }
    this.setData({
      rpx_to_px: SystemInfo.windowWidth / 750,
      map_height: mapHeight,
      get_card_height: getCardHeight,
      sticky_top: top,
      view_heighter: heighter,
      window_height: heightRpx
    })
  },
  onPageScroll(e) {
    let that = this;

    if (e.scrollTop > (maxTop - (maxTopPx))) {
      if (!that.data.show_top_bar) {
        that.setData({
          show_top_bar: true,
        })
      }
    } else {
      if (that.data.show_top_bar) {
        that.setData({
          show_top_bar: false,
        })
      }
    }


    let _this = this
    let query = wx.createSelectorQuery();
    query.select('#lists').boundingClientRect(rect => {
      let height = rect.height;
      let bottom = windowHeight + e.scrollTop
      let nowHeight = (_this.data.acccount_icon_width * 3.78 + 80) * _this.data.rpx_to_px + height

      if (bottom >= nowHeight * 0.7) {
        // console.log(e)
        _this.updateList()
      }

    }).exec();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  clikcListItem(e) {
    let item = e.detail.currentTarget.dataset.item

    if (this.data.sell_mult_card) {

      if (item.assessing) {
        if (this.data.change_show) {
          wx.showToast({
            title: '首发中的卡片无法出售',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '首发中的碎片无法出售',
            icon: 'none'
          })
        }

        return
      }

      if (item.self && item.can_sell_num <= 0) {
        if (this.data.change_show) {
          this.showToast("自己创造的卡片至多售出3块\n剩余碎片可以继续持有或交换", 2000)
        } else {
          this.showToast("自己创造的碎片至多售出3块\n剩余碎片可以继续持有或交换", 2000)
        }

        return
      }

      if (item.card_type == 'SQUARE') {
        if (this.data.change_show) {
          wx.showToast({
            title: '地盘卡片无法出售，只能赠送',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '地盘碎片无法出售，只能赠送',
            icon: 'none'
          })
        }

        return
      }

      let add = true
      let result = []
      for (let i = 0; i < sellList.length; i++) {
        if (item.card_id == sellList[i]) {
          add = false
        } else {
          result.push(sellList[i])
        }
      }
      let sellCardNum = this.data.sell_card_num
      let sellCardCP = this.data.sell_card_cp

      let sell_num = 0
      if (item.self && item.have_card_num >= item.can_sell_num) {
        sell_num = item.can_sell_num
      } else {
        sell_num = item.have_card_num
      }


      if (add) {
        result.push(item.card_id)

        sellCardNum = sellCardNum + sell_num
        sellCardCP = sellCardCP + item.card_cpoint * sell_num
      } else {
        sellCardNum = sellCardNum - sell_num
        sellCardCP = sellCardCP - item.card_cpoint * sell_num
      }
      this.setData({
        sell_card_num: sellCardNum,
        sell_card_cp: sellCardCP
      })
      sellList = result
      this.selectComponent('#show_list').updateSellList(sellList);
      return
    }

    wx.navigateTo({
      url: '../card_detail/card_detail?card_id=' + item.card_id
    })
  },
  changeTabs(e) {

    if (e.detail.activeKey == 'one') {
      now_tab = 'one'
      if (created_card_list.length == 0) {
        let content = '还没有创造任何碎片哦，点击创造~'
        if (otherAccount) {
          content = 'ta还没有创造任何碎片哦~'
        }
        if (this.data.change_show) {
          content = '还没有创造任何卡片哦，点击创造~'
        }

        this.setData({
          not_have_card: true,
          not_have_card_icon: '/pages/images/created_card_zero.png',
          no_data_content: content,
          now_key: e.detail.activeKey
        })
      } else {
        this.setData({
          not_have_card: false,
          now_key: e.detail.activeKey
        })
      }
      wx.lin.renderWaterFlow([], true);

      setTimeout(function () {
        wx.lin.renderWaterFlow(created_card_list, true);
      }, 200)
    } else if (e.detail.activeKey == 'two') {
      now_tab = 'two'
      if (want_card_list.length == 0) {
        let content = '还没有收藏任何碎片哦~'
        if (otherAccount) {
          content = 'ta还没有收藏任何碎片哦~'
        }
        if (this.data.change_show) {
          content = '还没有收藏任何卡片哦，点击创造~'
        }
        this.setData({
          not_have_card: true,
          no_data_content: content,
          not_have_card_icon: '/pages/images/want_card_zero.png',
          now_key: e.detail.activeKey
        })
      } else {
        this.setData({
          not_have_card: false,
          now_key: e.detail.activeKey
        })
      }
      wx.lin.renderWaterFlow([], true);
      setTimeout(function () {
        wx.lin.renderWaterFlow(want_card_list, true);
      }, 200)
    } else if (e.detail.activeKey == 'three') {
      now_tab = 'three'
      if (have_card_list.length == 0) {
        let content = '还未拥有碎片哦，快去集碎片吧~'
        if (otherAccount) {
          content = 'ta还未拥有碎片哦~'
        }
        if (this.data.change_show) {
          content = '还没有拥有任何卡片哦，点击创造~'
        }
        this.setData({
          not_have_card: true,
          no_data_content: content,
          not_have_card_icon: '/pages/images/have_card_zero.png',
          now_key: e.detail.activeKey
        })
      } else {
        this.setData({
          not_have_card: false,
          now_key: e.detail.activeKey
        })
      }
      wx.lin.renderWaterFlow([], true);
      setTimeout(function () {
        wx.lin.renderWaterFlow(have_card_list, true);
      }, 200)
    } else {
      now_tab = 'four'
      if (square_card_list.length == 0) {
        let content = '还没有属于您的宇宙地盘，点击购买~'
        if (otherAccount) {
          content = 'ta还未拥有碎片哦~'
        }
        if (this.data.change_show) {
          content = '还没有拥有任何卡片哦，点击创造~'
        }
        this.setData({
          not_have_card: true,
          no_data_content: content,
          not_have_card_icon: '/pages/images/have_square_zero.png',
          now_key: e.detail.activeKey
        })
      } else {
        this.setData({
          not_have_card: false,
          now_key: e.detail.activeKey
        })
      }
      wx.lin.renderWaterFlow([], true);
      setTimeout(function () {
        wx.lin.renderWaterFlow(square_card_list, true);
      }, 200)
    }
  },
  changeTabs1(e) {
    this.changeTabs(e)
    // if (e.detail.activeKey == 'one') {
    //   this.setData({
    //     not_have_card: false,
    //     now_key: e.detail.activeKey
    //   })
    // } else if (e.detail.activeKey == 'two') {
    //   this.setData({
    //     not_have_card: false,
    //     now_key: e.detail.activeKey
    //   })
    // } else {
    //   this.setData({
    //     not_have_card: false,
    //     now_key: e.detail.activeKey
    //   })
    // }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.createSelectorQuery().select('#tabs').boundingClientRect(function (rect) {
      console.log(rect)
      tabHeight = rect.height
    }).exec()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (isSelf) {
      this.getAccountInfo()
    }
    if (this.data.refresh_square_list) {
      this.setData({
        refresh_square_list: false
      })
      squarePageNum = 0
      this.initHaveSquareList(true, true)
    }
    this.updateExistItem()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(multInternal)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('刷他妈的新')
    if (isSelf) {
      this.getAccountInfo()
    }
    this.setData({
      show_top_loading: true
    })
    if (this.data.now_key == 'one') {
      createPageNum = 0
      if (isSelf) {
        this.initCreatedList(true)
      } else {
        this.initOtherCreateList(otherAccountID, false, true)
      }
    } else if (this.data.now_key == 'two') {
      wantPageNum = 0
      if (isSelf) {
        this.initWantList(true)
      } else {
        this.initOtherWantList(otherAccountID, true)
      }
    } else if (this.data.now_key == 'three') {
      havePageNum = 0
      if (isSelf) {
        this.initHaveList(false, true)
      } else {
        this.initOtherHaveList(otherAccountID, true)
      }

    } else {
      squarePageNum = 0
      if (isSelf) {
        this.initHaveSquareList(true, false)
      } else {}

    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.now_key == 'one') {
      if (isSelf) {
        this.initCreatedList(true)
      } else {
        this.initOtherCreateList(otherAccountID, false, true)
      }
    } else if (this.data.now_key == 'two') {
      if (isSelf) {
        this.initWantList(true)
      } else {
        this.initOtherWantList(otherAccountID, true)
      }
    } else if (this.data.now_key == 'three') {
      if (isSelf) {
        this.initHaveList(false, true)
      } else {
        this.initOtherHaveList(otherAccountID, true)
      }

    } else {
      if (isSelf) {
        this.initHaveSquareList(true, false)
      } else {}

    }
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
  backLastPage(e) {
    wx.navigateBack({
      delta: 1
    })
  },
  addCard(e) {
    if (this.data.create_card_opacity == 0.4) {
      let _this = this
      _this.setData({
        create_card_opacity: 1
      })
      setTimeout(function (e) {
        _this.setData({
          create_card_opacity: 0.4
        })
      }, 2500)
    }
    wx.navigateTo({
      url: '../add_card/add_card'
    })
  },
  backList(e) {
    this.setData({
      show_mask: false,
      show_sold_toast: false
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
  initCreatedList(showToast) {
    if (this.data.now_key == 'one') {
      if (isGettingCardList) {
        return
      }
      isGettingCardList = true
    }
    let userInfo = wx.getStorageSync('userInfo')
    let _this = this
    wx.request({
      url: prefix+'' + userInfo.account_id + '/created_card_list?page_num=' + createPageNum, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        //隐藏loading 提示框
        // wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
        isGettingCardList = false
        createPageNum++
        console.log(res)
        let newList = res.data.data

        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width

          newList[i].images[0].image_zoom = 100
          if (newList[i].images[0].vertical) {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          } else {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          }
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)

        }

        if (_this.data.now_key == 'one') {
          if (newList.length == 0) {

            if (showToast) {
              if (_this.data.change_show) {
                wx.showToast({
                  title: '暂时只有这些卡片哦~',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '暂时只有这些碎片哦~',
                  icon: 'none'
                })
              }

            }
            createListFirstRequest = true
            return
          }
          if (createPageNum == 1) {
            created_card_list = newList
            wx.lin.renderWaterFlow([], true);
            setTimeout(function () {
              wx.lin.renderWaterFlow(newList, true);
            }, 100)
          } else {
            created_card_list = created_card_list.concat(newList)
            wx.lin.renderWaterFlow(newList, false);
          }

        } else {
          if (createPageNum == 1) {
            created_card_list = newList
          } else {
            created_card_list = created_card_list.concat(newList)
          }
        }
        createListFirstRequest = true
        _this.setData({
          show_top_loading: false
        })
      }
    })
  },
  initWantList(showToast) {
    if (this.data.now_key == 'two') {
      if (isGettingCardList) {
        return
      }
      isGettingCardList = true
    }
    let userInfo = wx.getStorageSync('userInfo')
    let _this = this
    wx.request({
      url: prefix+'' + userInfo.account_id + '/want_card_list?page_num=' + wantPageNum, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        //隐藏loading 提示框
        // wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
        isGettingCardList = false
        wantPageNum++
        console.log(res)
        let newList = res.data.data

        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width

          newList[i].images[0].image_zoom = 100
          if (newList[i].images[0].vertical) {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          } else {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          }
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)

        }

        if (_this.data.now_key == 'two') {
          if (newList.length == 0) {
            if (showToast) {
              if (_this.data.change_show) {
                wx.showToast({
                  title: '暂时只有这些卡片哦~',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '暂时只有这些碎片哦~',
                  icon: 'none'
                })
              }

            }
            wantListFirstRequest = true
            return
          }
          if (wantPageNum == 1) {
            want_card_list = newList
            wx.lin.renderWaterFlow([], true);
            setTimeout(function () {
              wx.lin.renderWaterFlow(newList, true);
            }, 100)
          } else {
            want_card_list = want_card_list.concat(newList)
            wx.lin.renderWaterFlow(newList, false);
          }

        } else {
          if (wantPageNum == 1) {
            want_card_list = newList
          } else {
            want_card_list = want_card_list.concat(newList)
          }
        }
        wantListFirstRequest = true
        _this.setData({
          show_top_loading: false
        })

      }
    })
  },
  initHaveList(sell, showToast) {
    if (this.data.now_key == 'three') {
      if (isGettingCardList) {
        return
      }
      isGettingCardList = true
    }
    let userInfo = wx.getStorageSync('userInfo')
    let _this = this
    wx.request({
      url: prefix+'' + userInfo.account_id + '/have_card_list?page_num=' + havePageNum, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        //隐藏loading 提示框
        // wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();

        havePageNum++
        let newList = res.data.data

        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width

          newList[i].images[0].image_zoom = 100
          if (newList[i].images[0].vertical) {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          } else {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          }
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)

        }
        isGettingCardList = false

        if (_this.data.now_key == 'three') {

          if (newList.length == 0) {
            if (sell) {
              wx.lin.renderWaterFlow([], true);
              have_card_list = []
            }
            if (have_card_list.length <= 0) {
              let content = '还未拥有碎片哦，快去集碎片吧~'
              if (_this.data.change_show) {
                content = '还未拥有卡片哦，快去集卡片吧~'
              }
              _this.setData({
                not_have_card: true,
                no_data_content: content,
                not_have_card_icon: '/pages/images/have_card_zero.png'

              })
            }
            if (showToast) {
              if (_this.data.change_show) {
                if (!_this.data.show_sold_toast) {
                  wx.showToast({
                    title: '暂时只有这些卡片哦~',
                    icon: 'none'
                  })
                }

              } else {
                if (!_this.data.show_sold_toast) {
                  wx.showToast({
                    title: '暂时只有这些碎片哦~',
                    icon: 'none'
                  })
                }

              }

            }
            haveListFirstRequest = true
            return
          }
          if (havePageNum == 1) {
            have_card_list = newList
            wx.lin.renderWaterFlow([], true);
            setTimeout(function () {
              wx.lin.renderWaterFlow(newList, true);
              if (newAccountSell) {
                for (let i = 0; i < newList.length; i++) {
                  if (newList[i].card_id == 804) {
                    _this.autoSellNewAccountCard(newList[i])
                    break
                  }
                }
              }

            }, 100)
          } else {
            have_card_list = have_card_list.concat(newList)
            wx.lin.renderWaterFlow(newList, false);
          }

        } else {
          if (havePageNum == 1) {
            have_card_list = newList
          } else {
            have_card_list = have_card_list.concat(newList)
          }
        }
        haveListFirstRequest = true
        _this.setData({
          show_top_loading: false,
        })

      }
    })
  },
  initHaveSquareList(showToast, jumpToThis) {
    if (this.data.now_key == 'four') {
      if (isGettingCardList) {
        return
      }
      isGettingCardList = true
    }
    let userInfo = wx.getStorageSync('userInfo')
    let _this = this
    wx.request({
      url: prefix+'' + userInfo.account_id + '/have_square_list?page_num=' + squarePageNum, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        //隐藏loading 提示框
        // wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();

        squarePageNum++
        let newList = res.data.data
        if (jumpToThis) {
          now_tab = 'four'
          _this.setData({
            now_key: 'four'
          })
        }
        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width

          newList[i].images[0].image_zoom = 100
          if (newList[i].images[0].vertical) {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          } else {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          }
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)

        }
        isGettingCardList = false

        if (_this.data.now_key == 'four') {

          if (newList.length == 0) {

            if (square_card_list.length <= 0) {
              let content = '还没有属于您的宇宙地盘，点击购买~'
              if (_this.data.change_show) {
                content = '还未拥有卡片哦，快去集卡片吧~'
              }
              _this.setData({
                not_have_card: true,
                no_data_content: content,
                not_have_card_icon: '/pages/images/have_square_zero.png'

              })
            }
            if (showToast) {
              if (_this.data.change_show) {
                if (!_this.data.show_sold_toast) {
                  wx.showToast({
                    title: '暂时只有这些卡片哦~',
                    icon: 'none'
                  })
                }

              } else {
                if (!_this.data.show_sold_toast) {
                  wx.showToast({
                    title: '暂时只有这些碎片哦~',
                    icon: 'none'
                  })
                }

              }

            }
            _this.setData({
              loading: false
            })
            squareListFirstRequest = true
            return
          }
          if (squarePageNum == 1) {
            square_card_list = newList
            wx.lin.renderWaterFlow([], true);
            setTimeout(function () {
              wx.lin.renderWaterFlow(newList, true);
            }, 100)
          } else {
            square_card_list = square_card_list.concat(newList)
            wx.lin.renderWaterFlow(newList, false);
          }

        } else {
          if (squarePageNum == 1) {
            square_card_list = newList
          } else {
            square_card_list = square_card_list.concat(newList)
          }
        }
        squareListFirstRequest = true
        _this.setData({
          show_top_loading: false,
          loading: false
        })

      }
    })
  },
  autoSellNewAccountCard(item) {
    this.sellMultCards()
    newAccountSellPassToast = true
    let e = {
      detail: {
        currentTarget: {
          dataset: {}
        }
      }
    }
    e.detail.currentTarget.dataset.item = item
    let _this = this
    setTimeout(function () {
      _this.clikcListItem(e)
    }, 500)

  },
  getOtherAccountInfo(accountID) {

    let _this = this
    wx.request({
      url: prefix+'' + accountID + '/account_info', //仅为示例，并非真实的接口地址
      method: 'GET',
      header: {
        'wy-platform': 'mini_programe' // 默认值
      },
      success(res) {
        _this.setData({
          account_name: res.data.data.account_name,
          icon_url: res.data.data.account_icon,
          weiyu_id: res.data.data.weiyu_id,
          log_in: true,
          account_info: res.data.data
        });
      }
    })
  },
  initOtherCreateList(e, first, showToast) {
    if (this.data.now_key == 'one') {
      if (isGettingCardList) {
        return
      }
      isGettingCardList = true
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
      url: prefix+'' + e + '/created_card_list?page_num=' + createPageNum, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        //隐藏loading 提示框
        // wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
        isGettingCardList = false
        createPageNum++
        console.log(res)
        let newList = res.data.data

        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width

          newList[i].images[0].image_zoom = 100
          if (newList[i].images[0].vertical) {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          } else {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          }
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)

        }

        if (_this.data.now_key == 'one') {
          if (newList.length == 0) {
            if (first) {
              _this.setData({
                now_key: 'three'
              })
              return
            }
            if (showToast) {
              if (_this.data.change_show) {
                wx.showToast({
                  title: '暂时只有这些卡片哦~',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '暂时只有这些碎片哦~',
                  icon: 'none'
                })
              }

            }

            return
          }
          if (createPageNum == 1) {
            created_card_list = newList
            wx.lin.renderWaterFlow([], true);
            setTimeout(function () {
              wx.lin.renderWaterFlow(newList, true);
            }, 100)
          } else {
            created_card_list = created_card_list.concat(newList)
            wx.lin.renderWaterFlow(newList, false);
          }

        } else {
          if (createPageNum == 1) {
            created_card_list = newList
          } else {
            created_card_list = created_card_list.concat(newList)
          }
        }
        _this.setData({
          show_top_loading: false
        })
      }
    })
  },
  initOtherWantList(e, showToast) {
    if (this.data.now_key == 'two') {
      if (isGettingCardList) {
        return
      }
      isGettingCardList = true
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
      url: prefix+'' + e + '/want_card_list?page_num=' + wantPageNum, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        //隐藏loading 提示框
        // wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
        isGettingCardList = false
        wantPageNum++
        console.log(res)
        let newList = res.data.data

        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width

          newList[i].images[0].image_zoom = 100
          if (newList[i].images[0].vertical) {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          } else {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          }
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)

        }

        if (_this.data.now_key == 'two') {
          if (newList.length == 0) {
            if (showToast) {
              if (_this.data.change_show) {
                wx.showToast({
                  title: '暂时只有这些卡片哦~',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '暂时只有这些碎片哦~',
                  icon: 'none'
                })
              }
            }

            return
          }
          if (wantPageNum == 1) {
            want_card_list = newList
            wx.lin.renderWaterFlow([], true);
            setTimeout(function () {
              wx.lin.renderWaterFlow(newList, true);
            }, 100)
          } else {
            want_card_list = want_card_list.concat(newList)
            wx.lin.renderWaterFlow(newList, false);
          }

        } else {
          if (wantPageNum == 1) {
            want_card_list = newList
          } else {
            want_card_list = want_card_list.concat(newList)
          }
        }
        _this.setData({
          show_top_loading: false
        })

      }
    })
  },
  initOtherHaveList(e, showToast) {
    if (this.data.now_key == 'three') {
      if (isGettingCardList) {
        return
      }
      isGettingCardList = true
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
      url: prefix+'' + e + '/have_card_list?page_num=' + havePageNum, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: header,
      success(res) {
        //隐藏loading 提示框
        // wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
        isGettingCardList = false
        havePageNum++
        console.log(res)
        let newList = res.data.data

        for (let i = 0; i < newList.length; i++) {
          newList[i].ratio = newList[i].images[0].height / newList[i].images[0].width

          newList[i].images[0].image_zoom = 100
          if (newList[i].images[0].vertical) {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          } else {
            if (newList[i].images[0].width > 400) {
              newList[i].images[0].image_zoom = parseInt((400 / newList[i].images[0].width) * 100)
            }
          }
          newList[i] = ctx_urils.changeCardInfo(newList[i], app.globalData.ctx)

        }

        if (_this.data.now_key == 'three') {
          if (newList.length == 0) {
            if (showToast) {
              if (_this.data.change_show) {
                wx.showToast({
                  title: '暂时只有这些卡片哦~',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '暂时只有这些碎片哦~',
                  icon: 'none'
                })
              }
            }
            _this.setData({
              loading: false
            })
            return
          }
          if (havePageNum == 1) {
            have_card_list = newList
            wx.lin.renderWaterFlow([], true);
            setTimeout(function () {
              wx.lin.renderWaterFlow(newList, true);
            }, 100)
          } else {
            have_card_list = have_card_list.concat(newList)
            wx.lin.renderWaterFlow(newList, false);
          }

        } else {
          if (havePageNum == 1) {
            have_card_list = newList
          } else {
            have_card_list = have_card_list.concat(newList)
          }
        }
        _this.setData({
          show_top_loading: false,
          loading: false
        })

      }
    })
  },
  toSetting(e) {
    wx.navigateTo({
      url: '../setting/setting'
    })
  },
  toCreateCard(e) {
    if (this.data.now_key == 'one' && !otherAccount) {
      wx.navigateTo({
        url: '../add_card/add_card'
      })
    } else if (this.data.now_key == 'four' && !otherAccount) {
      wx.navigateTo({
        url: '/pages/map/map?lat=' + (-1.0) + '&lng=' + (-1.0) + '&cpoint=' + 0 + '&card_id=' + (-1)
      })
    }
  },
  getAccountInfo() {

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
      url: prefix+'account_info?last_time=' + time, //仅为示例，并非真实的接口地址
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
          account_info: accountInof
        });

      }
    })
  },
  toBagePage(e) {
    console.log(e)
    let badgeInof = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../badge_card/badge_card?badge_id=' + badgeInof.id
    })
  },
  sellMultCards() {
    this.setData({
      sell_mult_card: true
    })
    let _this = this
    this.selectComponent('#show_list').startSell();
    clearInterval(multInternal)
    multInternal = setInterval(function () {
      _this.selectComponent('#show_list').startSell();

    }, 1000)
  },
  cancelSellCard() {
    clearInterval(multInternal)
    this.setData({
      sell_mult_card: false,
      sell_card_num: 0,
      sell_card_cp: 0
    })
    sellList = []
    this.selectComponent('#show_list').cancelSell();
  },
  sellCard() {
    if (sellList.length == 0) {
      if (this.data.change_show) {
        wx.showToast({
          title: '请选择要出售的卡片',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '请选择要出售的宇宙碎片',
          icon: 'none'
        })
      }

      return
    }
    if (newAccountSellPassToast) {
      this.affirmToSellCard()
      return
    }
    this.setData({
      show_sell_toast: true
    })

  },
  affirmToSellCard() {
    let _this = this
    newAccountSellPassToast = false
    request.sellMultCard(sellList, function (res) {
      if (res.result == 0) {
        let newAccountSold = false
        for (let i = 0; i < sellList.length; i++) {
          if (sellList[i] == 804) {
            newAccountSold = true
            break
          }
        }
        if (!newAccountSold) {
          wx.showToast({
            title: '成功售出' + _this.data.sell_card_num + '块碎片，获得' + _this.data.sell_card_cp + 'CP',
            icon: 'none',
            duration: 2500
          })
        }
        _this.setData({
          show_sell_toast: false
        })
        _this.cancelSellCard()
        _this.getAccountInfo()
        havePageNum = 0
        if (newAccountSold) {
          _this.setData({
            show_sold_toast: true
          })
        }
        _this.initHaveList(true, true)
        clearInterval(multInternal)





      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    })
  },
  cancelToSellCard() {
    this.setData({
      show_sell_toast: false
    })
  },
  listenViewHeight(e) {
    if (e == undefined) {
      return
    }
    let height = e.detail.scrollTop + windowHeight - 18
    let totalHeight = e.detail.scrollHeight
    if (height >= totalHeight * 0.9 && height <= totalHeight * 0.95) {
      if (now_tab == 'one') {
        this.getCardList(false, false)
      } else if (now_tab == 'two') {
        this.getWantCardList(false, false)
      } else {
        this.getHaveCardList(false, false)
      }
    }

  },
  updateList() {
    if (this.data.now_key == 'one') {
      if (isSelf) {
        this.initCreatedList(false)
      } else {
        this.initOtherCreateList(otherAccountID, false, false)
      }
    } else if (this.data.now_key == 'two') {
      if (isSelf) {
        this.initWantList(false)
      } else {
        this.initOtherWantList(otherAccountID, false)
      }
    } else if (this.data.now_key == 'three') {
      if (isSelf) {
        this.initHaveList(false, false)
      } else {
        this.initOtherHaveList(otherAccountID, false)
      }

    } else {
      if (isSelf) {
        this.initHaveSquareList(false, false)
      } else {}

    }
  },
  toMap() {
    // this.showToast('按键我过军偶过过军奥无过军偶过军过军军过军够过军偶过军过军偶过军奥我偶偶偶',5000)
    wx.navigateTo({
      url: '/pages/map/map?buy_refresh=true&lat=' + (-1.0) + '&lng=' + (-1.0) + '&cpoint=' + 0 + '&card_id=' + (-1)
    })
    this.setData({
      show_sold_toast: false
    })
    // wx.navigateTo({
    //   url: '../handbook/handbook'
    // })
  },
  showSelfSellToast() {
    this.showToast("自己创造的碎片至多售出3块\n剩余碎片可以继续持有或交换", 2000)
  },
  showToast(content, duration) {
    this.setData({
      show_toast: true,
      toast_content: content,
      toast_duration: duration
    })
  },
  updateExistItem() {
    if (this.data.update_item != '') {
      let newItem = this.data.update_item
      for (let i = 0; i < want_card_list.length; i++) {
        if (want_card_list[i].card_id == newItem.card_id) {
          want_card_list[i] = newItem
          break
        }
      }
      for (let i = 0; i < created_card_list.length; i++) {
        if (created_card_list[i].card_id == newItem.card_id) {
          created_card_list[i] = newItem
          break
        }
      }
      for (let i = 0; i < have_card_list.length; i++) {
        if (have_card_list[i].card_id == newItem.card_id) {
          have_card_list[i] = newItem
          break
        }
      }

      for (let i = 0; i < square_card_list.length; i++) {
        if (square_card_list[i].card_id == newItem.card_id) {
          square_card_list[i] = newItem
          break
        }
      }

      this.selectComponent("#show_list").updateExistItem(newItem)
      this.setData({
        update_item: ''
      })
    }

  },
  updateLikeCard(e) {
    let newItem = e.detail.detail
    for (let i = 0; i < want_card_list.length; i++) {
      if (want_card_list[i].card_id == newItem.card_id) {
        want_card_list[i] = newItem
        break
      }
    }
    for (let i = 0; i < created_card_list.length; i++) {
      if (created_card_list[i].card_id == newItem.card_id) {
        created_card_list[i] = newItem
        break
      }
    }
    for (let i = 0; i < have_card_list.length; i++) {
      if (have_card_list[i].card_id == newItem.card_id) {
        have_card_list[i] = newItem
        break
      }
    }

    for (let i = 0; i < square_card_list.length; i++) {
      if (square_card_list[i].card_id == newItem.card_id) {
        square_card_list[i] = newItem
        break
      }
    }
  }
})