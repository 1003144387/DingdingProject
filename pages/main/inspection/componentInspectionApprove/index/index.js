const {
  globalData
} = getApp();

Page({
  data: {
    //物品的二维码集合
    goodsCodes: [],
    //扫描到的物品合集（id,name）
    goodsItems: [],
    //生产组件的数量
    number: 0,
    //待检验审批的组件列表
    componentList: [],
    //图片路径
    imagePathList: [],
    isFold: false,
    //上传后图片的地址
    imagePath: [],
    //提交按钮loading状态
    loading:false,
    componentStatus:true

  },
  /**
   * 页面加载时执行
   */
  onLoad() {
    this.loadComponentList();
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
    })
  },
  loadComponentList() {
    //  获取组件列表
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produceComponent/unInspection/list",
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
   * 识别物品
   */
  checkGoods(id) {
    const {
      componentList,
    } = this.data;
    let goods = null;
    for (let i = 0; i < componentList.length; i++) {
      if (componentList[i].id === id) {
        goods = {
          id: componentList[i].id,
          name: componentList[i].name
        };
      }
    }
    return goods;
  },
  /**
   * 扫描组件二维码
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
        //未装配的组件
        dd.alert({
          content: '未装配的组件',
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
   * 删除组件
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
  componentStatusOnChange(e) {
    this.setData({
      componentStatus: e.detail.value
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
      componentStatus
    } = this.data;
    if (goodsCodes.length === 0) {
      dd.alert({
        content: '未扫描组件'
      });
      return null;
    }
    let param = {
      componentName: goodsItems[0].name,
      codes: goodsCodes.join(","),
      number,
      status:componentStatus?0:1,
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
      this.componentInspectionApprove(param)
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
            _this.componentInspectionApprove(options);
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
  componentInspectionApprove(param) {
    let url = globalData.baseUrl + "/api/produceComponent/inspectionApprove";
    const _this = this;
    dd.httpRequest({
      url: url,
      method: 'POST',
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      data: {
        ...param
      },
      // headers: headers,
      success: (res) => {
        if(res.data.code===0){
          dd.showToast({
            content:'组件检验审批发送成功',
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