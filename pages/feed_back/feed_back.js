// pages/feed_back/feed_back.js
let feedback=''
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  contentInput(e){
    feedback=e.detail.value
  },
  createFeedBack(e){
    if(feedback==''){
      wx.showToast({
        title: '请填写反馈内容',
        icon:'none'
      })
      return
    }
    let data={
      feedback:feedback
    }
    wx.showToast({
      title: '提交反馈成功',
      icon: 'none'
    })
    let userInfo = wx.getStorageSync('userInfo')

    wx.request({
      url: 'https://www.weiyuglobal.com:443/api/accounts/feedback', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: data,
      header: {
        'wy-platform': 'ios', // 默认值
        'Authorization': 'Bearer ' + userInfo.access_token
      },
      success(res) {
        console.log(res)
      }
    })
   setTimeout(function(){
    wx.navigateBack({
      delta: 1
    })
   },500)
   
  }
})