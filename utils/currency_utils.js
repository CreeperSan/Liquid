/**
 * 生成返回的货币信息
 * @param id 货币ID
 * @param region 所属地区
 * @param name 货币名称
 * @param shortName 短名称
 * @return {{name: string, region: string, id: *, shortName: string}}
 */
function createCurrentInfo(id, region, name, shortName){
    return {
        'id' : id,
        'region' : region,
        'name' : name,
        'shortName' : shortName,
    }
}

module.exports = {
    EMPTY : 0,
    AED : 1,
    ARS : 2,
    AUD : 3,
    BGN : 4,
    BRL : 5,
    BSD : 6,
    CAD : 7,
    CHF : 8,
    CLP : 9,
    CNY : 10,
    COP : 11,
    CZK : 12,
    DKK : 13,
    DOP : 14,
    EGP : 15,
    EUR : 16,
    FJD : 17,
    GBP : 18,
    GTQ : 19,
    HKD : 20,
    HRK : 21,
    HUF : 22,
    IDR : 23,
    ILS : 24,
    INR : 25,
    ISK : 26,
    JPY : 27,
    KRW : 28,
    KZT : 29,
    MOP : 30,
    MVR : 31,
    MXN : 32,
    MYR : 33,
    NOK : 34,
    NZD : 35,
    PAB : 36,
    PEN : 37,
    PHP : 38,
    PKR : 39,
    PLN : 40,
    PYG : 41,
    RON : 42,
    RUB : 43,
    SAR : 44,
    SEK : 45,
    SGD : 46,
    THB : 47,
    TRY : 48,
    TWD : 49,
    UAH : 50,
    USD : 51,
    UYU : 52,
    ZAR : 53,

    getCurrencyInfoByID : function (id) {
        switch (id) {
            case this.AED:
                return createCurrentInfo(id, '阿拉伯联合酋长国', '迪拉姆', 'AED')
            case this.ARS:
                return createCurrentInfo(id, '阿根廷', '比索', 'ARS')
            case this.AUD:
                return createCurrentInfo(id, '澳大利亚', '澳元', 'AUD')
            case this.BGN:
                return createCurrentInfo(id, '保加利亚', '列弗', 'BGN')
            case this.BRL:
                return createCurrentInfo(id, '巴西', '雷亚尔', 'BRL')
            case this.BSD:
                return createCurrentInfo(id, '巴哈马', '巴哈马元', 'BSD')
            case this.CAD:
                return createCurrentInfo(id, '加拿大', '加元', 'CAD')
            case this.CHF:
                return createCurrentInfo(id, '瑞士', '法郎', 'CHF')
            case this.CLP:
                return createCurrentInfo(id, '智利', '比索', 'CLP')
            case this.CNY:
                return createCurrentInfo(id, '中国', '人民币', 'CNY')
            case this.COP:
                return createCurrentInfo(id, '哥伦比亚', '比索', 'COP')
            case this.CZK:
                return createCurrentInfo(id, '捷克', '克朗', 'CZK')
            case this.DKK:
                return createCurrentInfo(id, '丹麦', '克朗', 'DKK')
            case this.DOP:
                return createCurrentInfo(id, '多米尼加共和国', '多米尼加比索', 'DOP')
            case this.EGP:
                return createCurrentInfo(id, '埃及', '埃及镑', 'EGP')
            case this.EUR:
                return createCurrentInfo(id, '欧洲', '欧元', 'EUR')
            case this.FJD:
                return createCurrentInfo(id, '斐济共和国', '斐济元', 'FJD')
            case this.GBP:
                return createCurrentInfo(id, '英国', '英镑', 'GBP')
            case this.GTQ:
                return createCurrentInfo(id, '危地马拉  ', '格查尔', 'GTQ')
            case this.HKD:
                return createCurrentInfo(id, '香港', '港元', 'HKD')
            case this.HRK:
                return createCurrentInfo(id, '克罗地亚', '库纳', 'HRK')
            case this.HUF:
                return createCurrentInfo(id, '匈牙利', '福林', 'HUF')
            case this.IDR:
                return createCurrentInfo(id, '印度尼西亚', '卢比', 'IDR')
            case this.ILS:
                return createCurrentInfo(id, '以色列', '新锡克尔', 'ILS')
            case this.INR:
                return createCurrentInfo(id, '印度', '卢比', 'INR')
            case this.ISK:
                return createCurrentInfo(id, '冰岛', '克朗', 'ISK')
            case this.JPY:
                return createCurrentInfo(id, '日本', '日元', 'JPY')
            case this.KRW:
                return createCurrentInfo(id, '韩国', '韩元', 'KRW')
            case this.KZT:
                return createCurrentInfo(id, '哈萨克斯坦', '坚戈', 'KZT')
            case this.MVR:
                return createCurrentInfo(id, '马尔代夫', '拉菲亚', 'MVR')
            case this.MXN:
                return createCurrentInfo(id, '墨西哥', '墨西哥元', 'MXN')
            case this.MOP:
                return createCurrentInfo(id, '澳门', '澳门币', 'MOP')
            case this.MYR:
                return createCurrentInfo(id, '马来西亚', '林吉特', 'MYR')
            case this.NOK:
                return createCurrentInfo(id, '挪威', '克朗', 'NOK')
            case this.NZD:
                return createCurrentInfo(id, '新西兰', '新西兰元', 'NZD')
            case this.PAB:
                return createCurrentInfo(id, '巴拿马', '巴波亚', 'PAB')
            case this.PEN:
                return createCurrentInfo(id, '秘鲁', '新索尔', 'PEN')
            case this.PHP:
                return createCurrentInfo(id, '菲律宾', '菲律宾比索', 'PHP')
            case this.PKR:
                return createCurrentInfo(id, '巴基斯坦', '卢比', 'PKR')
            case this.PLN:
                return createCurrentInfo(id, '波兰', '兹罗提', 'PLN')
            case this.PYG:
                return createCurrentInfo(id, '巴拉圭', '瓜拉尼', 'PYG')
            case this.RON:
                return createCurrentInfo(id, '罗马尼亚', '列伊', 'RON')
            case this.RUB:
                return createCurrentInfo(id, '俄罗斯', '卢布', 'RUB')
            case this.SAR:
                return createCurrentInfo(id, '沙特', '里亚尔', 'SAR')
            case this.SEK:
                return createCurrentInfo(id, '瑞典', '瑞典克朗', 'SEK')
            case this.SGD:
                return createCurrentInfo(id, '新加坡', '新加坡元', 'SGD')
            case this.THB:
                return createCurrentInfo(id, '泰国', '泰铢', 'THB')
            case this.TRY:
                return createCurrentInfo(id, '土耳其', '新土耳其里拉', 'TRY')
            case this.TWD:
                return createCurrentInfo(id, '台湾', '新台币', 'TWD')
            case this.UAH:
                return createCurrentInfo(id, '乌克兰', '格里夫纳', 'UAH')
            case this.USD:
                return createCurrentInfo(id, '美国', '美元', 'USD')
            case this.UYU:
                return createCurrentInfo(id, '乌拉圭', '乌拉圭比索', 'UYU')
            case this.ZAR:
                return createCurrentInfo(id, '南非', '兰特', 'ZAR')
        }
        return createCurrentInfo(id, '未知', '未知', '<Unknown>')
    }

}