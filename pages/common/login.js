var loginRequest = require('../common/request.js');

let judgeLogStatus = function (e, type, that) {
  if (wx.getStorageSync('login') != '') {
    that.setData({
      account_info: wx.getStorageSync('userInfo')
    })
    return true
  }
  if (isLogining) {
    return false
  }

  that.setData({
    login_mask: true,
    log_in_data: e,
    log_in_type: type
  })
  return false
}