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
        } else if (typeof value === 'number'){
            return false
        } else if ('length' in value && value.length <= 0){
            return true
        }
        return false

    },

}