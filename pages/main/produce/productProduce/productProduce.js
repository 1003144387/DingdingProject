const {
  globalData
} = getApp();

Page({
  data: {
    //生产产品基本信息列表
    productList: [],
    index: 0,
    //部件的二维码集合
    partsCodes: [],
    //扫描到的物品合集（id,name,specification）
    partsItems: [],
    // 可用于生产的部件合集
    partsList:[],
    //生产组件的二维码合集
    componentCodes: [],
    //生产组件的物品合集
    componentItems:[],
    //可用于生产的组件合集
    componentList:[],
    //生产产品的二维码合集
    productCodes:[],
    //生产产品的物品合集
    productItems:[],
    //图片路径
    imagePathList: [],
    //折叠部件信息
    isPartsFold: false,
    //折叠组件信息
    isComponentFold: false,
    //折叠产品信息
    isProductFold:false,
    //产品id
    productId:null,
    //上传后图片的地址
    imagePath: [],
    loading: false

  },
  /**
   * 页面加载时执行
   */
  onLoad() {
    this.loadProduceProductList();
    this.loadProducePartsList();
    this.loadProduceComponentList();
  },
   /**
   * 页面每次显示时调用
   */
  onShow(){
    this.setData({
      imagePath:[],
      imagePathList:[],
      partsCodes: [],
      partsItems: [],
      componentCodes: [],
      componentItems: [],
      productCodes:[],
      productItems:[]
    })
  },
  /**
   * 获取产品基本信息列表
   */
  loadProduceProductList(){
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produce/productInfo/list",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            productList: res.data.data
          })
        }
      }
    })
  },
  /**
   * 选择产品事件
   */
  bindPickerChange(e) {
    const {
      value
    } = e.detail;
    //产品装配的组件是同一种类型，所以当产品种类发生变化的时候，置空之前扫描的部件和组件信息
    this.setData({
      index: value,
      partsCodes: [],
      partsItems: [],
      componentCodes: [],
      componentItems: [],
      productCodes:[],
      productItems:[]
    });
  },
  /**
   * 获取已出库未被使用的部件列表
   */
  loadProducePartsList() {

    dd.httpRequest({
      url: globalData.baseUrl + "/api/produceParts/stockOutUnUsed/list",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            partsList: res.data.data
          })
        }
      }
    })
  },
  /**
   * 识别部件
   */
  checkParts(id) {
    const {
      partsList,
    } = this.data;
    let goods = null;
    for (let i = 0; i < partsList.length; i++) {
      if (partsList[i].id === id) {
        goods = {
          id: partsList[i].id,
          name: partsList[i].name,
          specification: partsList[i].specification
        };
      }
    }
    return goods;
  },
  /**
   * 扫描部件二维码
   */
  onScanPartsTap(code) {
    let {
      partsCodes,
      partsItems,
    } = this.data;
    if (partsCodes.indexOf(code) > -1) {
      dd.alert({
        content: `部件${code}已存在，请勿重复扫描!`
      })
    } else {
      //识别部件
      let goods = this.checkComponent(code);
      if(goods!==null){
         //扫描的是组件的二维码
         dd.alert({
          content: '扫描的是组件的二维码，请检查！',
        })
        return;
      }
      goods = this.checkParts(code);
      if (goods === null) {
        //未出库的部件
        dd.alert({
          content: '未出库的部件',
        })
        return;
      }
      partsCodes.push(code);
      let obj = {
        name: goods.name,
        code: code,
        specification: goods.specification
      };
      partsItems.push(obj);
      this.setData({
        partsCodes:partsCodes,
        partsItems:partsItems
      })
    }
  },

  /**
   * 部件折叠事件
   */
  partsFoldTap() {
    const {
      isPartsFold
    } = this.data;
    this.setData({
      isPartsFold: !isPartsFold
    })
  },
  /**
   * 删除部件
   */
  cancelPartsItemTap(e) {
    const {
      index
    } = e.currentTarget.dataset;
    let {
      partsItems,
      partsCodes
    } = this.data;
    partsItems.splice(index, 1);
    partsCodes.splice(index, 1);
    this.setData({
      partsItems,
      partsCodes,
    })
  },
  /**
   * 获取检验合格未被使用的组件列表
   */
  loadProduceComponentList() {
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produceComponent/afterInspectionUnuse/list",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            componentList: res.data.data
          })
        }
      }
    })
  },
   /**
   * 识别部件
   */
  checkComponent(id) {
    const {
      componentList,
    } = this.data;
    let goods = null;
    for (let i = 0; i < componentList.length; i++) {
      if (componentList[i].id === id) {
        goods = {
          id: componentList[i].id,
          name: componentList[i].name,
          specification: 1
        };
      }
    }
    return goods;
  },
  /**
   * 扫描组件二维码
   */
  onComponentScanTap(code) {
    let {
      componentCodes,
      componentItems
    } = this.data;
    if (componentCodes.indexOf(code) > -1) {
      dd.alert({
        content: `组件${code}已存在，请勿重复扫描!`
      })
      return ;
    } else {
      let goods = this.checkParts(code);
      if (goods !== null) {
        //扫描的是部件的二维码
        dd.alert({
          content: '扫描的是部件的二维码，请检查！',
        })
        return;
      }
      goods = this.checkComponent(code);
      if(goods===null){
        //未检验合格的组件
        dd.alert({
          content: '未检验合格的组件',
        })
        return;
      }
      componentCodes.push(code);
      let obj = {
        name: goods.name,
        code: code,
        specification: goods.specification
      };
      componentItems.push(obj);
      this.setData({
        componentCodes,
        componentItems
      })
    }
  },

  /**
   * 组件信息折叠事件
   */
  componentFoldTap() {
    const {
      isComponentFold
    } = this.data;
    this.setData({
      isComponentFold: !isComponentFold
    })
  },
   /**
   * 删除组件
   */
  cancelComponentItemTap(e) {
    const {
      index
    } = e.currentTarget.dataset;
    let {
      componentItems,
      componentCodes
    } = this.data;
    componentItems.splice(index, 1);
    componentCodes.splice(index, 1);
    this.setData({
      componentItems,
      componentCodes,
    })
  },
  /**
   * 扫描产品二维码
   */
  onProductScanTap(code){
    let goods = this.checkParts(code);
    if(goods!==null){
      dd.alert({content:'扫描的是部件的二维码，请检查！'});
      return;
    }
    goods = this.checkComponent(code);
    if(goods!=null){
      dd.alert({content:'扫描的是组件的二维码，请检查！'});
      return;
    }
    this.setData({
      productId:code
    })
  },
  /**
   * 产品信息折叠事件
   */
  productFoldTap() {
    const {
      isProductFold
    } = this.data;
    this.setData({
      isProductFold: !isProductFold
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
      productList,
      index,
      partsCodes,
      componentCodes,
      productId,
      imagePathList
    } = this.data;
    if (!productId) {
      dd.alert({
        content: '未扫描产品编号'
      });
      return null;
    }
    if(partsCodes.length===0&&componentCodes.length===0){
      dd.alert({content:'至少选择一个部件或组件'})
    }
    let param = {
      id: productId,
      productId: productList[index].id,
      productName: productList[index].name,
      partsCode: partsCodes.join(","),
      componentCode:componentCodes.join(","),
      userId: globalData.user.userId,
      deptId: globalData.user.deptId,
      produceOperator: dd.getStorageSync({
        key: "userInfo"
      }).data.user.username,
      produceRemark: value.remark,

    }
    this.setData({
      loading: true
    })
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
      this.productProduce(param)
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
            options['produceImage'] = _this.data.imagePath.join(";");
            _this.productProduce(options);
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
   * 组件装配完成
   */
  productProduce(param) {
    console.log(param)
    let url = globalData.baseUrl + "/api/produce/product/produce";
    const _this = this;
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
            content: '产品装配完毕',
            success: function () {
              dd.navigateBack({
                delta: 1
              })
            }
          })

        } else {
          dd.showToast({
            content: res.data.msg
          })
        }
      },
      complete: function () {
        _this.setData({
          loading: false
        })
      }
    });
  }
});