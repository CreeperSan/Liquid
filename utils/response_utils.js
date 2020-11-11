module.exports = {
    CODE_SUCCESS : 200,
    CODE_REQUEST_PARAMS_ERROR : 400,

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

}