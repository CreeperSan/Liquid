const express = require('express')
const router = express.Router()
const ResponseUtils = require('../../utils/response_utils')
const DatabaseUtils = require('../../utils/database_utils')
const FormatUtils = require('../../utils/format_utils')
const CurrencyUtils = require('../../utils/currency_utils')
const TimeUtils = require('../../utils/time_utils')
const CommonRouterAuthHandler = require('./common/auth')

router.use(CommonRouterAuthHandler.authKey) // 检查 key 是否合法

/**
 * 添加流水
 */
router.post('/add', async function(req, res) {
    // 获取参数
    let timezone = req.headers['timezone']
    let userID = req.auth['user_id']
    let requestBody = req.body
    let tagID = requestBody['tag_id']
    let targetID = requestBody['target_id']
    let recordTime = requestBody['record_time'] // 必填
    let money = requestBody['money'] // 必填
    let currency = requestBody['currency']
    let description = requestBody['description']
    // 纠正参数
    if (FormatUtils.isEmpty(tagID)){
        tagID = -1
    }
    if (FormatUtils.isEmpty(targetID)){
        targetID = -1
    }
    if (FormatUtils.isEmpty(recordTime) || recordTime < 0){
        res.send(ResponseUtils.createFailResponse(400, '请填写流水时间'))
        return
    }
    if (FormatUtils.isEmpty(money)){
        res.send(ResponseUtils.createFailResponse(400, '请填写金额'))
        return
    }
    if (FormatUtils.isEmpty(currency)){
        currency = CurrencyUtils.EMPTY
    }
    if (!CurrencyUtils.isCurrencyIDSupported(currency)){
        res.send(ResponseUtils.createFailResponse(400, '货币类型错误'))
        return
    }
    if (FormatUtils.isEmpty(description)){
        description = ''
    }
    // 数据是否可用检查
    let databaseResult
    if (tagID >= 0){ // 如果指定了标签，则检查是否标签存在
        databaseResult = await DatabaseUtils.tagGetByID(userID, tagID)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
            return
        }
        if (databaseResult.data === null || databaseResult.data === undefined){
            res.send(ResponseUtils.createFailResponse(400, '对应的标签不存在'))
            return
        }
    }
    if (targetID >= 0){ // 如果检查了对象，则检查对象是否存在
        databaseResult = await DatabaseUtils.targetGetByID(userID, targetID)
        if (!databaseResult.isSuccess){
            res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
            return
        }
        if (databaseResult.data === null || databaseResult.data === undefined){
            res.send(ResponseUtils.createFailResponse(400, '对应的对象不存在'))
            return
        }
    }
    // 插入到数据库中
    databaseResult = await DatabaseUtils.recordInsert(userID, tagID, targetID, recordTime, money, currency, description, '{}')
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse())
})

/**
 * 删除流水
 */
router.post('/delete', async function(req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    let requestBody = req.body
    let recordID = requestBody['record_id']
    // 删除数据
    let databaseResult = await DatabaseUtils.recordDelete(userID, recordID)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse())
})

/**
 * 读取流水
 * TODO 不能全部返回，数据量太，需要分页返回
 */
router.post('/list', async function(req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    let requestBody = req.body
    let offset = requestBody['offset']
    let count = requestBody['count']
    // 参数矫正
    if (FormatUtils.isNull(offset) || offset < 0){
        offset = 0
    }
    if (FormatUtils.isNull(count)){
        count = 20
    }
    count = FormatUtils.limitNumber(count, 0, 100)
    // 读取数据库
    let databaseResult = await DatabaseUtils.recordGetList(userID, offset, count)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse(databaseResult.data))

})

module.exports = router
