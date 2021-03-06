const http = require('../../utils/request.js')
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // hasAddress: false,
    shoppingList: [], //购物车列表
    total: 0, //购物车商品合计
    userInfo: {},
    date: '',
    payMethod: '',//支付方式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let listenSuc = setInterval(() => {
      if (app.globalData.ajaxOk) {
        console.log("回调成功")
        this.getShoppingList();
        clearInterval(listenSuc)
      }
    }, 1000)
    this.getNowTime();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getSystemInfo({
      success: res => {
        let realHeight = (res.windowHeight * (750 / res.windowWidth)) - 280;
        this.setData({
          //换算成rpx
          winHeight: realHeight
        })

      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.getAddress()
    this.getUserInfo()
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

  },
  getUserInfo() {
    http.request({
      apiName: '/users',
      method: 'GET',
      isShowProgress: true,
    }).then((res) => {
      this.setData({
        userInfo: res,
        payMethod: res.store.type
      })
    })
  },
  //跳转地址页面
  enterAddress() {
    return;
    wx.navigateTo({
      url: '../newAddress/newAddress',
    })
  },
  //获取今日时间
  getNowTime() {
    var date = new Date();
    //收货日期从明日开始
    var nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000); //后一天
    var seperator1 = "-";
    var seperator2 = ":";
    var month = nextDate.getMonth() + 1;
    var strDate = nextDate.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    let currentdate = nextDate.getFullYear() + seperator1 + month + seperator1 + strDate
    this.setData({
      date: currentdate
    })
  },
  //取回保存的地址
  getAddress() {
    http.request({
      apiName: '/users/address',
      method: 'GET',
      isShowProgress: false,
    }).then((res) => {
      if (JSON.stringify(res) != '{}') {
        //保存地址后就有回显示
        this.setData({
          hasAddress: true,
          addressInfo: res
        })
      } else {
        this.setData({
          hasAddress: false,
        })
      }
    })
  },
  //初始化加载购物车列表并回显购物车数量
  getShoppingList() {
    http.request({
      apiName: '/carts',
      method: 'GET',
    }).then((res) => {
      //统计合计金额
      this.setData({
        bubble: res.length
      })
      var sum = 0;
      if (res.length == 0) {
        this.setData({
          total: 0
        })
        wx.showToast({
          title: '购物车空空如也',
          icon: 'none',
          success() {
            setTimeout(() => {
              wx.navigateBack({

              })
            }, 1000)
          }
        })

      } else {
        for (let index in res) {
          var price = res[index].product.extend.price;
          var quantity = res[index].quantity;
          sum += (price * quantity)
          res[index]["littleSum"] = (price * quantity).toFixed(2)
        }
        this.setData({
          total: sum.toFixed(2)
        })
      }
      this.setData({
        shoppingList: res
      })
    })
  },

  //清除某一商品
  deleteIt(e) {
    let id = e.currentTarget.dataset.id;
    http.request({
      apiName: '/carts/' + id,
      method: 'DELETE',
    }).then((res) => {
      this.getShoppingList();
    })
  },
  //商品+1
  add(e) {
    let productId = e.currentTarget.id;
    http.request({
      apiName: '/carts',
      method: 'POST',
      data: {
        "product_id": productId,
        "quantity": 1,
      },
    }).then((res) => {
      this.getShoppingList()
    })

  },
  //商品-1
  subtract(e) {
    let id = e.currentTarget.dataset.id;
    let nowQuantity = e.currentTarget.dataset.quantity - 1;
    if(nowQuantity==0){
      this.deleteIt(e)
      return
    }
    http.request({
      apiName: '/carts/' + id,
      method: 'PUT',
      data: {
        "quantity": nowQuantity,
      },
    }).then((res) => {
      this.getShoppingList()
    })
  },
  //input输入修改数量
  changeNum(e) {
    http.request({
      apiName: '/carts/' + e.currentTarget.dataset.id,
      method: 'PUT',
      data: {
        "quantity": e.detail.value,
      },
    }).then((res) => {
      this.getShoppingList()
    })
  },
  //清空购物车
  clearList() {
    http.request({
      apiName: '/carts',
      method: 'DELETE',
      isShowProgress: true,
    }).then((res) => {
      this.getShoppingList()
    })

  },
  //选择收货时间
  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  submitOrder() {
    //无商品不能 提交
    if (this.data.shoppingList.length == 0) {
      wx.showToast({
        title: '购物车无商品',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack({})
      }, 1000)
      return;
    }
    http.request({
      apiName: '/orders',
      method: 'POST',
      data: {
        // consignee: this.data.addressInfo.consignee,
        // consignee_mobile: this.data.addressInfo.consignee_mobile,
        // address: this.data.addressInfo.province + this.data.addressInfo.city + this.data.addressInfo.county + this.data.addressInfo.detail,
        arrive_time: this.data.date
      },
      isShowProgress: true,
    }).then(res => {
      if (res && res.pay_status){
        if (res.pay_status==1){
          wx.switchTab({
            url: '../order/order'
          })
          return;
        }
      }
      if (JSON.stringify(res) != "{}") {
        wx.navigateTo({
          url: '../orderDetail/orderDetail?order=' + JSON.stringify(res),
        })
      }
    })

  }
})