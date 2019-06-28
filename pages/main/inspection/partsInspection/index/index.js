const {
  globalData
} = getApp();
 
Page({
  data: {
    //生产部件基本信息列表
    producePartsList: [],
    index: 0,
    //生产部件的二维码集合
    partsCodes: [],
    partsItems: [],
    //生产部件的规格
    specification: 1,
    //生产部件的数量
    number: 0,
    //生产部件的状态
    partsStatus: true,
    //图片路径
    imagePathList: [],
    isFold: false,
    //上传后图片的地址
    imagePath: [],
    loading:false

  },
  /**
   * 页面加载时执行
   */
  onLoad() {
    this.loadProducePartsList();
  },
  /**
   * 页面每次显示时调用
   */
  onShow(){
    this.setData({
      imagePath:[],
      imagePathList:[],
      partsCodes: [],
      partsItems: []
    })
  },
  loadProducePartsList() {
    //  获取部件列表
    dd.httpRequest({
      url: globalData.baseUrl + "/api/produceParts/list/simple",
      headers:{
        Authorization:dd.getStorageSync({key: "userInfo"}).data.token,
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            producePartsList: res.data.data
          })
        }
      }
    })
  },
  /**
   * 选择部件事件
   */
  bindPickerChange(e) {
    const {
      value
    } = e.detail;
    //来料检验的部件是同一种类型，所以当部件种类发生变化的时候，置空partsItems和partsCodes
    this.setData({
      index: value,
      partsCodes: [],
      partsItems: []
    });
  },
  /**
   * 扫描部件二维码
   */
  onScanTap(code) {

    let {
      partsCodes,
      producePartsList,
      index,
      partsItems,
      specification,
      number
    } = this.data;
    if (partsCodes.indexOf(code) > -1) {
      dd.showToast({
        type: 'fail',
        content: `${this.data.producePartsList[index].name}:${code}已存在，请勿重复扫描!`
      })
    } else {
      partsCodes.push(code);
      let obj = {
        name: producePartsList[index].name,
        code: code
      };
      partsItems.push(obj);
      this.setData({
        partsCodes,
        partsItems,
        number: partsCodes.length*specification
      })
    }
    // console.log(JSON.stringify(partsItems)+partsCodes);
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
  cancelItemTap(e){
    const {index} = e.currentTarget.dataset;
    let {partsItems,partsCodes,specification} = this.data;
    partsItems.splice(index,1);
    partsCodes.splice(index,1);
    this.setData({
      partsItems,partsCodes,number: partsCodes.length*specification
    })
  },
  /**
   * 填写规格
   */
  specificationOnChange(e) {
    const {
      value
    } = e.detail;
    const {
      partsCodes
    } = this.data;
    let number = value * partsCodes.length;
    this.setData({
      specification: e.detail.value,
      number
    })
  },
  /**
   * 物料状态改变
   */
  partsStatusOnChange(e) {
    this.setData({
      partsStatus: e.detail.value
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
      producePartsList,
      index,
      partsCodes,
      specification,
      number,
      partsStatus,
      imagePathList
    } = this.data;
    if (partsCodes.length === 0) {
      dd.alert({
        content: '未扫描物料'
      });
      return null;
    }
    let param = {
      partsId: producePartsList[index].id,
      partsName: producePartsList[index].name,
      partsCodes: partsCodes.join(","),
      partsStatus: partsStatus ? 0 : 1,
      specification: value.specification,
      number,
      userId:globalData.user.userId,
      deptId:globalData.user.deptId,
      operator: dd.getStorageSync({
        key: "userInfo"
      }).data.user.username,
      remark: value.remark,

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
      this.producePartsInspectionApprove(param)
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
            _this.producePartsInspectionApprove(options);
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
  producePartsInspectionApprove(param) {
    let url = globalData.baseUrl + "/api/producePartsApprove";
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
            content:'来料检验审批实例发送成功',
            success:function(){
              dd.reLaunch({
                url:'/pages/main/inspection/index/index'
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
        _this.setData({loading:false,imagePathList:[], imagePath: []})
      }
    });
  }
});