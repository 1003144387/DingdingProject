export default class UploadModal {
    constructor() {
    }
    data = {
        imagePath: []
    }
    uploadImage(param) {
        let i = param.i ? param.i : 0;
        const _this = this;
        dd.uploadFile({
            url: param.url,
            filePath: param.filePath[i],
            fileName: 'file',
            fileType: 'image',
            header:{
                'content-type':''
            },
            success: function (res) {
                console.log(JSON.stringify(res))
                if (res.statusCode === 200) {
                    let data = JSON.stringify(res.data);
                    _this.data.imagePath.push(data.data);
                    if(i===param.filePath.length-1){
                        
                    }else{
                        i++;
                        param["i"]=i;
                        _this.uploadImage(param)
                    }
                }else{
                    console.log("文件上传失败")
                }
            }
        });
    }
}