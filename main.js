const express = require('express')
const configUtils = require('./utils/config_utils')
const databaseUtils = require('./utils/database_utils')

const bodyParser = require('body-parser')
const routerLogin = require('./router/v1/login')
const routerTag = require('./router/v1/tag')
const routerCurrency = require('./router/v1/currency')

databaseUtils.init()

const app = express()

app.use(bodyParser.urlencoded({ extended : false }))
app.use(bodyParser.json())

app.use('/api/v1/account', routerLogin)
app.use('/api/v1/tag', routerTag)
app.use('/api/v1/currency', routerCurrency)

app.listen(configUtils.serverPort, function () {
    console.log('server running on port ' + configUtils.serverPort.toString())
})



