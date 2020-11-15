module.exports = {
    /**
     * 服务器配置
     */
    serverPort : 4000,                                          // 服务器运行端口

    /**
     * 应用配置
     */
    appMaxOnlineDeviceCount : 5,                                // 同时在线设备总数
    appIsOpenRegister : true,                                   // 是否开放注册
    appAuthKeyExpireMilliSecTimes : 1000 * 60 * 60 * 24 * 7     // 登录Key过期时间 - 7天
}