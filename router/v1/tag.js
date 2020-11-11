const express = require('express')
const router = express.Router()
const ResponseUtils = require('../../utils/response_utils')
const DatabaseUtils = require('../../utils/database_utils')
const FormatUtils = require('../../utils/format_utils')
const CommonRouterAuthHandler = require('./common/auth')

router.use(CommonRouterAuthHandler.authKey) // 检查 key 是否合法

router.post('/add', async function(req, res) {
    // 参数的解析
    const requestBody = req.body
    let parentID = requestBody['parent_id']
    let userID = req.auth['user_id']
    let name = requestBody['name']
    let color = requestBody['color']
    let icon = requestBody['icon']
    // 参数校验
    if (FormatUtils.isEmpty(name)){
        res.send(ResponseUtils.createFailResponse(400, '参数错误，缺少标签名称'))
        return
    }
    if (FormatUtils.isEmpty(userID)){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误，请返回重新登录'))
    }
    // TODO 颜色参数校验
    // 写入数据库
    let databaseResult = await DatabaseUtils.tagInsert(parentID, userID, name, color, icon, '{}')
    if (databaseResult.isSuccess){
        res.send(ResponseUtils.createSuccessResponse('创建标签成功'))
    } else {
        res.send(ResponseUtils.createFailResponse(500 , '创建标签失败'))
    }
})

module.exports = router