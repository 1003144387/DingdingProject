Page({
  data: {
    //跳转子页面列表
    pageList:[
      {
        icon:"/images/icon/main_inspection/parts-inspection.png",
        text:"来料检验",
        path:"/pages/main/inspection/partsInspection/index/index"
      },
      {
        icon:"/images/icon/main_inspection/component-inspection.png",
        text:"组件检验",
        path:"/pages/main/inspection/componentInspectionApprove/index/index"
      },
      {
        icon:"/images/icon/main_inspection/product_inspection_approve.png",
        text:"产品检验",
        path:"/pages/main/inspection/productInspection/productInspection",
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
