module.exports = {

    /**
     * 格式化字符串
     * @param origin 原字符串
     * @param replacement 要替换的内容（按顺序逐个替换下来）
     * @param replacementString 要替换的标志文本，可不传，默认为 ?
     */
    formatString : function (origin, replacement, replacementString = '?') {
        let tmpOrigin = origin
        let index = 0
        while (tmpOrigin.indexOf(replacementString) >= 0){
            let startIndex = tmpOrigin.indexOf(replacementString)
            tmpOrigin = tmpOrigin.substring(0, startIndex) + replacement[index].toString() + tmpOrigin.substring(startIndex + replacementString.length, tmpOrigin.length)
            index += 1
            index %= replacement.length
        }
        return tmpOrigin
    },

    /**
     * 判断一个变量是否为空，支持字符串和 [], {} 这些类型的变量的判断
     * @param value 要判断的变量
     * @return {boolean} 是否为空
     */
    isEmpty : function (value) {
        if (value === undefined){
            return true
        }
        if (value === null){
            return true
        }
        if (typeof value === 'string'){
            return value.length <= 0
        } else if (typeof value === 'number' || typeof value === 'boolean'){
            return false
        } else if ('length' in value && value.length <= 0){
            return true
        }
        return false

    },

    /**
     * 判断一个变量是否为 null 或 undefine
     * @param value
     */
    isNull : function (value) {
        return value === undefined || value === null
    },

    /**
     * 把变量限制在一个范围内
     * @param value 值
     * @param min 最小值
     * @param max 最大值
     */
    limitNumber : function (value, min, max) {
        if (min > max){
            throw Error('最小值不能大于最大值')
        }
        if (value < min){
            value = min
        }else if (value > max){
            value = max
        }
        return value
    },

    /**
     * 判断查看流水中到排序方式参数值是否符合要求
     * @param value
     */
    RECORD_LIST_ORDER_BY_CREATE_TIME : 'create_time',
    RECORD_LIST_ORDER_BY_RECORD_TIME : 'default',
    RECORD_LIST_ORDER_BY_MODIFY_TIME : 'modify_time',
    RECORD_LIST_ORDER_BY_MONEY : 'money',
    RECORD_LIST_ORDER_BY_CURRENCY : 'currency',
    RECORD_LIST_ORDER_BY_TAG : 'tag',
    RECORD_LIST_ORDER_BY_TARGET : 'target',
    isRecordOrderByValid : function (value) {
        return [
            this.RECORD_LIST_ORDER_BY_CREATE_TIME, this.RECORD_LIST_ORDER_BY_RECORD_TIME,
            this.RECORD_LIST_ORDER_BY_MODIFY_TIME, this.RECORD_LIST_ORDER_BY_MONEY,
            this.RECORD_LIST_ORDER_BY_CURRENCY, this.RECORD_LIST_ORDER_BY_TAG,
            this.RECORD_LIST_ORDER_BY_TARGET
        ].indexOf(value) >= 0
    },

    /**
     * 流水列表中到排序方式参数值转数据库列名称
     * @param name
     */
    recordOrderParamsToDatabaseKeyName : function (name) {
        switch (name) {
            case this.RECORD_LIST_ORDER_BY_CREATE_TIME:
                return 'create_time'
            case this.RECORD_LIST_ORDER_BY_RECORD_TIME:
                return 'record_time'
            case this.RECORD_LIST_ORDER_BY_MODIFY_TIME:
                return 'modify_time'
            case this.RECORD_LIST_ORDER_BY_MONEY:
                return 'money'
            case this.RECORD_LIST_ORDER_BY_CURRENCY:
                return 'currency'
            case this.RECORD_LIST_ORDER_BY_TAG:
                return 'tag_id'
            case this.RECORD_LIST_ORDER_BY_TARGET:
                return 'target_id'
            default:
                return 'record_time'
        }
    },

    /**
     * 颜色字符串是否符合格式
     */
    isColorValid : function (value) {
        value = value.toString().toUpperCase().trim()
        if (value.length !== 7 || value.length !== 9){
            return false
        }
        for (let index in value){
            let charItem = value[index]
            if (index <= 0){ // 首字符必须是 #
                if (charItem !== '#'){
                    return false
                }
            } else { // 剩余为为大写 16进制 Hex
                if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'].indexOf(charItem) < 0){
                    return false
                }
            }
        }
        return true
    }

}