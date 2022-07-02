// app.js
var request = require('/pages/common/request');


App({
  onLaunch(options) {
    request.initRequest()
    this.judgeAccessCode()
    let that = this
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.setStorageSync('mute', false)
    wx.setStorageSync('new_open', true)
    wx.setStorageSync('show_meta_pick_toast', false)
    wx.setStorageSync('show_meta_pick_toast_count', 1)
    //初始化图鉴数据
    this.initHandBook()
    wx.setStorageSync('haveCreatedCards', {
      create: false
    })

    // wx.setStorageSync('version', 1)

    if (wx.getStorageSync('show_buy_square_toast') == '') {
      wx.setStorageSync('show_buy_square_toast', {
        show: true
      })
    }

    if (wx.getStorageSync('open_num') == '') {
      wx.setStorageSync('open_num', 1)
    }

    const canvas1 = wx.createOffscreenCanvas({
      type: '2d',
      width: 1,
      height: 1
    })
    that.globalData.ctx = canvas1.getContext('2d')


    wx.getSystemInfo({
      success: function (res) {

        that.globalData.statusBarHeight = res.statusBarHeight;
        if (res.system.indexOf('iOS') != -1) {
          that.globalData.platform = 'iOS';
        } else {
          that.globalData.platform = 'Android';
        }
      }
    })
    that.globalData.firstStartApp = true;

    let btnInfo = wx.getMenuButtonBoundingClientRect()
    that.globalData.menuButtonToTop = btnInfo.top;
    that.globalData.menuButtonHeight = btnInfo.height;
    console.log(btnInfo)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  },
  judgeAccessCode() {
    if (wx.getStorageSync('login') != '') {
      let accountInfo = wx.getStorageSync('userInfo')
      if (__wxConfig.envVersion == 'develop') {
        if (accountInfo.dev_assess_code == undefined || accountInfo.dev_assess_code.length <= 0) {
          wx.setStorageSync('userInfo', '')
          wx.setStorageSync('login', '')
        }
      } else {
        if (accountInfo.prd_assess_code == undefined || accountInfo.prd_assess_code.length <= 0) {
          wx.setStorageSync('userInfo', '')
          wx.setStorageSync('login', '')
        }
      }
    }

  },
  getSystemData(attr) {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: (res) => {
          resolve(res[attr])
        }
      })
    })
  },

  queryNodes(id, attr) {
    return new Promise((resolve, reject) => {
      let query = wx.createSelectorQuery()
      query.select(id).boundingClientRect()
      query.exec((res) => {
        resolve(res[0][attr])
      })
    })
  },
  /** 

* 设置监听器

*/
  setWatcher(page) {
    let data = page.data;
    let watch = page.watch;
    Object.keys(watch).forEach(v => {
      let key = v.split('.'); // 将watch中的属性以'.'切分成数组
      let nowData = data; // 将data赋值给nowData
      for (let i = 0; i < key.length - 1; i++) { // 遍历key数组的元素，除了最后一个！
        nowData = nowData[key[i]]; // 将nowData指向它的key属性对象
      }
      let lastKey = key[key.length - 1];
      // 假设key==='my.name',此时nowData===data['my']===data.my,lastKey==='name'
      let watchFun = watch[v].handler || watch[v]; // 兼容带handler和不带handler的两种写法
      let deep = watch[v].deep; // 若未设置deep,则为undefine
      this.observe(nowData, lastKey, watchFun, deep, page); // 监听nowData对象的lastKey
    })
  },

  /**
   * 监听属性 并执行监听函数
   */
  observe(obj, key, watchFun, deep, page) {
    var val = obj[key];
    // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
    if (deep && val != null && typeof val === 'object') {
      Object.keys(val).forEach(childKey => { // 遍历val对象下的每一个key
        this.observe(val, childKey, watchFun, deep, page); // 递归调用监听函数
      })
    }
    var that = this;
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        // 用page对象调用,改变函数内this指向,以便this.data访问data内的属性值
        watchFun.call(page, value, val); // value是新值，val是旧值
        val = value;
        if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
          that.observe(obj, key, watchFun, deep, page);
        }
      },
      get: function () {
        return val;
      }
    })
  },
  initHandBook() {
    let now_handbook_list = wx.getStorageSync('now_handbook_list')
    console.log(wx.getStorageSync('handbook_list'))
    let result = wx.getStorageSync('handbook_list')
    if (result == '') {
      result = []
    }
    for (let i = 0; i < now_handbook_list.length; i++) {
      result.push(now_handbook_list[i].card_id)
    }
    wx.setStorageSync('now_handbook_list', [])
    wx.setStorageSync('handbook_list', result)
    if (wx.getStorageSync('handbook_list_date') == '') {
      wx.setStorageSync('handbook_list_date', 1604648478000)
    }
  },

})