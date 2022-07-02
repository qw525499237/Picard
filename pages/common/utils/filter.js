var jumpToMePage = function (accountID, otherInfo) {
  if (otherInfo.length > 0) {
    otherInfo = '&' + otherInfo
  }

  if (accountID == -1) {
    wx.navigateTo({
      url: '../my/my?account_id=-1' + otherInfo
    })
    return
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo.account_id == accountID) {
      wx.navigateTo({
        url: '../my/my?account_id=-1' + otherInfo
      })
      return
    } else {
      wx.navigateTo({
        url: '../other_me/other_me?account_id=' + accountID + '' + otherInfo
      })
      return
    }
  } else {
    wx.navigateTo({
      url: '../other_me/other_me?account_id=' + accountID + '' + otherInfo
    })
    return
  }
}



module.exports.jumpToMePage = jumpToMePage;