import eventUtil from "../core/utils/event-util";
Component({
  properties: {
    columnGap: {
      type: String,
      value: "20rpx"
    },
    isSelf: {
      type: Boolean,
      value: true
    },
    change_show: Boolean,
    sell_mult_card: Boolean
  },
  data: {
    data: [],
    leftData: [],
    rightData: []
  },
  attached() {
    this._init()
  },
  pageLifetimes: {
    show() {
      this._init()
    }
  },
  methods: {
    _init() {
      wx.lin = wx.lin || {}, wx.lin.renderWaterFlow = (t = [], e = !1, a) => {
        if ("[object Array]" !== Object.prototype.toString.call(t)) return console.error("[data]参数类型错误，渲染失败"), !1;
        this.setData({
          data: t
        }), e && (this.data.leftData = [], this.data.rightData = []), this._select(t, e).then(() => {
          a && a()
        }).catch(t => {
          console.error(t)
        })
      }
    },
    _select(t, e) {
      const a = wx.createSelectorQuery().in(this);
      return this.columnNodes = a.selectAll("#left, #right"), new Promise(a => {
        this._render(t, 0, e, () => {
          a()
        })
      })
    },
    _render(t, e, a, i) {
      (t.length > e || a) && 0 !== this.data.data.length ? this.columnNodes.boundingClientRect().exec(h => {
        const r = h[0];
        this.data.leftHeight = r[0].height, this.data.rightHeight = r[1].height, this.data.leftHeight <= this.data.rightHeight || a ? this.data.leftData.push(t[e]) : this.data.rightData.push(t[e]), this.setData({
          leftData: this.data.leftData,
          rightData: this.data.rightData
        }, () => {
          this._render(t, ++e, !1, i)
        })
      }) : i && i()
    },
    onTapItem(t) {
      eventUtil.emit(this, "linitemtap", {
        item: t.currentTarget.dataset.item
      })
    },
    showCardNum: function (e) {
      console.log(e)
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
    showBadge: function (e) {
      this.triggerEvent('showBadge', e)
    },
    clickListItem: function (e) {
      this.triggerEvent('clickListItem', e)
    },
    updateSellList(list) {
      let list1 = this.selectAllComponents('.list_item')
      for (let i = 0; i < list1.length; i++) {
        list1[i].updateSellList(list)
      }
    },
    cancelSell() {
      let list = this.selectAllComponents('.list_item')
      for (let i = 0; i < list.length; i++) {
        list[i].cancelSell()
      }
    },
    startSell() {
      let list = this.selectAllComponents('.list_item')
      for (let i = 0; i < list.length; i++) {
        list[i].startSell()
      }
    },
    showSelfSellToast: function (e) {

      this.triggerEvent('showSelfSellToast', e)
    },
    likeCard: function (e) {

      this.triggerEvent('likeCard', e)
    },
    sellNewAccountCard() {
      let list = this.selectAllComponents('.list_item')
      for (let i = 0; i < list.length; i++) {
        list[i].sellNewAccountCard()
      }
    },
    updateExistItem(item) {

      let rightData = this.data.rightData
      for (let i = 0; i < rightData.length; i++) {
        if (rightData[i].card_id == item.card_id) {
          this.setData({
            ['rightData[' + i + ']']: item,
          })
          return
        }
      }

      let leftData = this.data.leftData
      for (let i = 0; i < leftData.length; i++) {
        if (leftData[i].card_id == item.card_id) {
          this.setData({
            ['leftData[' + i + ']']: item,
          })
          return
        }
      }

      let data = this.data.data
      for (let i = 0; i < data.length; i++) {
        if (data[i].card_id == item.card_id) {
          this.setData({
            ['data[' + i + ']']: item,
          })
          return
        }
      }


    }
  }
});