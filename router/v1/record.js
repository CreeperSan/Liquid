const express = require('express')
const router = express.Router()
const ResponseUtils = require('../../utils/response_utils')
const DatabaseUtils = require('../../utils/database_utils')
const FormatUtils = require('../../utils/format_utils')
const CommonRouterAuthHandler = require('./common/auth')

router.use(CommonRouterAuthHandler.authKey) // 检查 key 是否合法

/**
 * 添加流水
 */
router.post('/add', async function(req, res) {
    res.send(ResponseUtils.createSuccessResponse('开发中'))
})

module.exports = router
