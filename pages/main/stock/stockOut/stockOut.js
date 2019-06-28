const {
  globalData
} = getApp();

Page({
  data: {
    //生产部件基本信息列表
    goodsList: [{
        name: '部件',
        value: 0
      },
      {
        name: '组件',
        value: 1
      },
      {
        name: '产品',
        value: 2
      }
    ],
    index: 0,
    //物品的二维码集合
    goodsCodes: [],
    //扫描到的物品合集（id,name,specification）
    goodsItems: [],
    //物品领取人员
    receivePeople:null,
    //物品去向
    receiveAddress:null,
    //生产部件的数量
    number: 0,
    //待出库的部件列表
    partsList: [],
    //待出库的组件列表
    componentList: [],
    //待出库的产品列表
    productList: [],
    //图片路径
    imagePathList: [],
    isFold: false,
    //上传后图片的地址
    imagePath: [],
    //提交按钮loading状态
    loading:false

  },
  /**
   * 页面加载时执行
   */
  onLoad() {
    this.getPartsList();
    this.getComponentList();
    this.getProductList();
  },
 /**
   * 页面每次显示时调用
   */
  onShow(){
    this.setData({
      goodsCodes: [],
      //扫描到的产品合集（id,name,specification）
      goodsItems: [],
      imagePath:[],
      imagePathList:[]
    })
  },
  /**
   * 选择物品类别事件
   */
  bindPickerChange(e) {
    const {
      value
    } = e.detail;
    //当物品类别发生变化时，置空物品的二维码的合集和物品条目合集，物品数量为0
    this.setData({
      index: value,
      goodsCodes: [],
      goodsItems: [],
      number:0
    });
  },
  /**
   * 获取库存中待出库的部件列表
   */
  getPartsList() {
    const _this = this;
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produceParts/stock/in/list",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: function (res) {
        if (res.status === 200) {
          _this.setData({
            partsList: res.data.data
          })
        }
      }
    })
  },
  /**
   * 获取库存中待出库的组件列表
   */
  getComponentList() {
    const _this = this;
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produceComponent/stockIn/list",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: function (res) {
        if (res.status === 200) {
          _this.setData({
            componentList: res.data.data
          })
        }
      }
    })
  },
  /**
   * 获取库存中待出库的产品列表
   */
  getProductList() {
    const _this = this;
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produce/product/waittingStockOutApprove/list",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: function (res) {
        if (res.status === 200) {
          _this.setData({
            productList: res.data.data
          })
        }
      }
    })
  },
  /**
   * 识别物品
   */
  checkGoods(id) {
    const {
      index,
      partsList,
      componentList,
      productList
    } = this.data;
    let goods = null;
    switch (index) {
      case 0:
        {
          //扫描的是部件
          for (let i = 0; i < partsList.length; i++) {
            if (partsList[i].id === id) {
              goods = {
                id: partsList[i].id,
                name: partsList[i].name,
                specification: partsList[i].specification
              };
            }
          }
          break;
        }
      case 1:
        {
          //扫描的是组件
          for (let i = 0; i < componentList.length; i++) {
            if (componentList[i].id === id) {
              goods = {
                id: componentList[i].id,
                name: componentList[i].name,
                specification: 1
              };
            }
          }
          break;
        }
      case 2:
        {
          //扫描的是产品
          for (let i = 0; i < productList.length; i++) {
            if (productList[i].id === id) {
              goods = {
                id: productList[i].id,
                name: productList[i].name,
                specification: 1
              };
            }
          }
          break;
        }
      default:
        {
          break;
        }
    }
    return goods;
  },
  /**
   * 扫描物品二维码
   */
  onScanTap(code) {
    let {
      goodsCodes,
      goodsItems,
    } = this.data;
    if (goodsCodes.indexOf(code) > -1) {
      dd.alert({content:`${code}已存在，请勿重复扫描!`})
    } else {
      //todo 识别物品
      let goods = this.checkGoods(code);
      if (goods === null) {
        //不合格的物品
        dd.alert({
          content: '该物品不在库存中',
        })
        return;
      }
      goodsCodes.push(code);
      let obj = {
        name: goods.name,
        code: code,
        specification:goods.specification
      };
      goodsItems.push(obj);
      this.setData({
        goodsCodes,
        goodsItems,
        number: goodsCodes.length*goods.specification
      })
    }
  },
  /**
   * 折叠事件
   */
  foldTap() {
    const {
      isFold
    } = this.data;
    this.setData({
      isFold: !isFold
    })
  },
  /**
   * 删除部件
   */
  cancelItemTap(e) {
    const {
      index
    } = e.currentTarget.dataset;
    let {
      goodsItems,
      goodsCodes
    } = this.data;
    goodsItems.splice(index, 1);
    goodsCodes.splice(index, 1);
    this.setData({
      goodsItems,
      goodsCodes,
      number: goodsCodes.length
    })
  },
  /**
   * 选择图片
   */
  chooseImageTap() {
    dd.chooseImage({
      count: 5,
      success: (res) => {
        const {
          imagePathList
        } = this.data;
        res.apFilePaths.map(item => (imagePathList.push(item)))
        this.setData({
          imagePathList
        })
      }
    })
  },

  /**
   * 图片点击事件
   */
  imageTap(e) {
    const {
      index
    } = e.currentTarget.dataset;
    const _this = this;
    dd.confirm({
      title: '温馨提示',
      content: '您是否想删除所选的图片',
      confirmButtonText: '马上删除',
      cancelButtonText: '暂不需要',
      success: (result) => {
        if (result.confirm) {
          const {
            imagePathList
          } = _this.data;
          imagePathList.splice(index, 1);
          _this.setData({
            imagePathList
          })
        }
      },
    })
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const {
      index
    } = e.currentTarget.dataset;
    const {
      imagePathList
    } = this.data;
    const _this = this;
    dd.previewImage({
      current: index,
      urls: imagePathList[index].split(",")
    });
  },

  /**
   * 提交表单
   */
  onSubmitTap(event) {
    const {
      value
    } = event.detail;
    const {
      goodsCodes,
      number,
      imagePathList,
      goodsItems,
      goodsList,
      index
    } = this.data;
    if (goodsCodes.length === 0) {
      dd.alert({
        content: '未扫描物品'
      });
      return null;
    }
    if(value.receivePeople===null){
      let msg = null;
      index===2?msg="未填写收货人员":msg="未填写领取人员"
      dd.alert({content:msg});
      return;
    }
    if(value.receiveAddress===null){
      let msg = null;
      index===2?msg="未填写收货地址":msg="未填写物料去向"
      dd.alert({content:msg});
      return;
    }
    let param = {
      typeName: goodsItems[0].name,
      goodsType:goodsList[index].value,
      codes: goodsCodes.join(","),
      number,
      userId: globalData.user.userId,
      deptId: globalData.user.deptId,
      operator: dd.getStorageSync({key: "userInfo"}).data.user.username,
      remark: value.remark,
      receivePeople:value.receivePeople,
      receiveAddress:value.receiveAddress
    }
    this.setData({loading:true})
    if (imagePathList.length > 0) {
      //有图片，上传图片
      let url = globalData.baseUrl + "/api/file/upload/app";
      let filePath = imagePathList;
      let options = param;
      this.uploadImage({
        url,
        filePath,
        options
      });
    } else {
      //无图片直接上传
      this.produceStockOutApprove(param)
    }
  },
  /**
   * 批量上传图片
   */
  uploadImage(param) {
    let i = param.i ? param.i : 0;
    const _this = this;
    dd.uploadFile({
      url: param.url,
      filePath: param.filePath[i],
      fileName: 'file',
      fileType: 'image',
      header: {
        'content-type': ''
      },
      success: function (res) {
        if (res.statusCode === 200) {
          let data = JSON.parse(res.data);
          let list = _this.data.imagePath;
          list.push(data.data);
          _this.setData({
            imagePath: list
          });
          if (i === param.filePath.length - 1) {
            let options = param.options;
            options['image'] = _this.data.imagePath.join(";");
            console.log(JSON.stringify(options))
            _this.produceStockOutApprove(options);
          } else {
            i++;
            param["i"] = i;
            _this.uploadImage(param)
          }
        } else {
          console.log("文件上传失败")
        }
      }
    });
  },
  /**
   * 生产物品出库审批提交
   */
  produceStockOutApprove(param) {
    const _this = this;
    let url = globalData.baseUrl + "/api/produce/stockOut/add";
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        ...param
      },
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: (res) => {
        if (res.data.code === 0) {
          dd.showToast({
            content: '物品出库审批提交成功',
            success: function () {
              dd.navigateBack({
                delta:1
              })
            }
          })

        } else {
          dd.showToast({
            content: res.data.msg
          })
        }
      },
      complete:function(){
        _this.setData({loading:false})
      }
    });
  }
});