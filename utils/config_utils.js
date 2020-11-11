module.exports = {
    /**
     * 服务器配置
     */
    serverPort : 4000,                                          // 服务器运行端口

    /**
     * 数据库配置
     */
    databaseAddress : 'localhost',                              // 数据库连接的地址
    databasePort : 3306,                                        // 数据库连接端口号
    databaseAccount : '',                                       // 数据库连接登录账号
    databasePassword : '',                                      // 数据库连接登录密码

    /**
     * 应用配置
     */
    appMaxOnlineDeviceCount : 5,                                // 同时在线设备总数
    appIsOpenRegister : true,                                   // 是否开放注册
    appAuthKeyExpireMilliSecTimes : 1000 * 60 * 60 * 24 * 7     // 登录Key过期时间 - 7天
}