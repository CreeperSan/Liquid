const express = require('express')
const router = express.Router()
const ResponseUtils = require('../../utils/response_utils')
const DatabaseUtils = require('../../utils/database_utils')
const FormatUtils = require('../../utils/format_utils')
const CommonRouterAuthHandler = require('./common/auth')

// 不允许重名对象

router.use(CommonRouterAuthHandler.authKey) // 检查 key 是否合法

/**
 * 获取对象列表
 */
router.post('/list', async function(req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    // 查询列表
    let databaseResult = await DatabaseUtils.targetGetList(userID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    let targetList = databaseResult.data
    for (let index in targetList){
        let targetItem = targetList[index]
        targetItem.id = targetItem._id
        delete targetItem._id
        delete targetItem.user_id
        delete targetItem.extra_info
    }
    res.send(ResponseUtils.createSuccessResponse(targetList))
})

/**
 * 添加对象
 */
router.post('/add', async function(req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    let requestBody = req.body
    let targetName = requestBody['name']
    // 参数检查
    if (FormatUtils.isEmpty(targetName)){
        res.send(ResponseUtils.createFailResponse(ResponseUtils.CODE_REQUEST_PARAMS_ERROR, '参数不正确'))
        return
    }
    // 检查是否存在重名的
    let databaseResult = await DatabaseUtils.targetIsExist(userID, targetName)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    if (databaseResult.data.isExist){
        res.send(ResponseUtils.createFailResponse(400, '对象名称已经存在'))
        return
    }
    // 写入到数据库
    databaseResult = await DatabaseUtils.targetInsert(userID, targetName)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse('添加对象失败，' + databaseResult.data))
        return
    }
    res.send(ResponseUtils.createSuccessResponse())
})

/**
 * 删除对象
 */
router.post('/delete', async function (req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    let requestBody = req.body
    let targetID = requestBody['target_id']
    // 删除对象
    let databaseResult = await DatabaseUtils.targetDelete(userID, targetID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(400, '服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse())
})

/**
 * 更新对象
 */
router.post('/update', async function(req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    let requestBody = req.body
    let targetID = requestBody['target_id']
    let name = requestBody['name']
    // 确保对象是否存在
    let databaseResult = await DatabaseUtils.targetGetByID(userID, targetID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    if (databaseResult.data === null || databaseResult.data === undefined){
        res.send(ResponseUtils.createFailResponse(400, '对象不存在或已被删除'))
        return
    }
    let targetItem = databaseResult.data
    // 纠正参数
    if (FormatUtils.isEmpty(name)){
        name = targetItem.name
    }
    if (targetItem.name !== name){ // 如果修改了名称，则要检查是否重复
        databaseResult = await DatabaseUtils.targetIsExist(userID, name)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
            return
        }
        if (databaseResult.data.isExist){
            res.send(ResponseUtils.createFailResponse(400, '此对象名称已存在，请更换名称'))
            return
        }
    }
    // 更新数据库
    databaseResult = await DatabaseUtils.targetUpdate(userID, targetID, name, targetItem.extra_info)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse())
})

module.exports = router
