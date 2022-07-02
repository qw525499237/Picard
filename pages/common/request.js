var prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
var userInfo = ''


var initRequest = function () {
  console.log(__wxConfig.envVersion)
  if (__wxConfig.envVersion == 'develop') {
    prefix = 'https://test.weiyuglobal.com:499/api/mini_program/';
  } else {
    prefix = 'https://www.weiyuglobal.com:443/api/mini_program/';
  }
}

let isExchangeTrueCard = false
var exchangeTrueCardRequesrt = function (data, callback) {
  this.initRequest()
  if (!isPhoneNumber(data.phone)) {
    wx.showToast({
      title: '请输入正确的手机号码',
      icon: 'none'
    })
    return
  }
  if (isExchangeTrueCard) {
    return
  }
  isExchangeTrueCard = true
  if (userInfo == '') {
    if (wx.getStorageSync('login') != '') {
      userInfo = wx.getStorageSync('userInfo')
    } else {
      return
    }
  }
  wx.request({
    method: 'POST',
    url: prefix + 'exchange_true_card', // 服务端签名，参考 server 目录下的两个签名例子
    header: {
      'wy-platform': 'mini_programe', // 默认值
      'Authorization': 'Bearer ' + userInfo.access_token
    },
    data: data,
    success: function (result) {
      isExchangeTrueCard = false
      callback(result);
    },
    error: function (err) {
      isExchangeTrueCard = false
      console.error(err)
    }
  });
};

function isPhoneNumber(tel) {
  var reg = /^0?1[3|4|5|6|7|8][0-9]\d{8}$/;
  return reg.test(tel);
}




let isLogIn = false
let login = function (callback, that) {
  if (isLogIn) {
    wx.showToast({
      title: '正在登陆中...',
      icon: 'none'
    })
    return
  }
  isLogIn = true
  let _this = this
  wx.getUserProfile({
    desc: '用于展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    success: (res) => {
      that.setData({
        show_login_loading: true
      })

      wx.login({
        success(ress) {
          if (ress.code) {
            //发起网络请求
            let reqData = {
              account_icon: res.userInfo.avatarUrl,
              account_name: res.userInfo.nickName,
              code: ress.code
            }
            wx.request({
              url: prefix + 'account', //仅为示例，并非真实的接口地址
              method: 'POST',
              data: reqData,
              header: {
                'wy-platform': 'mini_programe' // 默认值
              },
              success(resss) {
                isLogIn = false
                if (__wxConfig.envVersion == 'develop') {
                  resss.data.data.dev_assess_code = resss.data.data.access_token;
                } else {
                  resss.data.data.prd_assess_code = resss.data.data.access_token;
                }
                wx.setStorageSync('userInfo', resss.data.data)
                wx.setStorageSync('login', true)

                getAccountInfo(callback)
                if (resss.data.data.new_account_show_toast) {
                  wx.setStorageSync('new_account_toast', true)
                }
                if (resss.data.data.new_account) {
                  if (wx.getStorageSync('share_info') != '') {
                    updateShareInfo()
                  }
                }
              }
            })
          } else {
            wx.showToast({
              title: '登录失败',
              icon: 'error'
            })
            console.error('登录失败！' + res.errMsg)
          }
        }
      })
    },
    fail: (res) => {
      isLogIn = false
    }
  })
}

let updateShareInfo = function () {
  let shareInfo = wx.getStorageSync('share_info')
  if (userInfo == '') {
    if (wx.getStorageSync('login') != '') {
      userInfo = wx.getStorageSync('userInfo')
    } else {
      return
    }
  }
  wx.request({
    url: prefix + 'new_account_share?share_account_id=' + shareInfo.share_account_id + '&card_id=' + shareInfo.card_id,
    method: 'PUT',
    header: {
      'wy-platform': 'mini_programe', // 默认值
      'Authorization': 'Bearer ' + userInfo.access_token
    },
    success(res) {
      if (res.data.result != 0) {
        console.error(res.data.msg)
      }
    }
  })
}


let getAccountInfo = function (callback) {
  if (userInfo == '') {
    if (wx.getStorageSync('login') != '') {
      userInfo = wx.getStorageSync('userInfo')
    } else {
      return
    }
  }
  let time = wx.getStorageSync('handbook_list_date')

  wx.request({
    url: prefix + 'account_info?last_time=' + time, //仅为示例，并非真实的接口地址
    method: 'GET',
    header: {
      'wy-platform': 'mini_programe', // 默认值
      'Authorization': 'Bearer ' + userInfo.access_token
    },
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
        callback(res.data.data)
      }
    }
  })
}


let isGettingMetaList = false
let getMetaList = function (nowShowList, shareAssessId, callBack) {

  if (isGettingMetaList) {
    return
  }
  isGettingMetaList = true
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  }


  let nowShowListIDs = '-1,' + shareAssessId
  for (let i = 0; i < nowShowList.length; i++) {
    if (nowShowList[i].card_id != undefined) {
      nowShowListIDs = nowShowListIDs + ',' + nowShowList[i].card_id
    }
  }

  let ids = nowShowListIDs

  let nowListids = nowShowListIDs

  let metaListId = wx.getStorageSync('meta_list')
  if (metaListId == '') {
    metaListId = []
  }
  for (let i = 0; i < metaListId.length; i++) {
    ids = ids + ',' + metaListId[i]
  }
  let roundNextStartID = -1
  if (wx.getStorageSync('round_next_start_id') != '') {
    roundNextStartID = wx.getStorageSync('round_next_start_id')
  }

  let roundNextStartSquareID = -1
  if (wx.getStorageSync('round_next_square_start_id') != '') {
    roundNextStartSquareID = wx.getStorageSync('round_next_square_start_id')
  }

  let roudnStartID = -1
  if (wx.getStorageSync('round_start_id') != '') {
    roudnStartID = wx.getStorageSync('round_start_id')
  }

  let meteRankList = wx.getStorageSync('meta_rank_list')
  if (meteRankList == '') {
    meteRankList = []
  }
  let roundShowList = []
  let add = false
  if (roudnStartID == -1) {
    for (let i = 0; i < meteRankList.length; i++) {
      if (meteRankList[i] == -1) {
        continue
      }
      roundShowList.push(meteRankList[i])
      if (roundShowList.length == 20) {
        break
      }
    }
  } else {
    for (let i = 0; i < meteRankList.length; i++) {
      if (meteRankList[i] == -1) {
        continue
      }
      if (add) {
        roundShowList.push(meteRankList[i])
      }
      if (roundShowList.length == 20) {
        break
      }
      if (meteRankList[i] == roudnStartID) {
        add = true
      }
    }
  }

  if (roundShowList.length < 20) {
    for (let i = 0; i < meteRankList.length; i++) {
      if (meteRankList[i] == -1) {
        continue
      }
      roundShowList.push(meteRankList[i])
      if (roundShowList.length == 20) {
        break
      }
    }
  }

  let roundShowListResult = '-1'
  for (let i = 0; i < roundShowList.length; i++) {
    roundShowListResult = roundShowListResult + ',' + roundShowList[i]
  }

  let data = {
    'ids': ids,
    'now_list': nowListids,
    'special_id': shareAssessId,
    'round_next_start_id': roundNextStartID,
    'round_next_square_start_id': roundNextStartSquareID,
    'round_show_list': roundShowListResult
  }

  console.log("meta请求数据", data)


  let _this = this
  wx.request({
    url: prefix + 'explore_meta_list', //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    data: data,
    success(res) {
      // console.log('获取cardlist>>>>>>>>>>>>>>>>')
      // console.log(res)

      isGettingMetaList = false
      callBack(res)
      if (res.data.result == 0) {
        wx.setStorageSync('round_next_start_id', res.data.other_data)
        wx.setStorageSync('round_next_square_start_id', res.data.other_data2)
        wx.setStorageSync('round_start_id', res.data.other_data3)

        let list = res.data.data
        for (let i = 0; i < list.length; i++) {
          let add = true
          for (let n = 0; n < metaListId.length; n++) {
            if (metaListId[n] == list[i].card_id) {
              add = false
              break
            }
          }
          if (add) {
            let item = list[i]
            metaListId.push(item.card_id)
          }
        }
        wx.setStorageSync('meta_list', metaListId)


        if (roudnStartID == -1) {

          for (let i = 0; i < list.length; i++) {
            if (list[i].new_one) {
              meteRankList.push(list[i].card_id)
            }
          }
        } else {

          let newList = []
          for (let i = 0; i < meteRankList.length; i++) {
            newList.push(meteRankList[i])
            if (i < meteRankList.length - 1) {
              if (meteRankList[i + 1] == roudnStartID) {
                for (let i = 0; i < list.length; i++) {
                  if (list[i].new_one) {
                    newList.push(list[i].card_id)
                  }
                }
              }
            }
          }
          meteRankList = newList

        }
        wx.setStorageSync('meta_rank_list', meteRankList)

        let deleteList = res.data.other_data4
        if (deleteList.length > 0) {
          let metaRankList = wx.getStorageSync('meta_rank_list')
          let resultList = []
          for (let i = 0; i < metaRankList.length; i++) {
            let add = true
            for (let t = 0; t < deleteList.length; t++) {
              if (deleteList[t] == metaRankList[i]) {
                add = false
                break
              }
            }
            if (add) {
              resultList.push(metaRankList[i])
            }
          }
          wx.setStorageSync('meta_rank_list', resultList)

        }
      }
    },
    complete(res) {
      if (res.errMsg == 'request:fail timeout') {
        getMetaList(nowShowList, shareAssessId, callBack)
      }
    }
  })
}


let getCardRemind = function (originList, callback) {
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
      if (res.data.result == 0) {
        let list = res.data.data;
        callback(list, true)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }
  })
}

let updateCardRemind = function (data) {
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
}

let pickCardRequest = function (cardID, callBack) {
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
    url: prefix + 'extract_card?card_id=' + cardID, //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    success(res) {
      callBack(res.data)
    }
  })
}

let isSellMultCard
let sellMultCard = function (list, callBack) {
  if (isSellMultCard) {
    wx.showToast({
      title: '正在出售请稍等...',
      icon: 'none'
    })
    return
  }
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  isSellMultCard = true

  wx.request({
    url: prefix + 'sell_mult_card', //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    data: list,
    success(res) {
      isSellMultCard = false
      callBack(res.data)
    }
  })
}


let getCardCode = function (cardID, callback) {
  if (userInfo == '') {
    if (wx.getStorageSync('login') != '') {
      userInfo = wx.getStorageSync('userInfo')
    } else {
      return
    }
  }

  wx.request({
    url: prefix + 'card_code?card_id=' + cardID, //仅为示例，并非真实的接口地址
    method: 'GET',
    header: {
      'wy-platform': 'mini_programe', // 默认值
      'Authorization': 'Bearer ' + userInfo.access_token
    },
    success(res) {
      if (res.data.result == 0) {

        callback(res.data.data)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }
  })
}


let echangeCardCode = function (CardCode, callBack) {
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  let data = {
    card_code: CardCode
  }

  wx.request({
    url: prefix + 'exchange_card_code', //仅为示例，并非真实的接口地址
    method: 'PUT',
    header: header,
    data: data,
    success(res) {
      callBack(res.data)
    }
  })
}



let likeCardReq = function (cardID, liked) {
  let userInfo = wx.getStorageSync('userInfo')
  let resultReq = {
    card_id: cardID,
    liked: liked,
  }
  wx.request({
    url: prefix + 'card_liker', //仅为示例，并非真实的接口地址
    method: 'POST',
    data: resultReq,
    header: {
      'wy-platform': 'mini_programe', // 默认值
      'Authorization': 'Bearer ' + userInfo.access_token
    },
    success(res) {
      console.log(res)
    }
  })
}


let wantCardReq = function (cardID, liked) {
  let userInfo = wx.getStorageSync('userInfo')
  let resultReq = {
    card_id: cardID,
    liked: liked,
  }
  wx.request({
    url: prefix + 'card_want', //仅为示例，并非真实的接口地址
    method: 'POST',
    data: resultReq,
    header: {
      'wy-platform': 'mini_programe', // 默认值
      'Authorization': 'Bearer ' + userInfo.access_token
    },
    success(res) {
      console.log(res)
    }
  })
}


let getAllTureCard = function (callback) {
  let _this = this
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    callback([])
    return
  }
  wx.request({
    url: prefix + 'true_card', //仅为示例，并非真实的接口地址
    method: 'GET',
    header: header,
    success(res) {
      if (res.data.result == 0) {
        let dataList = res.data.data
        callback(dataList)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }
  })
}


let putTrueCard = function (data, callback) {
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  console.log(data)
  let reqData = {
    card_id: data.card_id,
    type: data.type
  }
  wx.request({
    url: prefix + 'true_card/end_img_card', //仅为示例，并非真实的接口地址
    method: 'PUT',
    header: header,
    data: reqData,
    success(res) {
      getAllTureCard(callback)
    }
  })
}


let getAssessList = function (list, nowListIds, callback) {
  let _this = this
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    // callback([])
    // return
  }
  let data = {
    "card_ids": list,
    "now_card_ids": nowListIds
  }
  wx.request({
    url: prefix + 'assess_card_list', //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    data: data,
    success(res) {
      if (res.data.result == 0) {
        let dataList = res.data.data
        callback(dataList)
      } else {
        callback([])
        // wx.showToast({
        //   title: res.data.msg,
        //   icon: 'none'
        // })
      }
    }
  })
}


let createAssessInfo = function (data, callback) {
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  console.log(data)

  wx.request({
    url: prefix + 'assess_card', //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    data: data,
    success(res) {
      callback(res.data)
    }
  })
}

let createAssessComment = function (data, callback) {
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  console.log(data)

  wx.request({
    url: prefix + 'assess_card_comment', //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    data: data,
    success(res) {
      callback(res.data)
    }
  })
}

let createAssessBrowes = function (data, callback) {
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  console.log(data)

  wx.request({
    url: prefix + 'assess_browse', //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    data: data,
    success(res) {
      // callback(res.data)
    }
  })
}


let putAssessInfo = function (cardID) {
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  let data = {
    card_id: cardID
  }

  wx.request({
    url: prefix + 'assess_result_list', //仅为示例，并非真实的接口地址
    method: 'PUT',
    header: header,
    data: data,
    success(res) {

    }
  })
}



let getQCCode = function (cardID, callback) {
  let _this = this
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  }

  let userInfo = wx.getStorageSync('userInfo')
  let otherInfo = userInfo.account_id + ',' + cardID

  header.Authorization = 'Bearer ' + userInfo.access_token

  wx.request({
    url: prefix + 'qc_code?other_info=' + otherInfo + '&env_version=' + __wxConfig.envVersion,
    method: 'GET',
    header: header,
    success(res) {
      if (res.data.result == 0) {
        let dataList = res.data.data
        callback(dataList)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }
  })
}

let isBuySquare = false
let buySquare = function (data, callback) {

  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  } else {
    return
  }
  if (isBuySquare) {
    return
  }
  isBuySquare = true


  wx.request({
    url: prefix + 'square', //仅为示例，并非真实的接口地址
    method: 'POST',
    header: header,
    data: data,
    success(res) {

      callback(res.data)
    },
    complete() {
      isBuySquare = false
    }
  })
}


let putSquare = function (data, callback) {

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
    url: prefix + 'square', //仅为示例，并非真实的接口地址
    method: 'PUT',
    header: header,
    data: data,
    success(res) {

      callback(res.data)
    },
    complete() {}
  })
}


let getCardDeal = function (callback) {
  let _this = this
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }

  wx.request({
    url: prefix + 'deal_card_info',
    method: 'GET',
    header: header,
    success(res) {
      if (res.data.result == 0) {
        let data = res.data.data
        callback(data)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }
  })
}

let getCardComment = function (cardID, callback) {

  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  }
  wx.request({
    url: prefix + '' + cardID + '/all_comments', //仅为示例，并非真实的接口地址
    method: 'GET',
    header: header,
    success(res) {
      if (res.data.result == 0) {
        callback(res.data.data)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }
  })
}


let getChangeSHow = function (callback) {
  let _this = this
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }

  if (wx.getStorageSync('login') != '') {
    let userInfo = wx.getStorageSync('userInfo')
    header.Authorization = 'Bearer ' + userInfo.access_token
  }
  wx.request({
    url: prefix + 'change_show?version=16', //仅为示例，并非真实的接口地址
    method: 'GET',
    header: header,
    success(res) {
      if (res.data.result == 0) {
        let show = res.data.data
        wx.setStorageSync('change_show', show)
        wx.setStorageSync('change_show2', {
          show: show
        })
        callback()
      }
    }
  })
}


let getHotPoi = function () {
  let _this = this
  let header = {
    'wy-platform': 'mini_programe', // 默认值
  }
  wx.request({
    url: prefix + 'hot_poi',
    method: 'GET',
    header: header,
    success(res) {
      if (res.data.result == 0) {
        console.log(res)
        if (res.data.data.content.length > 0) {
          wx.setStorageSync('hot_poi', res.data.data)
        }
      }
    }
  })
}

module.exports.getHotPoi = getHotPoi;
module.exports.getChangeSHow = getChangeSHow;
module.exports.exchangeTrueCardRequesrt = exchangeTrueCardRequesrt;
module.exports.getAccountInfo = getAccountInfo;
module.exports.login = login;
module.exports.getMetaList = getMetaList;
module.exports.getCardRemind = getCardRemind;
module.exports.updateCardRemind = updateCardRemind;
module.exports.pickCardRequest = pickCardRequest;
module.exports.sellMultCard = sellMultCard;
module.exports.getCardCode = getCardCode;
module.exports.echangeCardCode = echangeCardCode;
module.exports.likeCardReq = likeCardReq;
module.exports.wantCardReq = wantCardReq;
module.exports.getAllTureCard = getAllTureCard;
module.exports.putTrueCard = putTrueCard;
module.exports.getQCCode = getQCCode;
module.exports.getAssessList = getAssessList;
module.exports.createAssessInfo = createAssessInfo;
module.exports.putAssessInfo = putAssessInfo;
module.exports.buySquare = buySquare;
module.exports.putSquare = putSquare;
module.exports.getCardDeal = getCardDeal;
module.exports.getCardComment = getCardComment;
module.exports.createAssessComment = createAssessComment;
module.exports.createAssessBrowes = createAssessBrowes;
module.exports.initRequest = initRequest;