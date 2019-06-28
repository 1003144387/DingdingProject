Component({
  /**
   * 方便复用数据
   */
  mixins: [],
  /**
   * 组件内部数据
   */
  data: {
    code:''
  },
  /**
   * 外部传递的属性
   */
  props: {
    /**
     * 获取扫码的值
     */
    onScan:(data)=>{
      console.log("===scan组件未传入onScan事件===")
    }
  },
  /**
   * 生命周期函数
   */
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  /**
   * 自定义方法
   */
  methods: {
    onTapScan:function(){
      const _this = this;
      dd.scan({
      success: (res) => {
        _this.setData({
          code:res.code
        })
        _this.props.onScan(res.code);
      },
    });
    }
  },
});
