module.exports = {
    CODE_SUCCESS : 200,
    CODE_REQUEST_PARAMS_ERROR : 400,
    CODE_NOT_LOGIN : 401,

    createResponse : function (code, message, data) {
        return JSON.stringify({
            code : code,
            message : message,
            data : data
        })
    },


    createFailResponse : function (code, message) {
        let response = this.createResponse(code, message)
        delete response.data
        return response
    },

    createSuccessResponse : function (data) {
        let response = this.createResponse(this.CODE_SUCCESS, '操作成功', data)
        if (!data){
            delete response.data
        }
        return response
    },

    /**
     * 提示客户端需要登录
     */
    createNotLoginResponse : function () {
        return this.createResponse(this.CODE_NOT_LOGIN, '您尚未登录，请先登录再进行操作')
    },

    /**
     * 提示客户端登录咋混改超时
     */
    createLoginExpireResponse : function () {
        return this.createResponse(this.CODE_NOT_LOGIN, '登录状态已过期，请重新登录')
    },

    /**
     * 提示请求缺少时区信息
     */
    createTimezoneErrorResponse : function () {
        return this.createResponse(this.CODE_REQUEST_PARAMS_ERROR, '缺少时区信息')
    }

}