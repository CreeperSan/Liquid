const express = require('express')
const router = express.Router()
const ResponseUtils = require('../../utils/response_utils')
const DatabaseUtils = require('../../utils/database_utils')
const FormatUtils = require('../../utils/format_utils')
const CommonRouterAuthHandler = require('./common/auth')

router.use(CommonRouterAuthHandler.authKey) // 检查 key 是否合法

/**
 * 新增标签
 */
router.post('/add', async function(req, res) {
    // 参数的解析
    const requestBody = req.body
    let parentID = requestBody['parent_id']
    let userID = req.auth['user_id']
    let name = requestBody['name']
    let color = requestBody['color']
    let icon = requestBody['icon']
    let isAllowNameRepeat = requestBody['is_allow_name_repeat']
    // 参数校验
    if (FormatUtils.isEmpty(name)){
        res.send(ResponseUtils.createFailResponse(400, '参数错误，缺少标签名称'))
        return
    }
    if (FormatUtils.isEmpty(userID)){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误，请返回重新登录'))
    }
    if (FormatUtils.isEmpty(isAllowNameRepeat)){
        isAllowNameRepeat = false
    }
    // 检查父标签是否存在
    let databaseResult;
    if (!FormatUtils.isNull(parentID) && parentID >= 0){
        databaseResult = await DatabaseUtils.tagIsExist(userID, parentID)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
            return
        }
        if (!databaseResult.data.isExist){
            res.send(ResponseUtils.createFailResponse(400, '父标签不存在'))
            return
        }
        databaseResult = await DatabaseUtils.tagIsParent(userID, parentID)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
            return
        }
        if (!databaseResult.data.isParent){
            res.send(ResponseUtils.createFailResponse(400, '选中到父标签不是父标签'))
            return
        }
    }
    // 检查颜色是否符合要求
    if (!FormatUtils.isColorValid(color)){
        res.send(ResponseUtils.createFailResponse(400, '颜色格式错误'))
        return
    }
    // 检查是否已经存在同名标签
    if (!isAllowNameRepeat){
        let result = await DatabaseUtils.tagIsNameExist(userID, name)
        if (!result.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器查询同名标签时发生内部错误，请稍后重试'))
            return
        }
        if (result.data.isExist){
            res.send(ResponseUtils.createFailResponse(500, '已存在同名标签'))
            return
        }
    }
    // 写入数据库
    databaseResult = await DatabaseUtils.tagInsert(parentID, userID, name, color, icon, '{}')
    if (databaseResult.isSuccess){
        res.send(ResponseUtils.createSuccessResponse('创建标签成功'))
    } else {
        res.send(ResponseUtils.createFailResponse(500 , '创建标签失败'))
    }
})

/**
 * 查看所有标签列表
 */
router.post('/list', async function(req, res) {
    let userID = req.auth['user_id']
    let databaseResult = await DatabaseUtils.tagGetList(userID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '获取标签失败，服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse(databaseResult.data))
})

/**
 * 删除指定标签
 */
router.post('/delete', async function(req, res) {
    // 参数的解析
    let userID = req.auth['user_id']
    const requestBody = req.body
    let tagID = requestBody['tag_id']
    // 检查标签是否存在
    let databaseResult = await DatabaseUtils.tagIsExist(userID, tagID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    if (!databaseResult.data.isExist){
        res.send(ResponseUtils.createFailResponse(400, '标签不存在或者已被删除'))
        return
    }
    // 删除标签
    databaseResult = await DatabaseUtils.tagDelete(userID, tagID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '删除标签失败，服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse())
})

/**
 * 更新指定标签信息
 */
router.post('/update', async function(req, res) {
    // 参数的解析
    let userID = req.auth['user_id']
    const requestBody = req.body
    let tagID = requestBody['tag_id']
    // 参数校验
    let databaseResult = await DatabaseUtils.tagIsExist(userID, tagID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    if (!databaseResult.data.isExist){
        res.send(ResponseUtils.createFailResponse(400, '标签不存在'))
        return
    }
    // 读取原有数据
    databaseResult = await DatabaseUtils.tagGetByID(userID, tagID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    if (databaseResult.data === null || databaseResult.data === undefined){
        res.send(ResponseUtils.createResponse(500, '服务器内部出错'))
        return
    }
    let prevTagInfo = databaseResult.data
    // 组合新的数据
    let name = requestBody['name']
    if (FormatUtils.isEmpty(name)){
        name = prevTagInfo['name']
    }
    let color = requestBody['color']
    if (FormatUtils.isEmpty(color)){
        color = prevTagInfo['color']
    }
    let icon = requestBody['icon']
    if (FormatUtils.isEmpty(icon)){
        icon = prevTagInfo['icon']
    }
    let parentID = requestBody['parent_id']
    if (FormatUtils.isEmpty(parentID)){
        parentID = prevTagInfo['parent_id']
    }
    let extraInfo = prevTagInfo['extra_info']
    let isAllowNameRepeat = requestBody['is_allow_name_repeat']
    if (FormatUtils.isEmpty(isAllowNameRepeat)){
        isAllowNameRepeat = false
    }
    // 检查父标签是否存在
    if (!FormatUtils.isNull(parentID) && parentID >= 0){
        databaseResult = await DatabaseUtils.tagIsExist(userID, parentID)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
            return
        }
        if (!databaseResult.data.isExist){
            res.send(ResponseUtils.createFailResponse(400, '父标签不存在'))
            return
        }
        databaseResult = await DatabaseUtils.tagIsParent(userID, parentID)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
            return
        }
        if (!databaseResult.data.isParent){
            res.send(ResponseUtils.createFailResponse(400, '选中到父标签不是父标签'))
            return
        }
    }
    // 检查颜色是否符合要求
    if (!FormatUtils.isColorValid(color)){
        res.send(ResponseUtils.createFailResponse(400, '颜色格式错误'))
        return
    }
    // 如果更改了名字并且不允许名字重复，则检查名字是否重复
    if (!isAllowNameRepeat && 'name' in requestBody && prevTagInfo['name'] !== name){
        databaseResult = await DatabaseUtils.tagIsNameExist(userID, name)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器查询同名标签时发生内部错误，请稍后重试'))
            return
        }
        if (databaseResult.data.isExist){
            res.send(ResponseUtils.createFailResponse(500, '已存在同名标签，请更换名字后重试'))
            return
        }
    }
    // 更新对应标签
    databaseResult = await DatabaseUtils.tagUpdate(tagID, userID, parentID, name, color, icon, extraInfo)
    if (databaseResult.isSuccess) {
        res.send(ResponseUtils.createSuccessResponse())
    } else {
        res.send(ResponseUtils.createFailResponse(500, '更新标签信息失败'))
    }
})

module.exports = router