// pages/form/pages/image-picker/index.js
let resultImage = [];
let titeltString = '';
let contentString = '';
let place = ''
var QQMapWX = require('../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
let isExchagenVerification = false
let phone = ''
var fsm = wx.getFileSystemManager()
let default_list = []
// 创建离屏 2D canvas 实例
let isVerifyCard = false

var COS = require("../common/cos/cos.js");

let clickkSlide = false
let clickSlideTimer = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    first_selected: true,
    selected_img: false,
    showPop: false,
    selected_video: false,
    play_video: false,
    show_son_page: false,
    top_bar_color: "#FFFFFF",
    top_bar_font_color: "#000000",
    selected_place: false,
    show_content: true,
    title_value: '',
    content_value: '',
    places: [],
    place_name: "添加地点",
    place_name_color: '#000000',
    place_name_icon: '/pages/images/location3.png',
    gotCardValue: false,
    min: 1, // 最小限制 
    max: 999, // 最大限制
    value: 500, // 当前value
    isCreating: false,
    value2: '',
    arr: [

    ],
    platform: getApp().globalData.platform

  },
  clear() {
    this.setData({
      clear: true
    });
  },
  onClearTap(e) {
    if (e.detail) {
      wx.lin.showToast({
        title: '清除图片成功',
        icon: 'success',
        duration: 2000,
        iconStyle: 'color:#7ec699; size: 60'
      });
    }
  },
  onChangeTap(e) {
    const count = e.detail.current.length;
    wx.lin.showToast({
      title: `添加${count}块图片~`,
      icon: 'picture',
      duration: 2000,
      iconStyle: 'color:#7ec699; size: 60'
    });
  },
  onRemoveTap(e) {
    const index = e.detail.index;
    wx.lin.showMessage({
      type: 'error',
      content: `删除下标为${index}图片~`,
      duration: 1500,
      icon: 'warning'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    this.setData({
      change_show: wx.getStorageSync('change_show')
    })

    this.setData({
      change_show: wx.getStorageSync('change_show')
    })

    isVerifyCard = false
    if (option.is_exchagen_verification != undefined) {
      isExchagenVerification = true
    }
    qqmapsdk = new QQMapWX({
      key: '5YIBZ-ODW64-2MDU5-DZZTO-NMNCO-SYFJN'
    });

    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      let bottomInfo = {
        show: true,
        min: userInfo.create_card_min,
        max: userInfo.create_card_max
      }
      this.setData({
        account_info: userInfo,
        bottom_info: bottomInfo
      })
    }

    this.setViewHeight()
    let _this = this
    qqmapsdk.search({
      keyword: '娱乐',
      auto_extend: 0,
      page_size: 20,
      rectangle: '39.849396,116.678096,39.859687,116.689092',
      location: {
        latitude: 39.856145,
        longitude: 116.683782
      },
      success: function (res) {
        // console.log(res);
        default_list = res.data
        _this.setData({
          places: res.data,
          no_data: false
        })


      },
      fail: function (res) {
        // console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
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
  firstSelecteMedia(e) {
    // console.log(e)
    this.setData({
      showPop: true
    })
  },

  firstSelectedVideo(e) {
    let _this = this
    this.setData({
      showPop: false
    })
    wx.chooseVideo({
      count: 1,
      compressed: false,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success(res) {
        console.log(res)
        if (res.tempFilePath.length > 0) {
          let video = res
          if (video.duration > 180) {
            wx.showToast({
              title: '视频过长,请选择小于180s的视频',
              icon: 'none',
              duration: 2500
            })
            return
          }
          resultImage = []

          let originWidth = video.width;
          let originHeight = video.height;
          // let resultWidth = 0;
          // let resultHeight = 0;
          // let maxWidth = 200;
          // let maxHeight = 200;
          // if (originHeight > originWidth) {
          //   resultHeight = maxHeight;
          //   resultWidth = resultHeight * (originWidth / originHeight)
          // } else {
          //   resultWidth = maxWidth
          //   resultHeight = resultWidth * (originHeight / originWidth)
          // }

          let resultWidth = 0;
          let resultHeight = 0;
          let ratio = originHeight / originWidth
          if (ratio >= 1.333) {
            resultWidth = 150
            resultHeight = resultWidth * 1.33
          } else if (ratio <= 0.75) {
            resultWidth = 200
            resultHeight = resultWidth * 0.75
          } else if (ratio >= 1) {
            resultWidth = 150
            resultHeight = resultWidth * ratio
          } else if (ratio < 1) {
            resultWidth = 200
            resultHeight = resultWidth * ratio
          }

          resultImage.push({
            image_url: "",
            video_url: "",
            type: 'video',
            width: video.width,
            height: video.height,
            origin_url: video.tempFilePath,
            end_upload: false,
            duration: video.duration
          })
          _this.setData({
            selected_video: true,
            video_temp: video.tempFilePath,
            video_width: resultWidth,
            video_height: resultHeight,
            first_selected: false,
            selected_img: false
          })

          if (video.size < 5242880) {
            let filname = 'card_' + Date.now() + Math.floor(Math.random() * 1000)
            let imgUrl = filname + '_temp_0.jpg'

            COS.uploadCardVideoFile(filname + '.mp4', video.tempFilePath, function (res) {

              console.log("????2")
              console.log(res);
              if (resultImage.length <= 0) {
                return
              }
              if (resultImage[0].type != 'video') {
                return
              }
              if (resultImage[0].origin_url != video.tempFilePath) {
                return
              }
              resultImage[0].image_url = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/' + imgUrl
              resultImage[0].video_url = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/' + filname + '.mp4'
              resultImage[0].end_upload = true
            })

          } else {
            let resolution = 1
            let bitrate = 4500
            if (video.size > 5242880 && video.size < 10242880) {
              resolution = 0.8
            } else {
              bitrate = 1500
              resolution = 0.55
            }
            wx.compressVideo({
              src: video.tempFilePath,
              // quality: 'high',
              resolution: resolution,
              fps: 30,
              bitrate: bitrate,
              success(compress) {
                console.log(compress)
                if (resultImage.length <= 0) {
                  return
                }
                if (resultImage[0].type != 'video') {
                  return
                }
                if (resultImage[0].origin_url != video.tempFilePath) {
                  return
                }
                let filname = 'card_' + Date.now() + Math.floor(Math.random() * 1000)
                let imgUrl = filname + '_temp_0.jpg'


                COS.uploadCardVideoFile(filname + '.mp4', compress.tempFilePath, function (res) {
                  console.log("????2")
                  if (resultImage.length <= 0) {
                    return
                  }
                  if (resultImage[0].type != 'video') {
                    return
                  }
                  if (resultImage[0].origin_url != video.tempFilePath) {
                    return
                  }
                  resultImage[0].image_url = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/' + imgUrl
                  resultImage[0].video_url = 'https://weiyu-bulletin-picture-1258021264.cos.ap-beijing.myqcloud.com/' + filname + '.mp4'
                  resultImage[0].end_upload = true
                })
              },
              fail(ress) {
                console.log(ress)
              }
            })
          }

        }
      }
    })
  },
  firstSelectedImg(e) {
    let _this = this
    this.setData({
      showPop: false
    })
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        let images = []
        resultImage = []
        if (res.tempFiles.length > 0) {
          for (let i = 0; i < res.tempFiles.length; i++) {
            var fsm = wx.getFileSystemManager()
            let imageItem = {
              width: 0,
              height: 0,
              image_url: fsm.readFileSync(res.tempFiles[i].path, 'base64'),
              type: 'img',
              video_url: ' ',
              origin_url: res.tempFiles[i].path
            }
            resultImage.push(imageItem)

            wx.getImageInfo({
              src: res.tempFiles[i].path,
              success: function (res2) {
                resultImage[i].width = res2.width
                resultImage[i].height = res2.height
              }
            })

            images.push(res.tempFiles[i].path)
          }
          _this.setData({
            arr: images,
            first_selected: false,
            selected_img: true
          })
        }
      }
    })
  },
  cancelFirstSelected(e) {
    this.setData({
      showPop: false
    })
  },
  onRemoveTap(e) {
    console.log(e)
    let index = e.detail.index
    resultImage.splice(index, 1)

    let images = []
    for (let i = 0; i < resultImage.length; i++) {
      images.push(resultImage[i].origin_url)
    }

    if (resultImage.length == 0) {
      this.setData({
        arr: [],
        first_selected: true,
        selected_img: false
      })
      return
    }
    this.setData({
      arr: images
    })
  },
  onAddTap(e) {
    console.log(e)

    let list = e.detail.current
    let images = this.data.arr
    for (let i = 0; i < list.length; i++) {
      wx.getImageInfo({
        src: list[i],
        success: function (res2) {
          var fsm = wx.getFileSystemManager()
          let imageItem = {
            width: res2.width,
            height: res2.height,
            image_url: fsm.readFileSync(list[i], 'base64'),
            type: 'img',
            video_url: ' ',
            origin_url: list[i]
          }
          resultImage.push(imageItem)
          console.log(resultImage)
        }
      })
      images.push(list[i])
    }

    this.setData({
      arr: images
    })
  },
  cancelVideo(e) {
    resultImage = []
    this.setData({
      selected_video: false,
      video_temp: '',
      first_selected: true,
      selected_img: false
    })
  },
  placeVideo(e) {
    this.setData({
      play_video: true,
      video_url: resultImage[0].origin_url,
      top_bar_color: "#000000",
      top_bar_font_color: "#FFFFFF",
      show_content: false
    })
  },
  sonPageBack(e) {
    this.setData({
      play_video: false,
      video_url: '',
      top_bar_color: "#FFFFFF",
      top_bar_font_color: "#000000",
      selected_place: false,
      show_content: true,
      title_value: titeltString,
      content_value: contentString
    })
  },
  searchPlace(e) {

    this.setData({
      selected_place: true,
      show_content: false,
      places: default_list,
      no_data: false,
      toast_icon: '/pages/images/search_icon.png',
      toast_content: '快输入关键词来搜索地点吧'
    })
  },
  searchPlaceByKey(e) {
    let _this = this
    // console.log(e);
    if (e.detail.value == "") {
      this.setData({
        places: default_list,
        no_data: false,
        toast_icon: '/pages/images/search_icon.png',
        toast_content: '快输入关键词来搜索地点吧'
      })
    }

    wx.getSetting({
      success(res) {
        console.log('相册权限')
        console.log(res.authSetting)
        var authMap = res.authSetting;
        if (authMap['scope.userLocation']) {
          qqmapsdk.search({
            keyword: e.detail.value,
            auto_extend: 0,
            page_size: 20,
            auto_extend: 1,
            region: "北京",
            success: function (res) {
              console.log(res);
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
              console.log(res);
            },
            complete: function (res) {
              // console.log(res);
            }
          });
        } else {
          qqmapsdk.search({
            keyword: e.detail.value,
            auto_extend: 0,
            page_size: 20,
            auto_extend: 1,
            region: "北京",
            location: {
              latitude: 39.856145,
              longitude: 116.683782
            },
            success: function (res) {
              console.log(res);
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
              console.log(res);
            },
            complete: function (res) {
              // console.log(res);
            }
          });
        }
      }
    })


  },
  titleInput(e) {
    // console.log(e)
    titeltString = e.detail.value
  },
  contentInput(e) {
    // console.log(e)
    contentString = e.detail.value
  },
  placeAction(e) {
    // console.log(e)
    place = e.currentTarget.dataset.item
    this.setData({
      selected_place: false,
      show_content: true,
      place_name_color: '#33A3DE',
      place_name_icon: '/pages/images/location3_blue.png',
      place_name: e.currentTarget.dataset.item.title,
      title_value: titeltString,
      content_value: contentString,
      places: []
    })
  },
  noSelectedPlace() {
    place = ''
    this.setData({
      selected_place: false,
      show_content: true,
      place_name_color: '#000000',
      place_name_icon: '/pages/images/location3.png',
      place_name: '添加地点',
      title_value: titeltString,
      content_value: contentString,
      places: []
    })
  },
  saveCardToast(e) {
    this.setData({
      show_dialog: true
    })
  },
  sliderChangeing(e) {
    if (!this.data.gotCardValue) {
      this.setData({
        gotCardValue: true
      })
    }
    clickkSlide = true
    clearTimeout(clickSlideTimer)
    clickSlideTimer = setTimeout(function () {
      clickkSlide = false
    }, 400)
  },
  createCard(e) {

    if (this.isCreating) {
      return
    }
    // if (this.data.account_info.create_card_num <= 0) {
    //   wx.showToast({
    //     title: '已无[创造碎片]，无法创造新的碎片',
    //     icon: 'none'
    //   })
    //   return
    // }
    if (!this.data.gotCardValue) {
      if (this.data.change_show) {
        wx.showToast({
          title: '请先选择创造数量',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '请先选择首发价值',
          icon: 'none'
        })
      }

      return
    }
    if (isExchagenVerification) {
      this.setData({
        show_mask1: true
      })
      return
    }
    if (resultImage.length <= 0) {
      wx.showToast({
        title: '至少选择一个视频或图片',
        icon: 'none'
      })
      return
    }
    let _this = this
    if (resultImage[0].type == "video") {
      if (!resultImage[0].end_upload) {
        wx.showLoading({
          title: '上传中请稍候',
          mask: true
        })
        let a = setInterval(function () {
          if (resultImage[0].type == "video") {
            if (resultImage[0].end_upload) {
              clearInterval(a)
              wx.hideLoading()
              _this.createCardReq()
            }
          } else {
            clearInterval(a)
            wx.hideLoading()
          }

        }, 2000)
        return
      }
    }

    this.createCardReq()
  },
  createCardReq() {
    if (this.isCreating) {
      return
    }
    this.isCreating = true

    this.setData({
      show_loading: true,
      top_bar_color: "#4C4C4C",
      top_bar_font_color: "#FFFFFF",
    })
    let result = {
      "surplus_card_num": 400 - 100,
      "title": titeltString,
      "content": contentString,
      "place_id": 0,
      "place_name": "",
      "lat": 0.0,
      "lng": 0.0,
      "initial_cp": this.data.value,
      "images": resultImage,
      "is_verify_card": isVerifyCard
    }
    // console.log(place)
    if (place != '') {
      result.tecent_place_id = place.id;
      result.place_name = place.title;
      result.lat = place.location.lat;
      result.lng = place.location.lng;
    } else {
      result.place_name = '';
      result.tecent_place_id = '';
    }
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    let userInfo = wx.getStorageSync('userInfo')
    let _this = this
    wx.request({
      url: prefix + 'card', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: result,
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        // console.log(res)
        if (res.data.result == 0) {
          if (place != '') {
            let info = {
              create: true,
              lat: place.location.lat,
              lng: place.location.lng
            }
            wx.setStorageSync('haveCreatedCards', info)
          }

          resultImage = []
          titeltString = '';
          contentString = '';
          place = ''
          let pages = getCurrentPages();
          //获取所需页面
          let prevPage = pages[pages.length - 2]; //上一页
          res.data.data.assessing = true
          prevPage.setData({
            addData: res.data.data, //你需要传过去的数据
          });
          // _this.getTrueCard(res.data.data)
          _this.setData({
            show_loading: false,
            top_bar_color: "#FFFFFF",
            top_bar_font_color: "#000000",
          })
          setTimeout(function () {
            //获取页面栈

            wx.navigateBack({
              delta: 1
            })
          }, 500)
        } else {

          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }



        // product=res.data.data;
        // wx.lin.renderWaterFlow(res.data.data);
      }
    })
  },
  affirmToCreate() {
    if (phone.length < 11) {
      wx.showToast({
        title: '请输入完整手机号',
        icon: 'none'
      })
      return
    }
    let _this = this
    isExchagenVerification = false
    this.setData({
      show_mask1: false
    })
    setTimeout(function () {
      _this.createCard('')
    }, 300)
  },
  cancleExchange() {
    this.setData({
      show_mask1: false
    })
  },
  phoneInput(e) {
    console.log(e)
    phone = e.detail.detail.value
  },
  setViewHeight() {
    var SystemInfo = wx.getSystemInfoSync();
    // console.log(SystemInfo.windowWidth + '?????' + SystemInfo.windowHeight)
    let heightRpx = 750 * (SystemInfo.windowHeight / SystemInfo.windowWidth);
    // console.log(heightRpx)
    let mapHeight = heightRpx - 728
    let getCardHeight = heightRpx * 0.76
    if ((SystemInfo.windowWidth / SystemInfo.windowHeight) > 0.6) {
      getCardHeight = heightRpx * 0.85
    }
    this.setData({
      // map_height: mapHeight,
      window_height: heightRpx
    })
  },
  backLastPage(e) {
    wx.navigateBack({
      delta: 1
    })
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
    let prefix = ''
    if (__wxConfig.envVersion == 'develop') {
      prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
    } else {
      prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
    }
    wx.request({
      url: prefix + 'true_card', //仅为示例，并非真实的接口地址
      method: 'POST',
      header: header,
      data: reqData,
      success(res) {
        _this.setData({
          show_loading: false,
          top_bar_color: "#FFFFFF",
          top_bar_font_color: "#000000",
        })

        // wx.showToast({
        //   title: '碎片创建成功',
        //   icon: 'none',
        //   duration: 2000
        // })



        setTimeout(function () {
          //获取页面栈

          wx.navigateBack({
            delta: 1
          })
        }, 500)
      }
    })

  },
  showChooseVideoType() {
    this.setData({
      showSelectVideoPop: true,
      showPop: false
    })
  },
  cancelChooseVideoType() {
    this.setData({
      showSelectVideoPop: false
    })
  },
  editVideo(e) {
    console.log("跳转到编辑页面")
    console.log(resultImage[0])
    let data = JSON.stringify(resultImage[0])
    wx.navigateTo({
      url: '../../packageA/pages/clipe_medio/clipe_medio?video=' + data
    })
  },
  verifyCardSwitch(e) {
    if (e.detail.checked) {
      isVerifyCard = true
    } else {
      isVerifyCard = false
    }
  },
  cardCPInputBlur(e) {
    let _this = this
    setTimeout(function () {
      if (clickkSlide) {
        return
      }
      if (e.detail.value == '') {
        _this.setData({
          gotCardValue: false,
          value: 500
        })
        return
      }
      if (_this.isNumber(e.detail.value)) {
        let a = parseInt(e.detail.value)
        if (a <= 0 || a > 999) {
          _this.setData({
            gotCardValue: false,
            value: 500
          })
          wx.showToast({
            title: '请输入1-999的正整数',
            icon: 'none',
            duration: 2500
          })
          return
        }

        _this.setData({
          gotCardValue: true,
          value: a
        })
      } else {
        _this.setData({
          gotCardValue: false,
          value: 500
        })
        wx.showToast({
          title: '请输入1-999的正整数',
          icon: 'none',
          duration: 2500
        })
        return
      }
    }, 200)


  },
  isNumber(val) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    // var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val)) {
      return true;
    } else {
      return false;
    }
  }
});