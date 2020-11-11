module.exports = {

    /**
     * 获取当前的毫秒级别时间出o
     * @return {number}
     */
    currentTimeMillis : function () {
        return new Date().getTime()
    },

    /**
     * 获取当前的秒级别时间戳
     * @return {number}
     */
    currentTimeSec : function () {
        return parseInt(this.currentTimeMillis() / 1000)
    },

    /**
     * 将数据库中获取到的时间字符串转换成毫秒级时间戳
     * @param timeStr 数据库储存的时间格式化文本
     * @return {number} 毫秒级时间戳
     */
    databaseTimeToMilliSecTimestamp : function (timeStr) {
        return Date.parse(timeStr)
    }

}