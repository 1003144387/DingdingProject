const {
  globalData
} = getApp();

Page({
  data: {
    //生产组件基本信息列表
    componentList: [],
    index: 0,
    //部件的二维码集合
    goodsCodes: [],
    //扫描到的物品合集（id,name,specification）
    goodsItems: [],
    //生产组件基本信息列表
    produceComponentList: [],
    //生产部件的状态
    componentStatus: true,
    //图片路径
    imagePathList: [],
    //折叠部件信息
    isFold: false,
    //折叠组件信息
    isComponentFold: false,
    //上传后图片的地址
    imagePath: [],
    loading: false

  },
  /**
   * 页面加载时执行
   */
  onLoad() {
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
      goodsCodes: [],
      goodsItems: [],
      componentCodes: [],
      componentItems: []
    })
  },
  /**
   * 获取组件列表
   */
  loadProduceComponentList() {
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produceComponentInfo/list",
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
   * 选择组件事件
   */
  bindPickerChange(e) {
    const {
      value
    } = e.detail;
    //组件装配的组件是同一种类型，所以当组件种类发生变化的时候，置空之前扫描的部件和组件信息
    this.setData({
      index: value,
      goodsCodes: [],
      goodsItems: [],
      componentCodes: [],
      componentItems: []
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
  checkGoods(id) {
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
      goodsCodes,
      goodsItems,
    } = this.data;
    if (goodsCodes.indexOf(code) > -1) {
      dd.alert({content:`${code}已存在，请勿重复扫描!`})
    } else {
      //todo 识别物品
      let goods = this.checkGoods(code);
      if (goods === null) {
        //未出库的部件
        dd.alert({
          content: '未出库的部件',
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
   * 部件折叠事件
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
    })
  },
  /**
   * 扫描组件二维码
   */
  onComponentScanTap(code) {
    let goods = this.checkGoods(code);
    if (goods!==null) {
      dd.showToast({
        type: 'fail',
        content: `扫描的是部件的二维码，请检查!`
      });
      return;
    }
    this.setData({
      componentId: code
    })
  },

  /**
   * 组件信息折叠事件
   */
  ComponentFoldTap() {
    const {
      isComponentFold
    } = this.data;
    this.setData({
      isComponentFold: !isComponentFold
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
      componentList,
      index,
      goodsCodes,
      componentId,
      imagePathList
    } = this.data;
    if (goodsCodes.length === 0) {
      dd.alert({
        content: '未扫描部件'
      });
      return null;
    }
    if (!componentId) {
      dd.alert({
        content: '未扫描组件'
      });
      return null;
    }
    let param = {
      id:componentId,
      componentId: componentList[index].id,
      componentName: componentList[index].name,
      partsCode: goodsCodes.join(","),
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
      this.componentProduce(param)
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
            console.log(JSON.stringify(options))
            _this.componentProduce(options);
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
  componentProduce(param) {
    let url = globalData.baseUrl + "/api/produceComponent/produce";
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
            content: '组件装配完毕',
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