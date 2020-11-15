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
 * 更新流水
 */
router.post('/update', async function(req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    let requestBody = req.body
    let tagID = requestBody['tag_id']
    let targetID = requestBody['target_id']
    let recordID = requestBody['record_id'] // 必填
    let recordTime = requestBody['record_time']
    let money = requestBody['money']
    let currency = requestBody['currency']
    let description = requestBody['description']
    // 读取旧到数据
    let databaseResult = await DatabaseUtils.recordIsExist(userID, recordID) // 检查是否存在对应到流水记录
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    if (!databaseResult.data.isExist){
        res.send(ResponseUtils.createFailResponse(400, '没有找到对应流水'))
        return
    }
    let recordItem = databaseResult.data.item
    // 纠正参数
    if (FormatUtils.isEmpty(tagID)){
        tagID = recordItem.tag_id
    }
    if (FormatUtils.isEmpty(targetID)){
        targetID = recordItem.target_id
    }
    if (FormatUtils.isEmpty(recordID) || recordID < 0){
        res.send(ResponseUtils.createFailResponse(400, '请指定流水'))
        return
    }
    if (FormatUtils.isEmpty(recordTime) || recordTime < 0){
        recordTime = recordItem.record_time
    }
    if (FormatUtils.isEmpty(money)){
        money = recordTime.money
    }
    if (FormatUtils.isEmpty(currency)){
        currency = recordTime.currency
    }
    if (!CurrencyUtils.isCurrencyIDSupported(currency)){
        res.send(ResponseUtils.createFailResponse(400, '货币类型错误'))
        return
    }
    if (FormatUtils.isEmpty(description)){
        description = recordTime.description
    }
    // 数据是否可用检查
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
    // 更新到数据库中
    databaseResult = await DatabaseUtils.recordUpdate(userID, recordID, tagID, targetID, recordTime, money, currency, description, recordItem.extra_info)
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
 */
router.post('/list', async function(req, res) {
    // 获取参数
    let userID = req.auth['user_id']
    let requestBody = req.body
    let offset = requestBody['offset']
    let count = requestBody['count']
    let startTime = requestBody['start_time']
    let endTime = requestBody['end_time']
    let moneyMax = requestBody['money_max']
    let moneyMin = requestBody['money_min']
    let currencies = requestBody['currencies']
    let tagIDs = requestBody['tags']
    let targetIDs = requestBody['targets']
    let orderBy = requestBody['order_by']
    let isReverse = requestBody['reverse']
    // 参数矫正
    if (FormatUtils.isNull(offset) || offset < 0){
        offset = 0
    }
    if (FormatUtils.isNull(count)){
        count = 20
    }
    count = FormatUtils.limitNumber(count, 0, 100)
    if (FormatUtils.isNull(isReverse)){
        isReverse = false
    }
    if (FormatUtils.isEmpty(orderBy)){
        orderBy = FormatUtils.RECORD_LIST_ORDER_BY_RECORD_TIME
    }
    if (typeof currencies === 'number'){
        currencies = [currencies]
    }
    if (typeof tagIDs === 'number'){
        tagIDs = [tagIDs]
    }
    if (typeof targetIDs === 'number'){
        targetIDs = [targetIDs]
    }
    if (!FormatUtils.isRecordOrderByValid(orderBy)){
        res.send(ResponseUtils.createFailResponse(400, '排序方式错误'))
        return
    }
    orderBy = FormatUtils.recordOrderParamsToDatabaseKeyName(orderBy)
    // 读取数据库
    let databaseResult = await DatabaseUtils.recordGetList(userID, startTime, endTime, moneyMin, moneyMax, tagIDs, targetIDs, currencies, orderBy, isReverse, count, offset)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器内部错误'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse(databaseResult.data))

})

module.exports = router
