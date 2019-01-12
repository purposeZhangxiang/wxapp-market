const http = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    indicatorDots: true,
    autoplay: true,
    interval: 3000, //切换时间
    duration: 1000, //滑动时长
    circular: true, //无缝轮播
    // 促销信息
    goodsList: [],
    bubble: 0,
    //本地购物车
    localCar: [],
    changeSwitch: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getBanner();

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
    this.getList(); //请求商品列表
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    let carList = this.data.localCar;
    console.log(carList)
    if (!carList.length) {
      return
    }
    for (let index in carList) {
      if (carList[index].hasOwnProperty("id") && carList[index].quantity == 0) {
        http.request({
          apiName: '/carts/' + carList[index].id,
          method: 'DELETE',
        }).then((res) => {
          this.setData({
            localCar: []
          })
        })
      } else if (carList[index].hasOwnProperty("id") && carList[index].quantity > 0){
        console.log("修改")
        http.request({
          apiName: '/carts/' + carList[index].id,
          method: 'PUT',
          data: {
            "quantity": carList[index].quantity
          },
        }).then((res) => {
          this.setData({
            localCar: []
          })
        })
      } 
      else {
        console.log("添加")
        // debugger
        http.request({
          apiName: '/carts',
          method: 'POST',
          data: {
            "product_id": carList[index].product_id,
            "quantity": carList[index].quantity,
          },
        }).then((res) => {
          this.setData({
            localCar: []
          })

        })
      }
    }


    // if(this.localCar.length){
    //   this.data.loadCar.forEach((item, index) => {
    //     if (item.hasOwnProperty("id")) {
    //       // console.log(item)
    //       debugger

    //     } else {
    //       // console.log(item)
    //       debugger

    //     }
    //   })
    // }
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
  onReachBottom: function() {},

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
    wx.navigateTo({
      url: '../submitOrder/submitOrder',
    })
    // if (this.data.bubble > 0) {
    //   wx.navigateTo({
    //     url: '../submitOrder/submitOrder',
    //   })
    // } else {
    //   wx.showToast({
    //     title: '购物车无商品',
    //     image: '../../assets/page/err.png'
    //   })
    // }
  },
  //获取轮播图
  getBanner() {
    http.request({
      apiName: '/banners',
      method: 'GET',
    }).then((res) => {
      this.setData({
        bannerList: res
      })
    })
  },
  //初始化取商品列表
  getList() {
    http.request({
      apiName: '/products',
      method: 'GET',
      is_promotion: '1',
      data: {
        page: 1
      },
      isShowProgress: true,
    }).then(res => {
      this.loadCar(res);
    })
  },
  //加载购物车渲染bubble
  // loadList() {
  //   http.request({
  //     apiName: '/carts',
  //     method: 'GET',
  //   }).then((res) => {
  //     if(res.length==0){
  //       var copyList = this.data.goodsList
  //       for (var item of copyList){
  //         item.reshowNum=0
  //       }
  //       this.setData({
  //         goodsList:copyList
  //       })
  //     }else{
  //       let copyGoodList = this.data.goodsList;
  //       for (var index in copyGoodList) {
  //         copyGoodList[index].reshowNum=0;//制空reshowNum属性
  //         for (var reshow of res) {
  //           if (copyGoodList[index].id == reshow.product.id) {
  //             copyGoodList[index].reshowNum = reshow.quantity;//添加字段用来回显数量
  //             copyGoodList[index].shoppingCarId=reshow.id;//添加字段控制减少购物车数量
  //           }
  //         }
  //       }
  //       this.setData({
  //         goodsList: copyGoodList
  //       })
  //     }
  //     this.setData({
  //       bubble: res.length
  //     })
  //   })
  // },
  //单纯加载购物车
  loadCar(goodsList) {
    http.request({
      apiName: '/carts',
      method: 'GET',
    }).then(res => {
      //购物车无商品会显0
      if (res.length == 0) {
        goodsList.forEach(function(item, index) {
          item.reshowNum = 0
        })
        this.setData({
          bubble: 0,
          goodsList: goodsList
        })
      }
      //购物车有商品
      else {
        let localArr = [];
        for (let value of res) {
          let json = {};
          json.id = value.id;
          json.product_id = value.product_id;
          json.quantity = value.quantity
          localArr.push(json)
        }
        this.setData({
          bubble: res.length,
          localCar: localArr
        })
        for (let index in goodsList) {
          goodsList[index].reshowNum = 0
          for (let car of this.data.localCar) {
            if (goodsList[index].id == car.product_id) {
              goodsList[index].reshowNum = car.quantity
            }
          }
        }
        this.setData({
          goodsList: goodsList
        })
        console.log(this.data.localCar)
      }
    })
  },
  //商品+1
  add(e) {
    // let productId = e.currentTarget.id; //商品id
    // let reshowIndex = e.currentTarget.dataset.index; //所添加的index索引
    // let copydata = this.data.goodsList; //复制goodList
    // copydata[reshowIndex].reshowNum += 1;
    // this.setData({
    //   goodsList: copydata
    // })

    // http.request({
    //   apiName: '/carts',
    //   method: 'POST',
    //   data: {
    //     "product_id": productId,
    //     "quantity": 1,
    //   },
    // }).then((res) => {
    //   // this.loadList()
    // })
    // this.setData({
    //   changeSwitch:true
    // })
    /**3种情况 1: +的是原先在数据库里的购物车(有购物车id的) 2: +的是本地购物车里的(有id的) 3：+的是本地购物车(无id的)*/
    let goosId = e.currentTarget.id;
    let copy = this.data.localCar;
    if (!copy.length) {
      let json = {};
      json.product_id = goosId;
      json.quantity = 1;
      copy.push(json)
    } else {
      //购物车有商品
      let swiCh = false;
      for (let index in copy) {
        if (copy[index].product_id == goosId) {
          copy[index].quantity += 1;
          swiCh = true;
          break;
        } else {
          swiCh = false;
        }

      }
      if (!swiCh) {
        // push
        var json = {};
        json.product_id = goosId;
        json.quantity = 1;
        copy.push(json)
        console.log('PUSH!!!')
      }
    }
    this.setData({
      loadCar: copy
    })
    this.reshow()

  },
  //商品-1
  subtract(e) {
    let goodsId = e.currentTarget.id;
    let copy = this.data.localCar;
    for (let index in copy) {
      if (copy[index].product_id == goodsId) {
        copy[index].quantity -= 1;
      }
    }
    this.setData({
      localCar: copy
    })
    this.reshow()
    // let productId = e.currentTarget.id;
    // let reshowIndex = e.currentTarget.dataset.index;
    // let copydata = this.data.goodsList
    // copydata[reshowIndex].reshowNum -= 1
    // this.setData({
    //   goodsList: copydata
    // })
    // let id = e.currentTarget.dataset.id; //购物车id
    // // let nowQuantity = e.currentTarget.dataset.quantity - 1;
    // http.request({
    //   apiName: '/carts/' + id,
    //   method: 'PUT',
    //   data: {
    //     "quantity": copydata[reshowIndex].reshowNum,
    //   },
    // }).then((res) => {
    //   // this.loadList()
    // })

  },
  //input修改
  changeNum(e) {
    let goodsId = e.currentTarget.dataset.id;
    let quantity = parseInt(e.detail.value);
    let copy = this.data.localCar;
    for (let index in copy) {
      if (copy[index].product_id == goodsId) {
        copy[index].quantity = quantity;
      }
    }
    this.setData({
      localCar: copy
    })
    this.reshow()

  },
  reshow() {
    let goodsList = this.data.goodsList;
    let localCar = this.data.localCar
    for (let index in goodsList) {
      for (let i in localCar) {
        if (localCar[i].product_id == goodsList[index].id) {
          goodsList[index].reshowNum = localCar[i].quantity
        }
      }
    }
    this.setData({
      goodsList: goodsList
    })
  }
})