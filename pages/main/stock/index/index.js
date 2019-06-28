Page({
  data: {
    //跳转子页面列表
    pageList:[
      // {
      //   icon:"/images/icon/main_stock/stock_in.png",
      //   text:"入库审批",
      //   path:"/pages/main/stock/stockIn/stockIn"
      // },
      // {
      //   icon:"/images/icon/main_stock/stock_out.png",
      //   text:"出库审批",
      //   path:"/pages/main/stock/stockOut/stockOut",
      // },
      {
        icon:"/images/icon/main_produce/defend.png",
        text:"部件入库",
        path:"/pages/main/stock/stockInParts/stockInParts"
      },
      {
        icon:"/images/icon/main_produce/soft_install.png",
        text:"组件入库",
        path:"/pages/main/stock/stockInComponent/stockInComponent"
      },
      {
        icon:"/images/icon/main_produce/function_inspection.png",
        text:"产品入库",
        path:"/pages/main/stock/stockInProduct/stockInProduct"
      },
      {
        icon:"/images/icon/main_produce/component_produce.png",
        text:"部件出库",
        path:"/pages/main/stock/stockOutParts/stockOutParts"
      },
      {
        icon:"/images/icon/main_produce/component_produce_approve.png",
        text:"组件出库",
        path:"/pages/main/stock/stockOutComponent/stockOutComponent"
      },
      {
        icon:"/images/icon/main_produce/product_produce.png",
        text:"产品发货",
        path:"/pages/main/stock/stockOutProduct/stockOutProduct"
      }
    ]
  },
  onLoad() {},
  /**
   * 宫格点击事件
   */
  onGridItemTap(event){
    const {index} = event.detail;
    /**
     * 页面跳转
     */
    dd.navigateTo({
      url:this.data.pageList[index].path
    })
  }
});
