const {globalData} = getApp();
Page({
  data: {
    pageList:[
      {
        icon:"/images/icon/main/inspection.png",
        text:"检验车间",
        path:"/pages/main/inspection/index/index"
      },
      {
        icon:"/images/icon/main/produce.png",
        text:"组装车间",
        path:"/pages/main/produce/index/index",
      },
      {
        icon:"/images/icon/main/stock.png",
        text:"仓库管理",
        path:"/pages/main/stock/index/index"
      },
      // {
      //   icon:"/images/icon/main/purchase.png",
      //   text:"物料采购",
      //   path:"/pages/main/purchase/index/index"
      // },
    ]
  },
  onLoad() {},
  /**
   * 点击宫格跳转
   */
  onGridItemTap(event){
    const {index} = event.detail;
    dd.navigateTo({
      url: this.data.pageList[index].path
    })
  }
});
