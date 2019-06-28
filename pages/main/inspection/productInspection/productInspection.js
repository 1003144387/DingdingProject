const {
  globalData
} = getApp();

Page({
  data: {
    //物品的二维码集合
    goodsCodes: [],
    //扫描到的物品合集（id,name）
    goodsItems: [],
    //生产产品的数量
    number: 0,
    //待检验审批的产品列表
    productList: [],
    //图片路径
    imagePathList: [],
    isFold: false,
    //上传后图片的地址
    imagePath: [],
    //提交按钮loading状态
    loading:false,
    status:true

  },
  /**
   * 页面加载时执行
   */
  onLoad() {
    this.loadProductList();
  },
   /**
   * 页面每次显示时调用
   */
  onShow(){
    this.setData({
      goodsCodes: [],
      goodsItems: [],
      imagePath:[],
      imagePathList:[]
    })
  },
  loadProductList() {
    //  获取产品列表
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produce/product/waittingInspectionApprove/list",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: (res) => {
        console.log(res.data);
        if (res.data.code === 0) {
          this.setData({
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
      productList,
    } = this.data;
    console.log(id);
    let goods = null;
    for (let i = 0; i < productList.length; i++) {
      if (productList[i].id === id) {
        goods = {
          id: productList[i].id,
          name: productList[i].name
        };
      }
    }
    return goods;
  },
  /**
   * 扫描产品二维码
   */
  onScanTap(code) {
    let {
      goodsCodes,
      goodsItems,
    } = this.data;
    if (goodsCodes.indexOf(code) > -1) {
      dd.alert({content:`产品${code}已存在，请勿重复扫描!`})
    } else {
      let goods = this.checkGoods(code);
      if (goods === null) {
        //未装配的产品
        dd.alert({
          content: '未装配的产品',
        })
        return;
      }
      goodsCodes.push(code);
      let obj = {
        name: goods.name,
        code: code
      };
      goodsItems.push(obj);
      this.setData({
        goodsCodes,
        goodsItems,
        number: goodsCodes.length
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
   * 删除产品
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
   * 产品状态改变
   */
  productStatusOnChange(e) {
    this.setData({
      status: e.detail.value
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
      goodsCodes,
      number,
      imagePathList,
      goodsItems,
      status
    } = this.data;
    if (goodsCodes.length === 0) {
      dd.alert({
        content: '未扫描产品'
      });
      return null;
    }
    let param = {
      productName: goodsItems[0].name,
      codes: goodsCodes.join(","),
      number,
      status:status?0:1,
      userId: globalData.user.userId,
      deptId: globalData.user.deptId,
      operator: dd.getStorageSync({key: "userInfo"}).data.user.username,
      remark: value.remark
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
      this.productInspectionApprove(param)
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
          _this.setData({imagePath:list});
          if (i === param.filePath.length - 1) {
            let options = param.options;
            options['image'] = _this.data.imagePath.join(";");
            console.log(JSON.stringify(options))
            _this.productInspectionApprove(options);
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
   * 来料检验审批
   */
  productInspectionApprove(param) {
    let url = globalData.baseUrl + "/api/produce/product/inspection/approve";
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
        if(res.data.code===0){
          dd.showToast({
            content:'产品检验审批提交成功',
            success:function(){
              dd.navigateBack({
                delta:1
              })
            }
          })
          
        }else{
          dd.showToast({
            content:res.data.msg
          })
        }
      },
      complete:function(){
        _this.setData({loading:false})
      }
    });
  }
});