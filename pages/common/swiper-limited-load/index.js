// components/swiper-limited-load/index.js
const START = 0
const END = 2
const SWIPER_LENGTH = 3
const NO_PREV_PAGE = -1
const NO_NEXT_PAGE = -2
let timeout = ''
let showCpAdd = true
Component({
  observers: {
    'current': function (index) {

      let that = this
      let current = index % SWIPER_LENGTH
      let {
        swiperIndex,
        swiperList
      } = that.data
      if (swiperList.length == 0 || swiperList[current] == null) {
        return
      }
      // 如果change后还是之前的那一个item，直接return
      if (current == swiperIndex && swiperList[swiperIndex].index == index) {
        return
      }
      that.init(index)
      // 如果change之后还是当前的current，比如之前是1、点击后是4  之前是2、点击后是5之类
      // 那么不会走swiperChange的change方法，需要我们手动去给它加一个current，然后传出去
      if (current == swiperIndex) {
        that.triggerEvent("change", {
          source: "",
          current: index
        })
      }
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    change_show: {
      type: Boolean,
      value: false
    },
    showPickInfo: {
      type: Boolean,
      value: false
    },
    swiperHeight: {
      type: String,
      value: '0'
    },
    list: {
      type: Array,
      value: []
    },
    current: {
      type: Number,
      value: 0
    },
    item_height: {
      type: Number,
      value: 0
    },
    // 值为0禁止切换动画
    swiperDuration: {
      type: String,
      value: "250"
    },
    // 分页需要传此数据
    total: {
      type: Number,
      value: 0
    },
    get_card_height: {
      type: Number,
      value: 0
    },
    card_to_top: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 滑动到的位置
    swiperIndex: 0,
    // 此值控制swiper的位置
    swiperCurrent: 0,
    // 当前swiper渲染的items
    swiperList: [],
    swiperCanMove: true,

  },

  /**
   * 组件的方法列表
   */
  methods: {

    init(defaulaIndex) {
      let that = this
      let list = that.data.list
      if (list == null || list.length == 0) {
        return
      }
      // 默认显示的index
      let current = defaulaIndex % SWIPER_LENGTH
      let resultlist = that.getInitSwiperList(list, defaulaIndex)
      that.setData({
        swiperList: resultlist,
        swiperIndex: current,
        swiperCurrent: current,
      }, function () {
        that.changeNowIndex(resultlist[current])
        timeout = setTimeout(function () {
          var animation1 = wx.createAnimation({
            duration: 400,
            timingFunction: "linear",
            delay: 0
          })
          animation1.opacity(0).step();
          that.setData({
            cpant: animation1.export()
          })
        }, 2000)
      })
    },
    updateItem(item) {
      let _this = this
      setTimeout(function () {
        let list = _this.selectAllComponents('.item_class')
        for (let i = 0; i < list.length; i++) {
          list[i].updateItem(item);
        }
        let swiperList = _this.data.swiperList
        for (let i = 0; i < swiperList.length; i++) {
          if (swiperList[i] == null) {
            continue
          }
          if (item.card_id == swiperList[i].card_id) {
            _this.setData({
              ['swiperList[' + i + ']']: item,
            })
            break
          }
        }
      }, 0)
    },

    clear() {
      this.setData({
        list: [],
        swiperList: []
      })
    },

    swiperChange: function (e) {
      // let time1 = new Date().getTime()
      let that = this
      let current = e.detail.current
      let lastIndex = that.data.swiperIndex
      let currentItem = that.data.swiperList[current]
      let info = {}
      info.source = e.detail.source
      if (currentItem != null && currentItem != undefined) {
        // setTimeout(function () {
        that.changeNowIndex(currentItem)
        // }, 0)
      }

      // 正向滑动，到下一个的时候
      // 是正向衔接
      let isLoopPositive = current == START && lastIndex == END

      let data = {
        index: -1,
        showToast: false
      }

      if (currentItem != null) {
        data = currentItem
      }

      if (currentItem != null) {
        data.showToast = false
      } else if (current - lastIndex == 1 || isLoopPositive) {
        data.index = -1
        data.showToast = true
      }
      // setTimeout(function () {

      // }, 0)


      if (current - lastIndex == 1 || isLoopPositive) {
        // 如果是滑到了左边界或者下一个还未有值，弹回去
        if (currentItem == null) {
          info.current = NO_NEXT_PAGE
          // setTimeout(function () {
          //   that.triggerEvent("change", info)
          // }, 0)
          that.setData({
            swiperCurrent: lastIndex
          })
          return
        }
        let swiperChangeItem = "swiperList[" + that.getNextSwiperChangeIndex(current) + "]"
        that.setData({
          [swiperChangeItem]: that.getNextSwiperNeedItem(currentItem, that.data.list)
        })
      }

      // 反向滑动，到上一个的时候
      // 是反向衔接
      var isLoopNegative = current == END && lastIndex == START
      if (lastIndex - current == 1 || isLoopNegative) {
        // 如果滑到了右边界或者上一个还未有值，弹回去
        if (currentItem == null) {
          info.current = NO_PREV_PAGE
          // setTimeout(function () {
          //   that.triggerEvent("change", info)
          // }, 0)
          that.setData({
            swiperCurrent: lastIndex
          })
          return
        }
        let swiperChangeItem = "swiperList[" + that.getLastSwiperChangeIndex(current) + "]"
        that.setData({
          [swiperChangeItem]: that.getLastSwiperNeedItem(currentItem, that.data.list)
        })
      }



      if (currentItem == null) return
      info.current = currentItem.index
      // that.triggerEvent("change", info)
      // 记录滑过来的位置，此值对于下一次滑动的计算很重要
      that.data.swiperIndex = current
      // that.showCP()
      that.triggerEvent('swiperChangeToReq', data)
      that.judegePickToast()
      // let time2 = new Date().getTime()
      // console.log('运行时间', (time2 - time1) / 1000)
    },
    showCP() {
      let that = this
      setTimeout(function () {
        var animation = wx.createAnimation({
          duration: 200,
          timingFunction: "linear",
          delay: 0,
        })
        showCpAdd = true
        animation.opacity(1).step();
        that.setData({
          cpant: animation.export(),
          showCpAdd: true
        })
        if (timeout != '') {
          clearTimeout(timeout)
        }
        timeout = setTimeout(function () {
          var animation1 = wx.createAnimation({
            duration: 400,
            timingFunction: "linear",
            delay: 0
          })
          animation1.opacity(0).step();
          that.setData({
            cpant: animation1.export(),
            showCpAdd: false
          })
          showCpAdd = false
        }, 2000)
      }, 0)

    },
    showCPInfo(e) {
      e.detail = e.currentTarget.dataset.item
      if (showCpAdd) {
        this.showCardCPoint(e)
      } else {

      }
    },
    ClickItem(e) {
      e.detail.currentTarget = {
        dataset: {
          item: e.currentTarget.dataset.item
        }
      }
      this.triggerEvent('metaSwiperTap', e)
    },
    /**
     * 获取初始化的swiperList
     */
    getInitSwiperList: function (list, defaultIndex) {
      let that = this
      let current = defaultIndex % SWIPER_LENGTH
      let realIndex = list.findIndex(function (item) {
        return item.index == defaultIndex
      })
      let currentItem = list[realIndex]
      let swiperList = []
      swiperList[current] = currentItem
      swiperList[that.getLastSwiperChangeIndex(current)] = that.getLastSwiperNeedItem(currentItem, list)
      swiperList[that.getNextSwiperChangeIndex(current)] = that.getNextSwiperNeedItem(currentItem, list)
      return swiperList;
    },
    /**
     * 获取swiperList中current上一个的index
     */
    getLastSwiperChangeIndex: function (current) {
      return current > START ? current - 1 : END
    },
    /**
     * 获取swiperLit中current下一个的index
     */
    getNextSwiperChangeIndex: function (current) {
      return current < END ? current + 1 : START
    },
    /**
     * 获取上一个要替换的list中的item
     */
    getLastSwiperNeedItem: function (currentItem, list) {
      if (currentItem == null) return null;
      let listNeedIndex = currentItem.index - 1
      let realIndex = list.findIndex(function (item) {
        return item.index == listNeedIndex
      })
      if (realIndex == -1) return null
      let item = listNeedIndex == -1 ? null : list[realIndex]
      return item
    },
    /**
     * 获取下一个要替换的list中的item
     */
    getNextSwiperNeedItem: function (currentItem, list) {
      if (currentItem == null) return null;
      let listNeedIndex = currentItem.index + 1
      let realIndex = list.findIndex(function (item) {
        return item.index == listNeedIndex
      })
      if (realIndex == -1) return null
      let total = this.data.total != 0 ? this.data.total : list.length
      let item = listNeedIndex == total ? null : list[realIndex]
      return item
    },
    metaSwiperTouchEnd(e) {

    },
    metaSwiperTap(e) {
      this.triggerEvent('metaSwiperTap', e)

    },
    metaSwiperLongTap(e) {
      // this.showCP()
      if (this.data.swiperCanMove == true) {
        this.setData({
          swiperCanMove: false
        })
      }
      this.triggerEvent('metaSwiperLongTap', e)
    },
    metaSwiperTouchEnd(e) {
      if (this.data.swiperCanMove == false) {
        this.setData({
          swiperCanMove: true
        })
      }
      this.triggerEvent('metaSwiperTouchEnd', e)
    },
    stopTouchMove(e) {

    },
    startSwiperMove(e) {
      // this.triggerEvent('startSwiperMove', e)
      let _this = this
      setTimeout(function () {
        _this.showCP()
      }, 0)


    },
    endSwiperAnt(e) {
      this.triggerEvent('endSwiperAnt', e)
    },
    changeNowIndex(data) {
      let list = this.selectAllComponents('.item_class')
      for (let i = 0; i < list.length; i++) {
        list[i].changeNowIndex(data)
      }
    },
    changeMuteTap(e) {
      let list = this.selectAllComponents('.item_class')
      for (let i = 0; i < list.length; i++) {
        list[i].changeMute(e.detail)
      }
    },
    showCardNum: function (e) {
      this.triggerEvent('showCardNum', e)
    },
    showCardLv: function (e) {
      this.triggerEvent('showCardLv', e)
    },
    showCardCPoint: function (e) {
      this.triggerEvent('showCardCPoint', e)
    },
    showAllInfo: function (e) {
      this.triggerEvent('showAllInfo', e)
    },
    wantCard: function (e) {
      this.triggerEvent('wantCard', e)
    },
    likeCard: function (e) {
      this.triggerEvent('likeCard', e)
    },
    loadedImg: function (e) {
      this.triggerEvent('loadedImg', e)
    },
    changeCardInfo(e) {
      let list = this.selectAllComponents('.item_class')
      for (let i = 0; i < list.length; i++) {
        list[i].changeCardInfo(e)
      }
    },
    setMute(mute) {
      let list = this.selectAllComponents('.item_class')
      for (let i = 0; i < list.length; i++) {
        list[i].setMute(mute)
      }
    },
    showAssessResult: function (e) {
      this.triggerEvent('showAssessResult', e)
    },
    showComment(e) {
      this.triggerEvent('showComment', e)
    },
    updateVideoStatus() {
      let list = this.selectAllComponents('.item_class')
      for (let i = 0; i < list.length; i++) {
        list[i].changeVideoStutus()
      }
    },
    judegePickToast() {
      this.stopAnt()
      if (wx.getStorageSync('have_pick')) {
        return
      }
      wx.setStorageSync('show_meta_pick_toast_count', wx.getStorageSync('show_meta_pick_toast_count') + 1)
      if (wx.getStorageSync('show_meta_pick_toast') || wx.getStorageSync('show_meta_pick_toast_count') >= 10) {
        this.showPickAnt()
      }
    },
    showPickAnt() {
      let list = this.selectAllComponents('.item_class')
      for (let i = 0; i < list.length; i++) {
        list[i].showPickAnt()
      }
    },
    stopAnt(){
      let list = this.selectAllComponents('.item_class')
      for (let i = 0; i < list.length; i++) {
        list[i].stopAnt()
      }
    }
  },


})