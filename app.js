import {
  url
} from "./config/systemConfig";
App({
  onLaunch(options) {

    //获取corpId
    this.globalData.corpId = options.query.corpId;
    console.log(options.query.corpId);
    this.login();

  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
  globalData: {
    corpId: '',
    baseUrl: url,
    user:null
  },
  login() {
    const _this = this;
    dd.getAuthCode({
      success: (res) => {
        const authCode = res.authCode;
        dd.httpRequest({
          url:url + '/login/app',
          data: {
            authCode
          },
          method: 'POST',
          success: (res) => {
            if (res.data.code === 0) {
              //登录成功
              const {data} = res.data;
              _this.globalData.user = {
                userId:data.user.userId,
                deptId:data.user.deptId
              }
              dd.setStorage({
                key: 'userInfo',
                data: {
                  user: data.user,
                  roleAndPermission:data.roleAndPermission,
                  token:data.token
                }
              })
            }
          }
        })
      },
      fail: (err) => {
        dd.alert({
          content: JSON.stringify(err)
        })
      }
    })
  }
});