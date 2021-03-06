const http = require('../../utils/request.js');
const app = getApp();
import {
    submitLocalCar,
    computed,
    getStoreName
} from '../../utils/globalFunc.js'
Page({
    /**
     * 页面的初始数据
     */
    data: {
        winHeight: 0,
        // tab切换
        currentTab: 0,
        allOrder: [], //全部
        waitPay: [], //待付款
        waitReceive: [], //待收货
        already: [], //已完成

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.getSystemInfo({
            success: res => {
                this.setData({
                    winHeight: (res.windowHeight * (750 / res.windowWidth))
                });
            }
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //收到tabIndex说明付款成功-->进入待收货列表
        let tabIndex = getApp().globalData.tabIndex;
        if (tabIndex) {
            this.setData({
                currentTab: tabIndex
            })
        }
        getApp().globalData.tabIndex = undefined;
        this.getOrderList(this.data.currentTab);

        getStoreName()
        // wx.setNavigationBarTitle({
        //   title: `订单(${app.globalData.current_store})`
        // })
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
    //获取订单列表
    getOrderList(current) {
        http.request({
            apiName: '/orders',
            method: 'GET',
            data: {
                status: current
            },
            isShowProgress: true,
        }).then((res) => {
            if (res.length > 0) {
                //全部订单
                if (current == 0) {
                    this.setData({
                        allOrder: res
                    })
                }
                //待付款订单
                else if (current == 1) {
                    this.setData({
                        waitPay: res
                    })
                }
                //代收货订单
                else if (current == 2) {
                    this.setData({
                        waitReceive: res
                    })
                }
                //已完成订单
                else if (current == 3) {
                    this.setData({
                        already: res
                    })
                }
            } else {
                wx.showToast({
                    title: "无订单信息",
                    icon: "none",
                })
                //全部订单
                if (current == 0) {
                    this.setData({
                        allOrder: res
                    })
                }
                //待付款订单
                else if (current == 1) {
                    this.setData({
                        waitPay: res
                    })
                }
                //代收货订单
                else if (current == 2) {
                    this.setData({
                        waitReceive: res
                    })
                }
                //已完成订单
                else if (current == 3) {
                    this.setData({
                        already: res
                    })
                }
            }
        })
    },
    // 滑动切换选项卡
    bindChange: function (e) {
        this.setData({
            currentTab: e.detail.current
        });
        this.getOrderList(this.data.currentTab)
    },
    //点击切换选项卡
    swichNav: function (e) {
        /*注释：e.target.dataset.current--点击传递过来的tabIndex*/
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            this.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    //立即支付
    buyNow(e) {
        let orderId = e.currentTarget.dataset.orderid
        let amount = e.currentTarget.dataset.amount
        wx.navigateTo({
            url: '../orderDetail/orderDetail?param=' + orderId + '&amount=' + amount,
        })
    },
    //再来一单子
    buyAgain(e) {
        http.request({
            apiName: '/orders/again',
            method: 'POST',
            data: {
                order_id: e.currentTarget.dataset.orderid
            },
            isShowProgress: true,
        }).then(res => {
            wx.navigateTo({
                url: '../submitOrder/submitOrder',
            })
        })
    },
    //取消订单
    cancelOrder(e) {
        http.request({
            apiName: '/orders/cancel',
            method: 'POST',
            data: {
                order_id: e.currentTarget.dataset.orderid
            },
        }).then(res => {
            this.getOrderList(this.data.currentTab)
        })
            .catch(err => {
                wx.showToast({
                    title: err,
                    icon: "none"
                })
            })
    },
    //车辆跟踪
    viewTrack(e){
        var v = e.target.dataset.vehicle;
        wx.navigateTo({
            url: '../map/truck?vehicle=' + v,
        })
    }

})