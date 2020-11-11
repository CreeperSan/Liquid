const express = require('express')
const router = express.Router()
const ResponseUtils = require('../../utils/response_utils')
const DatabaseUtils = require('../../utils/database_utils')
const RandomUtils = require('../../utils/random_utils')
const TimeUtils = require('../../utils/time_utils')
const ConfigUtils = require('../../utils/config_utils')

/**
 * 登陆接口
 */
router.post('/login', async function (req, res) {
    const requestBody = req.body
    let account = requestBody.account
    let password = requestBody.password
    let result
    // 检查参数是否都有了
    if (!account || !password){
        res.send(ResponseUtils.createFailResponse(ResponseUtils.CODE_REQUEST_PARAMS_ERROR, '参数不正确'))
        return
    }
    // 参数格式化
    account.replace(' ', '')
    password.replace(' ', '')
    console.log('账号:'+account+'  密码:'+password)
    // 登录
    result = await DatabaseUtils.accountLogin(account, password)
    if(result.isSuccess){
        // 账号密码正确
        console.log('登录成功的账号为：')
        let account = result.data.account       // 登录的账号
        let userID = result.data._id            // 登录的id
        let authCodeRetryCount = 5              // 尝试N次生成Key，如果N次都失，则返回服务器繁忙（其实也不是繁忙orz）
        let authKey = ''                        // 登录的token
        while(authCodeRetryCount > 0){
            authCodeRetryCount -= 1
            authKey = RandomUtils.generateKey()
            result = await DatabaseUtils.authInsertKey(userID, authKey)
            if (result.isSuccess){
                break
            }
            if (authCodeRetryCount < 0){
                res.send(ResponseUtils.createFailResponse(500, '服务器繁忙，请稍后重试'))
                return
            }
        }
        // 写入并取得Key
        res.send(ResponseUtils.createSuccessResponse({
            'id' : userID,
            'key' : authKey,
        }))
    } else {
        // 账号密码错误，返回结果
        res.send(ResponseUtils.createFailResponse(ResponseUtils.CODE_REQUEST_PARAMS_ERROR, '登录失败，您还有5次机会'))
    }
})

/**
 * 注册新账号接口
 */
router.post('/register', async function (req, res) {
    const requestBody = req.body
    let account = requestBody.account
    let password = requestBody.password
    let result
    // 检查参数是否都有了
    if (!account || !password){
        res.send(ResponseUtils.createFailResponse(ResponseUtils.CODE_REQUEST_PARAMS_ERROR, '参数不正确'))
        return
    }
    // 参数格式化
    account.replace(' ', '')
    password.replace(' ', '')
    console.log('账号:'+account+'  密码:'+password)
    // 检查参数是否正确
    if (account.length <= 0 || account.length > 16 || password.length <= 0 || password.length > 16){
        res.send(ResponseUtils.createFailResponse(ResponseUtils.CODE_REQUEST_PARAMS_ERROR, '参数不正确'))
        return
    }
    // 检查账号是否已经注册
    result = await DatabaseUtils.accountIsRegister(account)
    if(result.isSuccess){
        res.send(ResponseUtils.createFailResponse(ResponseUtils.CODE_REQUEST_PARAMS_ERROR, '账号已经注册'))
        return
    }
    // 注册账号
    result = await DatabaseUtils.accountRegister(account, password)
    if (result){
        res.send(ResponseUtils.createSuccessResponse())
    } else {
        res.send(ResponseUtils.createFailResponse(ResponseUtils.CODE_REQUEST_PARAMS_ERROR, '账号已注册，请更换账号'))
    }
})

/**
 * 请求重置密码
 */
router.post('/forget', function (req, res) {
    res.send(ResponseUtils.createFailResponse(500, '正在开发中'))
})

/**
 * 请求充值密码到校验
 */
router.post('forget_auth', function (req, res) {
    res.send(ResponseUtils.createFailResponse(500, '正在开发中'))
})

/**
 * Key续约
 */
router.post('/key_renew', async function (req, res) {
    const requestHeader = req.headers
    let key = requestHeader['key']
    // 检查 Key 是否存在
    let databaseResult
    databaseResult = await DatabaseUtils.authGetKeyInfo(key)
    console.log(databaseResult)
    if (!databaseResult.isSuccess || databaseResult.data.length <= 0){
        res.send(ResponseUtils.createFailResponse(400, '您尚未登录，请先登录'))
        return
    }
    // 检查时间是否过期
    let latestAuthTimestamp = TimeUtils.databaseTimeToMilliSecTimestamp(databaseResult.data[0].latest_auth_time)
    let currentTimestamp = TimeUtils.currentTimeMillis()
    if (currentTimestamp - latestAuthTimestamp > ConfigUtils.appAuthKeyExpireMilliSecTimes){ // 已超过过期时间
        res.send(ResponseUtils.createFailResponse(400, '登录信息已过期，请重新登录'))
        return
    }
    // 更新过期时间
    databaseResult = await DatabaseUtils.authUpdateKeyLastAuthTime(key)
    if (!databaseResult.isSuccess){
        res.send(ResponseUtils.createFailResponse(500, '服务器出错，请稍后重试'))
        return
    }
    res.send(ResponseUtils.createSuccessResponse({
        key : key
    }))
})

module.exports = router
