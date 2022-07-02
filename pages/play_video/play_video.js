// pages/play_video/play_video.js
var request = require('../common/request.js');

const app = getApp()
let totalComments = []
let commentNum = 12
let nowClickType = 1
let commentType = "main"
let mainComment = ''
let shareID = ''
let createShareImageResolve = ''
let shareInfo = {
  image_url: '',
  is_share: false,
  share_type: 0
};
let prefix = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuButtonToTop: getApp().globalData.menuButtonToTop,
    menuButtonHeight: getApp().globalData.menuButtonHeight,
    window_height: 0,
    want_btn_url: '/pages/images/heart_btn_white.png',
    star_btn_url: '/pages/images/start_btn_white.png',
    video_playing: true,
    showComtBox: false,
    video_muted_icon: '/pages/images/unmute.png',
    video_muted: false,
    show_comment: false,
    totalCommentNum: 0
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
    var obj = app.globalData.card_info;
    let videoRadio = obj.images[0].height / obj.images[0].width
    this.setViewHeight(videoRadio)
    this.initCommentData(obj)
    this.getWindowData();
    this.setData({
      data: obj
    })
    this.initData(obj)
    app.setWatcher(this);

    wx.createSelectorQuery()
      .select('#canvas')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
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
    if (wx.getStorageSync('mute')) {
      this.setData({
        video_muted_icon: '/pages/images/mute.png',
        video_muted: true,
      })
    } else {
      this.setData({
        video_muted_icon: '/pages/images/unmute.png',
        video_muted: false,
      })
    }
    if (shareInfo.is_share) {
      shareInfo.is_share = false
      this.setData({
        show_bottom_pop: false
      })
      if (shareInfo.share_type == 0) {
        wx.showToast({
          title: '分享成功，好友注册后集碎片次数+1',
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
  onShareAppMessage: function (e) {
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

      if (cardInfo.card_type == 'SSR' || cardInfo.card_type == 'SR') {
        if (contentString.length > 0) {
          if (contentString.length > 8) {
            content = '[' + cardInfo.title.substr(0, 8) + '...' + ']' + '价值' + cardInfo.card_cpoint + ' 可兑换黄油啤酒' + getPercent + '%杯'
          } else {
            content = '[' + cardInfo.title + ']' + '价值' + cardInfo.card_cpoint + ' 可兑换黄油啤酒' + getPercent + '%杯'
          }
        } else {
          content = '碎片' + '价值' + cardInfo.card_cpoint + ' 可兑换黄油啤酒' + getPercent + '%杯'
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
      }

      return {
        title: content,
        path: '/pages/card_detail/card_detail?card_id=' + this.data.data.card_id + "&share_id=" + shareID + '&share_type=' + shareInfo.share_type + '&share_account_id=' + userInfo.account_id,
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
  backLastPage(e) {
    wx.navigateBack({
      delta: 1
    })
  },
  setViewHeight(videoRadio) {

    var SystemInfo = wx.getSystemInfoSync();
    let heightRpx = 750 * (SystemInfo.windowHeight / SystemInfo.windowWidth);
    let radio = SystemInfo.windowHeight / SystemInfo.windowWidth
    let fill = ''
    if (videoRadio <= 1) {
      fill = false
    } else {
      let videoHeight = 750 * videoRadio;
      let judgeHeight = (0.9 * heightRpx - videoHeight) / 2

      if (judgeHeight < 0.1 * heightRpx) {
        fill = true
      } else {
        fill = false
      }
    }
    // let mapHeight = heightRpx - 728
    // let top = heightRpx * 0.10
    // maxTop = 3.78*this.data.acccount_icon_width*(SystemInfo.windowWidth/750)
    // maxTopPx = SystemInfo.windowHeight * 0.10
    // let getCardHeight = heightRpx * 0.76
    // let heighter = true
    // if ((SystemInfo.windowWidth / SystemInfo.windowHeight) >= 0.5) {
    //   console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    //   getCardHeight = heightRpx * 0.85
    //   heighter = false
    // }    
    this.setData({
      // map_height: mapHeight,
      // get_card_height: getCardHeight,
      // sticky_top: top,
      // view_heighter: heighter,
      window_height: heightRpx,
      video_fill: fill
    })
  },
  //单击tap或双击tap
  lastTapTime: 0, // 最后一次单击事件点击发生时间
  lastTapTimeoutFunc: null, // 单击事件点击后要触发的函数
  multipleTap: function (e) {
    let diffTouch = this.touchEndTime - this.touchStartTime;
    let curTime = e.timeStamp;
    let lastTime = this.lastTapDiffTime;
    this.lastTapDiffTime = curTime;
    let _this = this
    //两次点击间隔小于300ms, 认为是双击
    let diff = curTime - lastTime;
    if (diff < 300) {
      console.log("double tap")
      clearTimeout(this.lastTapTimeoutFunc); // 成功触发双击事件时，取消单击事件的执行
      this.wantBtn(e)
    } else {
      // 单击事件延时300毫秒执行，这和最初的浏览器的点击300ms延时有点像。
      this.lastTapTimeoutFunc = setTimeout(function () {
        console.log("single tap")
        _this.playVideo()
      }, 300);
    }
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
        heart_btn_url: '/pages/images/heart_btn_white.png',
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
        star_btn_url: '/pages/images/start_btn_white.png',
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
  playVideo(e) {
    let videoCtx = wx.createVideoContext('myVideo', this)
    if (this.data.video_playing) {
      videoCtx.pause()
      this.setData({
        video_playing: false
      })
    } else {
      videoCtx.play()
      this.setData({
        video_playing: true
      })
    }
  },
  showAllComment() {
    this.setData({
      show_comment: true
    })
  },
  showComtBox() {
    commentType = "main"
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
    console.log(e)
    let {
      windowHeight
    } = this.data
    let keyboard_h = e.detail.height
    let ctInput_top = windowHeight - keyboard_h
    let ctInput_h = await app.queryNodes('#ctInput', 'height')
    console.log(ctInput_h)
    ctInput_top -= ctInput_h
    this.setData({
      ctInput_top: ctInput_top
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
  initCommentData(obj) {
    let _this = this

    let header = {
      'wy-platform': 'mini_programe', // 默认值
    }
    if (wx.getStorageSync('login') != '') {
      let userInfo = wx.getStorageSync('userInfo')
      header.Authorization = 'Bearer ' + userInfo.access_token
    }
    wx.request({
      url: prefix + '' + obj.card_id + '/all_comments', //仅为示例，并非真实的接口地址
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
    console.log(e)
    console.log(this.data.items)
    let userInfo = wx.getStorageSync('userInfo')
    console.log("????????????")
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
    wx.request({
      url: prefix + '' + this.data.data.card_id + '/comments', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: newComment,
      header: {
        'wy-platform': 'mini_programe', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        console.log("????????????????????????????????????????????")
        console.log(res)
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
          console.log("1111111111????????????????????????????????????????????")
          console.log(comment)
          commentss = commentss.concat(totalComments)

          totalComments = commentss
          console.log(totalComments)
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
  init(res) {
    let _this = this
    console.log(res)
    let beishu = 8
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    canvas.width = beishu * 250;
    canvas.height = beishu * 200
    if (_this.data.data.images[0].vertical) {
      this.createVerticalImage(ctx, canvas)
    } else {
      this.createHorizontalImage(ctx, canvas)
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
  createVerticalImage(ctx, canvas) {
    let _this = this
    let beishu = 8
    let left = beishu * 7
    let top = -(2 * beishu);
    let cardInfo = this.data.data
    _this.fillRoundRect(ctx, beishu * 148 + left, beishu * 97 + top, beishu * 75, beishu * 31, beishu * 5, '#858BC7')
    _this.fillRoundRect(ctx, beishu * 148 + left, beishu * 129 + top, beishu * 75, beishu * 31, beishu * 5, '#58B8B7')
    _this.fillRoundRect(ctx, beishu * 148 + left, beishu * 161 + top, beishu * 75, beishu * 31, beishu * 5, '#E5C383')

    _this.addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
    _this.fillRoundRect(ctx, beishu * 10 + left, beishu * 8 + top, beishu * 142, beishu * 190, beishu * 10, '#000000')
    _this.clearShadow(ctx)

    // console.log(ress.path)
    let seal = canvas.createImage();
    seal.src = cardInfo.images[0].image_url;
    seal.onload = () => {
      // ctx.drawImage(seal, 80, 940, 150, 150);
      _this.drawRoundImage(ctx, beishu * 11 + left, beishu * 9 + top, beishu * 140, beishu * 188, beishu * 10, seal, seal.width, seal.height)
      _this.fillRoundRect(ctx, beishu * 5 + left, beishu * 2 + top, beishu * 40, beishu * 20, beishu * 5, '#F46563')
      _this.drawWord(ctx, beishu * 25 + left, beishu * 13 + top, beishu * 13, "#FFFFFF", "热门")

      if (cardInfo.have_card_badge) {
        let badge = canvas.createImage();
        badge.src = this.data.data.card_badge_url;
        badge.onload = () => {
          ctx.drawImage(badge, beishu * 143 + left, beishu * 2 + top, beishu * 80, beishu * 80);
          setTimeout(function (e) {
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
          }, 500)
        }
      } else {
        setTimeout(function (e) {
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
        }, 500)
      }
    }

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
      ctx.drawImage(num, beishu * 154 + left, beishu * 100 + top, beishu * 25, beishu * 25);
    }
    if (this.data.data.card_type == 'FUNCATION') {
      let infinite = canvas.createImage();
      infinite.src = '/pages/images/infiniteness.png'
      infinite.onload = () => {
        // ctx.drawImage(infinite, beishu * 194 + left, beishu * 100 + top, beishu * 25, beishu * 25);
        ctx.drawImage(infinite, beishu * 180 + left, beishu * 95 + top, beishu * 35, beishu * 35);

      }
    } else {
      _this.drawWord(ctx, beishu * 197 + left, beishu * 114 + top, beishu * 12, "#FFFFFF", cardInfo.surplus_card_num + "/" + cardInfo.total_card_num)
    }

    let lv = canvas.createImage();
    lv.src = '/pages/images/c_info_lv.png';
    lv.onload = () => {
      ctx.drawImage(lv, beishu * 154 + left, beishu * 132 + top, beishu * 25, beishu * 25);
    }
    if (this.data.data.card_type == 'FUNCATION') {
      let infinite = canvas.createImage();
      infinite.src = '/pages/images/infiniteness.png'
      infinite.onload = () => {
        // ctx.drawImage(infinite, beishu * 194 + left, beishu * 132 + top, beishu * 25, beishu * 25);
        ctx.drawImage(infinite, beishu * 180 + left, beishu * 125 + top, beishu * 35, beishu * 35);
      }
    } else {
      _this.drawWord(ctx, beishu * 194 + left, beishu * 146 + top, beishu * 12, "#FFFFFF", cardInfo.card_lv)
    }

    let cp = canvas.createImage();
    cp.src = '/pages/images/c_info_point.png';
    cp.onload = () => {
      ctx.drawImage(cp, beishu * 156 + left, beishu * 167 + top, beishu * 20, beishu * 20);
    }
    if (this.data.data.card_type == 'FUNCATION') {
      let infinite = canvas.createImage();
      infinite.src = '/pages/images/infiniteness.png'
      infinite.onload = () => {
        ctx.drawImage(infinite, beishu * 180 + left, beishu * 158 + top, beishu * 35, beishu * 35);
      }
    } else {
      _this.drawWord(ctx, beishu * 194 + left, beishu * 179 + top, beishu * 12, "#FFFFFF", cardInfo.card_cpoint)
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
  createHorizontalImage(ctx, canvas) {
    let _this = this
    let beishu = 8
    let left = beishu * 7
    let top = -10;
    let width = (beishu * 212 - 120) / 3
    let cardInof = this.data.data
    _this.fillLeftBottomRoundRect(ctx, beishu * 18 + left, beishu * 169 + top, width, beishu * 31, beishu * 5, '#858BC7')
    _this.fillLeftBottomRoundRect(ctx, beishu * 18 + left + width, beishu * 169 + top, width, beishu * 31, 0, '#58B8B7')
    _this.fillRightBottomRoundRect(ctx, beishu * 18 + left + width * 2, beishu * 169 + top, width, beishu * 31, beishu * 5, '#E5C383')

    _this.addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
    _this.fillRoundRect(ctx, beishu * 10 + left, beishu * 8 + top, beishu * 214, beishu * 161, beishu * 10, '#000000')
    _this.clearShadow(ctx)

    let seal = canvas.createImage();
    seal.src = _this.data.data.images[0].image_url;
    seal.onload = () => {
      // ctx.drawImage(seal, 80, 940, 150, 150);

      _this.drawRoundImage(ctx, beishu * 11 + left, beishu * 9 + top, beishu * 212, beishu * 159, beishu * 10, seal, seal.width, seal.height)
      if (cardInof.hot_card) {
        _this.fillRoundRect(ctx, beishu * 5 + left, beishu * 2 + top, beishu * 40, beishu * 20, beishu * 5, '#F46563')
        _this.drawWord(ctx, beishu * 25 + left, beishu * 13 + top, beishu * 13, "#FFFFFF", "热门")
      }


      if (cardInof.have_card_badge) {
        let badge = canvas.createImage();
        badge.src = this.data.data.card_badge_url;
        badge.onload = () => {
          _this.addShadow(ctx, beishu * 2, beishu * 2, beishu * 3, 'rgba(0,0,0,0.3)')
          ctx.drawImage(badge, beishu * 157 + left, beishu * 2 + top, beishu * 80, beishu * 80);
          _this.clearShadow(ctx)

          setTimeout(function (e) {
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
          }, 500)
        }
      } else {
        setTimeout(function (e) {
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
        }, 500)
      }

    }
    // _this.fillLeftBottomRoundRect(ctx, beishu * 18 + left, beishu * 169+top, width, beishu * 31, beishu * 5, '#858BC7')
    // _this.fillLeftBottomRoundRect(ctx, beishu * 18 + left+width, beishu * 169+top, width, beishu * 31, 0, '#58B8B7')
    // _this.fillRightBottomRoundRect(ctx, beishu * 18 + left+width*2, beishu * 169+top, width, beishu * 31, beishu * 5, '#E5C383')

    let num = canvas.createImage();
    if (cardInof.card_type == "SSR") {
      num.src = '/pages/images/ssr.png';
    } else if (cardInof.card_type == "FUNCATION") {
      num.src = '/pages/images/function.png';
    } else if (cardInof.card_type == "TRUE_CARD") {
      num.src = '/pages/images/true_card.png';
    } else {
      num.src = '/pages/images/sr.png';
    }
    num.onload = () => {
      ctx.drawImage(num, beishu * 18 + left, beishu * 171 + top, beishu * 25, beishu * 25);
    }
    _this.drawWord(ctx, beishu * 58 + left, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.surplus_card_num + "/" + cardInof.total_card_num)

    let lv = canvas.createImage();
    lv.src = '/pages/images/c_info_lv.png';
    lv.onload = () => {
      ctx.drawImage(lv, beishu * 24 + left + width, beishu * 172 + top, beishu * 25, beishu * 25);
    }
    _this.drawWord(ctx, beishu * 60 + left + width, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.card_lv)

    let cp = canvas.createImage();
    cp.src = '/pages/images/c_info_point.png';
    cp.onload = () => {
      ctx.drawImage(cp, beishu * 25 + left + width * 2, beishu * 174 + top, beishu * 20, beishu * 20);
    }
    _this.drawWord(ctx, beishu * 58 + left + width * 2, beishu * 185 + top, beishu * 12, "#FFFFFF", cardInof.card_cpoint)

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
          if (cardInfo.card_type == 'SSR' || cardInfo.card_type == 'SR') {
            if (contentString.length > 0) {
              if (contentString.length > 8) {
                content = '[' + cardInfo.title.substr(0, 8) + '...' + ']' + '价值' + cardInfo.card_cpoint + ' 可兑换黄油啤酒' + getPercent + '%杯'
              } else {
                content = '[' + cardInfo.title + ']' + '价值' + cardInfo.card_cpoint + ' 可兑换黄油啤酒' + getPercent + '%杯'
              }
            } else {
              content = '碎片' + '价值' + cardInfo.card_cpoint + ' 可兑换黄油啤酒' + getPercent + '%杯'
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
          }
        } else if (nowClickType == 2) {
          if (cardInfo.card_type == 'SSR' || cardInfo.card_type == 'SR') {
            if (contentString.length > 0) {
              if (contentString.length > 8) {
                content = '送你一块碎片' + '[' + cardInfo.title.substr(0, 8) + '...' + ']' + ' 可兑换黄油啤酒' + getPercent + '%杯'
              } else {
                content = '送你一块碎片' + '[' + cardInfo.title + ']' + ' 可兑换黄油啤酒' + getPercent + '%杯'
              }
            } else {
              content = '送你一块碎片' + ' 可兑换黄油啤酒' + getPercent + '%杯'
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
          }
        }


        let userInfo = wx.getStorageSync('userInfo')
        wx.hideLoading()
        createShareImageResolve({
          title: content,
          path: '/pages/card_detail/card_detail?card_id=' + this.data.data.card_id + "&share_id=" + shareID + '&share_type=' + shareInfo.share_type + '&share_account_id=' + userInfo.account_id,
          imageUrl: shareInfo.image_url
        })
      }
    }
  },
  initData(obj) {

    let heartBtnUlr = '/pages/images/heart_btn_white.png'
    let startBtnUlr = '/pages/images/start_btn_white.png'
    if (obj.liked) {
      heartBtnUlr = '/pages/images/heart_btn_selected.png'
    }
    if (obj.wanted) {
      startBtnUlr = '/pages/images/start_btn_selected.png'
    }

    this.setData({
      heart_btn_url: heartBtnUlr,
      star_btn_url: startBtnUlr
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
      //发起网络请求
      _this.afterLogin(e, type)
      _this.setData({
        account_info: res,
        show_loading: false,
        show_login_loading: false,
      });
      if (res.data.data.new_account) {
        console.log("要请求了")
        if (wx.getStorageSync('share_info') != '') {
          console.log("没翻车呀")
          _this.updateShareInfo()
        }
      }
    }, this)

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
    }
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
  shareBtn(e) {
    if (!this.judgeLogOn(e, 'share_card')) {
      return
    }
    nowClickType = 1
    this.setData({
      popup_data: {
        type_icon: '/pages/images/share_btn1.png',
        title: '分享碎片',
        content1: '好友点击您的分享，您就可额外获得',
        content2: '1次收集碎片机会',
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
  cancel(e) {
    this.setData({
      show_bottom_pop: false
    })
  },
})