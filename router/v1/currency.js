const express = require('express')
const router = express.Router()
const ResponseUtils = require('../../utils/response_utils')
const CurrencyUtils = require('../../utils/currency_utils')

// https://www.exchangerate-api.com/docs/supported-currencies

/**
 * 获取所有支持的货币列表
 */
router.post('/list', function (req, res) {
    res.send(ResponseUtils.createSuccessResponse([
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.AED),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.ARS),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.AUD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.BGN),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.BRL),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.BSD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.CAD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.CHF),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.CLP),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.CNY),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.COP),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.CZK),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.DKK),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.DOP),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.EGP),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.EUR),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.FJD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.GBP),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.GTQ),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.HKD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.HRK),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.HUF),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.IDR),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.ILS),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.INR),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.ISK),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.JPY),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.KRW),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.KZT),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.MOP),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.MVR),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.MXN),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.MYR),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.NOK),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.NZD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.PAB),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.PEN),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.PHP),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.PKR),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.PLN),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.PYG),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.RON),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.RUB),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.SAR),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.SEK),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.SGD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.THB),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.TRY),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.TWD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.UAH),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.USD),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.UYU),
        CurrencyUtils.getCurrencyInfoByID(CurrencyUtils.ZAR),
    ]))
})

module.exports = router
