const http = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000, //切换时间
    duration: 1000, //滑动时长
    circular: true, //无缝轮播
    // 促销信息
    name: '精品五花肉1kg/份',
    goodsList: [],
    quantity:0,
    bubble:0,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getList();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.loadList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 自定义函数
   */
  //跳转搜索页面
  goSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  // 跳转购物车页面
  toPay() {
    if(this.data.bubble>0){
      wx.navigateTo({
        url: '../submitOrder/submitOrder',
      })
    }else{
      wx.showToast({
        title: '购物车无商品',
        image:'../../assets/page/err.png'
      })
    }
  },
  //初始化取商品列表
  getList() {
    http.request({
      apiName: '/products',
      method: 'GET',
      data: {
        page: 1
      },
      isShowProgress: true,
    }).then((res) => {
      for(var index in res){
        res[index].reshowNum=0
      }
      this.setData({
        goodsList: res
      })
    })
  },
  //加载购物车渲染bubble
  loadList() {
    http.request({
      apiName: '/carts',
      method: 'GET',
      isShowProgress: true,
    }).then((res) => {
      console.log(res)
      if(res.length==0){
        console.log("购物车没有商品")
        var copyList = this.data.goodsList
        for (var item of copyList){
          item.reshowNum=0
        }
        this.setData({
          goodsList:copyList
        })
      }else{
        let copyGoodList = this.data.goodsList;
        for (var index in copyGoodList) {
          // console.log(item.id)
          for (var reshow of res) {
            // console.log(reshow.product_id)
            if (copyGoodList[index].id == reshow.product.id) {
              // console.log(index)
              copyGoodList[index].reshowNum = reshow.quantity;
              // console.log('id:' + copyGoodList[index].id +" quantity"+reshow.quantity)
              this.setData({
                goodsList: copyGoodList
              })
            }
          }
        }
      }
      
      
      //气泡
      this.setData({
        bubble: res.length
      })
    })
  },
  //商品+1
  add(e){
    let productId=e.currentTarget.id; 
    http.request({
      apiName: '/carts',
      method: 'POST',
      data: {
        "product_id": productId,
        "quantity": 1,
      },
      isShowProgress: true,
    }).then((res) => {
      this.loadList()
    })

  },
  //商品-1
  subtract(){
    var num = this.data.quantity;
    this.setData({
      quantity: num -= 1
    })
  }
})