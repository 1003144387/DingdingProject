Page({
  data: {
    //跳转子页面列表
    pageList:[
      {
        icon:"/images/icon/main_produce/defend.png",
        text:"三防审批",
        path:"/pages/main/produce/defendApprove/defendApprove"
      },
      {
        icon:"/images/icon/main_produce/soft_install.png",
        text:"软件灌装及设备校准",
        path:"/pages/main/produce/softInstallApprove/softInstallApprove"
      },
      {
        icon:"/images/icon/main_produce/function_inspection.png",
        text:"部件功能检测",
        path:"/pages/main/produce/functionInspectionApprove/functionInspectionApprove"
      },
      {
        icon:"/images/icon/main_produce/component_produce.png",
        text:"组件装配",
        path:"/pages/main/produce/componentProduce/componentProduce"
      },
      {
        icon:"/images/icon/main_produce/component_produce_approve.png",
        text:"组件装配审批",
        path:"/pages/main/produce/componentProduceApprove/componentProduceApprove"
      },
      {
        icon:"/images/icon/main_produce/product_produce.png",
        text:"产品装配",
        path:"/pages/main/produce/productProduce/productProduce"
      },
      {
        icon:"/images/icon/main_produce/product_produce_approve.png",
        text:"产品装配审批",
        path:"/pages/main/produce/productProduceApprove/productProduceApprove"
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
