const ResponseUtils = require('./../../../utils/response_utils')
const TimeUtils = require('./../../../utils/time_utils')
const DatabaseUtils = require('./../../../utils/database_utils')
const ConfigUtils = require('./../../../utils/config_utils')

// TODO 账号密码目前是明文储存，需要加密

module.exports = {

    authKey : async function (req, res, next) {
        const requestHeader = req.headers
        let key = requestHeader['key']
        // 检查 Key 是否存在
        let databaseResult
        databaseResult = await DatabaseUtils.authGetKeyInfo(key)
        console.log(databaseResult)
        if (!databaseResult.isSuccess || databaseResult.data.length <= 0){
            res.send(ResponseUtils.createNotLoginResponse())
            return
        }
        // 检查时间是否过期
        let authCodeItem = databaseResult.data[0]
        req.auth = authCodeItem // 设置上校验结果，方便后面操作需要
        let latestAuthTimestamp = TimeUtils.databaseTimeToMilliSecTimestamp(authCodeItem.latest_auth_time)
        let currentTimestamp = TimeUtils.currentTimeMillis()
        if (currentTimestamp - latestAuthTimestamp > ConfigUtils.appAuthKeyExpireMilliSecTimes){ // 已超过过期时间
            res.send(ResponseUtils.createLoginExpireResponse())
            return
        }
        // 更新过期时间（不关心更改结果）
        await DatabaseUtils.authUpdateKeyLastAuthTime(key)
        next()
    }

}