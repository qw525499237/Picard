let bucketName = 'weiyu-bulletin-picture-1258021264'
let region = 'ap-beijing'
var CosAuth = require('../../libs/cos-auth');
var prefix = 'https://' + bucketName + '.cos.' + region + '.myqcloud.com/';

function uploadFile(fileName, filePath, bucketName, region, success, fail) {
  getAuthorization({
    Method: 'POST',
    Pathname: '/'
  }, function (AuthData) {
    console.log(AuthData)
    var requestTask = wx.uploadFile({
      url: prefix,
      name: 'file',
      filePath: filePath,
      formData: {
        'key': fileName,
        'success_action_status': 200,
        'Signature': AuthData.Authorization,
        'x-cos-security-token': AuthData.XCosSecurityToken,
        'Content-Type': '',
      },
      success: function (res) {
        success(res)
      },
      fail: function (res) {
        // fail(res)
      }
    });
    requestTask.onProgressUpdate(function (res) {
      console.log('正在进度???:', res);
    });
  });

};


var stsCache;
var getCredentials = function (callback) {
  if (stsCache && Date.now() / 1000 + 30 < stsCache.expired_time) {
    console.log('用旧的')
    console.log(stsCache)
    callback(stsCache);
    return;
  }
  let userInfo = wx.getStorageSync('userInfo')
  let prefix = ''
  if (__wxConfig.envVersion == 'develop') {
    prefix = 'https://test.weiyuglobal.com:499/api/accounts/';
  } else {
    prefix = 'https://www.weiyuglobal.com:443/api/accounts/';
  }
  wx.request({
    method: 'POST',
    url: prefix + 'txcos/key', // 服务端签名，参考 server 目录下的两个签名例子
    dataType: 'json',
    header: {
      'wy-platform': 'mini_programe', // 默认值
      'Authorization': 'Bearer ' + userInfo.access_token
    },
    data: {
      bucket_name: bucketName,
      region: region
    },
    success: function (result) {
      console.log('请求成功')
      console.log(result)
      var data = result.data;
      var credentials = data.data;
      if (credentials) {
        stsCache = credentials
      } else {
        wx.showModal({
          title: '临时密钥获取失败',
          content: JSON.stringify(data),
          showCancel: false
        });
      }
      callback(stsCache);
    },
    error: function (err) {
      wx.showModal({
        title: '临时密钥获取失败',
        content: JSON.stringify(err),
        showCancel: false
      });
    }
  });
};

// 计算签名
var getAuthorization = function (options, callback) {
  getCredentials(function (credentials) {
    callback({
      XCosSecurityToken: credentials.session_token,
      Authorization: CosAuth({
        SecretId: credentials.tmp_secret_id,
        SecretKey: credentials.tmp_secret_key,
        Method: options.Method,
        Pathname: options.Pathname,
      })
    });
  });
};

function uploadCardVideoFile(fileName, filePath, success) {
  uploadFile(fileName, filePath, "", "", success, '')
};

module.exports.uploadCardVideoFile = uploadCardVideoFile;