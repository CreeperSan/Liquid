const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database('Liquid.db')
const FormatUtils = require('./format_utils')
const RandomUtils = require('./random_utils')
const TimeUtils = require('./time_utils')

// TODO 逻辑过多，耦合严重，后面需要拆离

module.exports = {
    _VERSION_LATEST : 1,

    TABLE_ACCOUNT : 'Account',

    /**
     * 初始化
     */
    init : async function(){
        // 初始化配置数据表
        db.run('create table if not exists _Preferences(key text primary key not null unique, value text not null )')
        // 数据库升级检查
        console.log('正在检查数据库版本升级')
        let databaseVersion = await this.getDatabaseVersion()
        while (databaseVersion < this._VERSION_LATEST){
            if (databaseVersion){
                throw Error('数据库更新异常！')
            }
            console.log(FormatUtils.formatString('当前版本数据库（?）存在更新，正在数据库升级中...', [databaseVersion]))
            let prevDatabaseVersion = databaseVersion
            databaseVersion = await this.update(databaseVersion)
            await this.setDatabaseVersion(databaseVersion)
            console.log(FormatUtils.formatString('数据库升级完成  ? -> ?', [prevDatabaseVersion, databaseVersion]))
        }
        console.log('数据库版本已是最新 : ' + databaseVersion)
        // 初始化完成
    },


    /**
     * 数据库升级逻辑
     */
    update : async function(version){
        switch (version) {
            case 0:
                return await this._updateFrom0(version)
            default:
                return -1
        }
    },

    /**
     * 初始化表
     * @return {Promise<void>}
     */
    _updateFrom0 : async function(version){
        // 初始化账号表
        db.run('create table if not exists Account(_id integer primary key autoincrement not null, account text not null unique, password text not null, register_time integer not null, extra_info text)')
        // 初始化账号和Key的对应表【数据为临时数据，可以清除】
        db.run('create table if not exists AccountAuthKey(key text not null primary key unique , user_id integer not null, create_time integer not null , latest_auth_time integer not null )')
        // 初始化标签表
        db.run('create table if not exists Tag(_id integer primary key autoincrement not null, parent_id integer default -1, user_id integer not null , name text not null , color text , icon text, extra_info text)')
        // 初始化消费对象
        db.run('create table if not exists Target(_id integer primary key autoincrement not null, user_id integer not null, name text not null, extra_info text)')
        // 初始化流水表，一个流水对应一个标签
        db.run('create table if not exists Record(_id integer primary key autoincrement not null, user_id integer not null, tag_id integer not null, target_id integer not null, create_time integer not null , modify_time integer not null, record_time integer not null not null, money integer real not null, currency integer not null , description text, extra_info text)')
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(1)
            }, 500)
        })
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 获取数据库版本
     * @return {Promise<number>}
     */
    getDatabaseVersion : async function(){
        return parseInt((await this.getPreference('version', '0')).toString())
    },

    /**
     * 写入数据库版本
     * @param version
     * @return {Promise<void>}
     */
    setDatabaseVersion : async function(version){
        await this.setPreference('version', version.toString())
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 数据库基本操作 - 操作结果
     * @param err 错误，如果正常执行则为 null
     * @param result sql语句执行结果
     */
    databaseCreateResult : function(err, result){
        return {
            err : err,
            result : result,
        }
    },

    /**
     * 获取键值对数据
     * @param key 键
     * @param defaultValue 默认值
     */
    getPreference : async function(key, defaultValue = ''){
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from _Preferences where key="?" limit ?', [key, 1])
            console.log('getPreference : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(defaultValue)
                    return
                }
                if (FormatUtils.isEmpty(result)){
                    resolve(defaultValue)
                    return
                }
                resolve(result[0].value)
            })
        })
    },

    /**
     * 写入键值对数据
     * @param key
     * @param value
     */
    setPreference : async function(key, value){
        return new Promise(function (resolve, reject) {
            let sql = 'insert or replace into _Preferences(key, value) values (?, ?)'
            console.log('setPreference : ' + sql)
            let stmt = db.prepare(sql)
            stmt.run(key, value, function (err, result) {
                resolve()
            })
        })
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 创建下面调用方法的操作结果
     * @param isSuccess
     * @param data
     */
    createActionResult : function(isSuccess, data){
        return {
            isSuccess : isSuccess,
            data : data
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 判断账号是否注册
     * @param account 账号名称
     */
    accountIsRegister : async function(account){
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Account where account = "?"', [account.toString()])
            console.log(sql)
            db.all(sql, function (err, result) {
                if(err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                }else{
                    if (undefined !== result && null !== result && result.length > 0){
                        resolve(self.createActionResult(true, '账号已注册'))
                    } else {
                        resolve(self.createActionResult(false, '账号未注册'))
                    }
                }
            })
        })
    },

    /**
     * 注册新账号
     * @param account 账号
     * @param password 密码
     */
    accountRegister : async function (account, password) {
        const self = this
        return new Promise(function (resolve, reject) {
            let stmt = db.prepare('insert into Account (account, password, register_time) values (?,?,?)')
            stmt.run(account, password, TimeUtils.currentTimeMillis(), function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '账号注册失败'))
                } else {
                    resolve(self.createActionResult(true, '账号注册成功'))
                }
            })
        })
    },

    /**
     * 账号登录
     * @param account 账号
     * @param password 密码
     * @return {Promise<void>}
     */
    accountLogin : async function(account, password){
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Account where account = "?" and password = "?"', [account.toString(), password.toString()])
            console.log(sql)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult('服务器内部错误'))
                } else {
                    if(undefined !== result && null !== result && result.length > 0){
                        // 查询到账号和密码记录，生成并写入Key
                        resolve(self.createActionResult(true, result[0]))
                    } else {
                        // 没有对应的账号密码记录
                        resolve(self.createActionResult(false, '登录失败，账号或密码错误'))
                    }
                }
            })
        })
    },

    /**
     * 为指定账号写入新的身份Key
     * @param userID 账号ID
     * @param key 身份Key
     * @return {Promise<void>}
     */
    authInsertKey : async function(userID, key){
        const self = this
        return new Promise(function (resolve, reject){
            let sql = 'insert into AccountAuthKey(key, user_id, create_time, latest_auth_time) values (?, ?, ?, ?)'
            console.log('authInsertKey : ' + sql)
            let stmt = db.prepare(sql)
            let currentTimeMillSecond = TimeUtils.currentTimeMillis()
            stmt.run(key, userID, currentTimeMillSecond, currentTimeMillSecond, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                } else {
                    resolve(self.createActionResult(true, '写入成功'))
                }
            })
        })
    },

    /**
     * 通过 Key 获取对应信息
     * @param key
     */
    authGetKeyInfo : async function (key) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from AccountAuthKey where key = "?"', [key])
            console.log('authGetKeyInfo : ' + key)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                } else {
                    if (undefined !== result && null !== result && result.length > 0){
                        resolve(self.createActionResult(true, result))
                    } else {
                        resolve(self.createActionResult(true, []))
                    }
                }
            })
        })
    },

    /**
     * 更新 Key 的上一次操作时间
     * @param key
     * @return {Promise<void>}
     */
    authUpdateKeyLastAuthTime : async function(key){
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('update AccountAuthKey set latest_auth_time = ? where key = "?"', [TimeUtils.currentTimeMillis(), key])
            console.log('authUpdateKeyLastAuthTime : ' + sql)
            db.run(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                } else {
                    resolve(self.createActionResult(true, '更新成功'))
                }
            })
        })
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 新增标签
     * @param parentID 父标签I（最多只支持2级标签，为-1则表明自己就是最根部的标签）
     * @param userID 【不能为空】所属用户ID
     * @param name 【不能为空】标签名称
     * @param color 标签颜色，以#开头的颜色（#66CCFF）
     * @param icon 标签图标
     * @param extraInfo 更多信息
     */
    tagInsert : async function(parentID, userID, name, color, icon, extraInfo){
        const self = this
        // 参数矫正
        if (FormatUtils.isEmpty(parentID)){
            parentID = -1
        }
        if (FormatUtils.isEmpty(color)){
            color = '#004AD8'
        }
        if (FormatUtils.isEmpty(icon)){
            icon = ''
        }
        if (FormatUtils.isEmpty(extraInfo)){
            extraInfo = ''
        }
        // 写数据库
        return new Promise(function (resolve, reject) {
            let stmt = db.prepare('insert into Tag (parent_id, user_id, name, color, icon, extra_info) values (?,?,?,?,?,?)')
            stmt.run(parentID, userID, name, color, icon, extraInfo, function (err, result) {
                console.log(err)
                console.log(result)
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误，新增标签失败'))
                } else {
                    resolve(self.createActionResult(true, '添加成功'))
                }
            })
        })
    },

    /**
     * 检查对应的用户ID是否存在指定名字的标签
     * @param userID 用户
     * @param tagName 标签名称
     * @return {Promise<unknown>}
     */
    tagIsNameExist : async function (userID, tagName) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Tag where user_id = ? and name = "?"', [userID, tagName])
            console.log('tagIsNameExist : ' + sql)
            db.all(sql, function(err, result){
                if (err){
                    console.log(err)
                    resolve(self.createActionResult(false, '查找同名标签时发生错误'))
                } else {
                    resolve(self.createActionResult(true, {
                        isExist : !FormatUtils.isEmpty(result),
                        message : '查找完成'
                    }))
                }
            })
        })
    },

    /**
     * 获取所有标签的列表
     * @param userID 用户ID
     * @return {Promise<unknown>}
     */
    tagGetList : async function (userID) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Tag where user_id = ?', [userID])
            console.log('tagGetList : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '查看标签列表发生内部错误'))
                    return
                }
                for (let index in result){ // 格式化数据
                    let tagItem = result[index]
                    delete tagItem.user_id
                    tagItem.id = tagItem._id
                    delete tagItem._id
                    if (tagItem.parent_id < 0){
                        delete tagItem.parent_id
                    }
                    if (FormatUtils.isEmpty(tagItem.icon)){
                        delete tagItem.icon
                    }
                    if (tagItem.extra_info === '{}' || FormatUtils.isEmpty(tagItem.extra_info)){
                        delete tagItem.extra_info
                    }
                    tagItem.create_time = TimeUtils.databaseTimeToMilliSecTimestamp(tagItem.create_time)
                }
                resolve(self.createActionResult(true, result))
            })
        })
    },

    /**
     * 标签是否存在
     * @param userID 用户ID
     * @param tagID 标签数据库ID
     */
    tagIsExist : async function (userID, tagID) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Tag where _id = ? and user_id = ?', [tagID, userID])
            console.log('tagIsExist : ' + sql)
            db.all(sql, function(err, result){
                if (err){
                    console.log(err)
                    resolve(self.createActionResult(false, '查找标签时发生错误'))
                } else {
                    resolve(self.createActionResult(true, {
                        isExist : !FormatUtils.isEmpty(result),
                        message : '查找完成'
                    }))
                }
            })
        })
    },

    /**
     * 标签是否为父标签
     * @param userID 用户ID
     * @param tagID 标签ID
     */
    tagIsParent : async function(userID, tagID){
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Tag where _id=? and user_id=? and parent_id>?', [tagID, userID, -1])
            console.log('tagIsExist : ' + sql)
            db.all(sql, function(err, result){
                if (err){
                    console.log(err)
                    resolve(self.createActionResult(false, '查找标签时发生错误'))
                } else {
                    resolve(self.createActionResult(true, {
                        isParent : FormatUtils.isEmpty(result),
                        message : '查找完成'
                    }))
                }
            })
        })
    },

    /**
     * 删除指定标签
     * @param userID 用户ID
     * @param tagID 标签数据库ID
     */
    tagDelete : function (userID, tagID) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('delete from Tag where _id = ? and user_id = ?', [tagID, userID])
            console.log('tagDelete : ' + sql)
            db.prepare(sql).run(function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true))
            })
        })
    },

    /**
     * 通过ID获取标签信息
     * @param userID
     * @param tagID
     */
    tagGetByID : function (userID, tagID) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Tag where _id = ? and user_id = ?', [tagID, userID])
            console.log('tagGetByID : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                if (FormatUtils.isEmpty(result)){
                    resolve(self.createActionResult(true, null))
                    return
                }
                resolve(self.createActionResult(true, result[0]))
            })
        })
    },

    /**
     * 更新标签
     * @param tagID 标签ID
     * @param userID 用户ID
     * @param parentID 父标签ID
     * @param name 名称
     * @param color 颜色
     * @param icon 图标
     * @param extraInfo 其他信息
     */
    tagUpdate : function (tagID, userID, parentID, name, color, icon, extraInfo) {
        const self = this
        return new Promise(function (resolve, reject) {
            // 参数矫正
            if (FormatUtils.isEmpty(parentID)){
                parentID = -1
            }
            if (FormatUtils.isEmpty(color)){
                color = '#004AD8'
            }
            if (FormatUtils.isEmpty(icon)){
                icon = ''
            }
            if (FormatUtils.isEmpty(extraInfo)){
                extraInfo = ''
            }
            // 更新
            let sql = FormatUtils.formatString('update Tag set parent_id = ? , name = "?" , color = "?" , icon = "?" , extra_info = "?" where _id = ? and user_id = ?', [parentID, name, color, icon, extraInfo, tagID, userID])
            console.log('tagUpdate : ' + sql)
            db.run(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, '更新成功'))
            })
        })
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 插入对象
     * @param userID 用户ID
     * @param targetName 对象名称
     * @return {Promise<object>}
     */
    targetInsert : function (userID, targetName) {
        const self = this
        return new Promise(function (resolve, reject) {
            let stmt = db.prepare('insert into Target(user_id, name, extra_info) values (?, ?, ?)')
            stmt.run(userID, targetName, '{}', function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, '添加对象成功'))
            })
        })
    },

    /**
     * 判断对象名称是否已经存在
     * @param userID 用户ID
     * @param targetName 对象名称
     * @return {Promise<object>}
     */
    targetIsExist : function (userID, targetName) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Target where user_id = ? and name = "?"', [userID, targetName])
            console.log('targetIsExist : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true,{
                    isExist : !FormatUtils.isEmpty(result),
                    targetItem : result[0]
                }))
            })
        })
    },

    /**
     * 删除对象
     * @param userID
     * @param targetID
     */
    targetDelete : function (userID, targetID) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('delete from Target where user_id = ? and _id = ?', [userID, targetID])
            console.log('targetDelete : ' + sql)
            db.prepare(sql).run(function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, '删除对象成功'))
            })
        })
    },

    /**
     * 获取所有的对象列表
     * @param userID
     */
    targetGetList : function(userID){
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Target where user_id = ?', [userID])
            console.log('targetGetList : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    console.log(err)
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, result))
            })
        })
    },

    /**
     * 更改对象内容
     * @param userID
     * @param targetID
     * @param name
     * @param extraInfo
     */
    targetUpdate : function (userID, targetID, name, extraInfo) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('update Target set name="?",extra_info="?" where _id=? and user_id=?', [name, extraInfo, targetID, userID])
            console.log('targetUpdate : ' + sql)
            db.run(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, '操作成功'))
            })
        })
    },

    /**
     * 根据id查询对象
     * @param userID
     * @param targetID
     * @return {Promise<unknown>}
     */
    targetGetByID : function (userID, targetID) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Target where user_id = ? and _id = ?', [userID, targetID])
            console.log('targetGetByID : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    console.log(err)
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                if (FormatUtils.isEmpty(result)){
                    resolve(self.createActionResult(true, null))
                    return
                }
                resolve(self.createActionResult(true, result[0]))
            })
        })
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 添加流水记录
     * @param userID 用户ID
     * @param tagID 标签
     * @param targetID 对象
     * @param recordTime 记录时间
     * @param money 金额
     * @param currency 货币
     * @param description
     * @param extraInfo
     * @return {Promise<unknown>}
     */
    recordInsert : function (userID, tagID, targetID, recordTime, money, currency, description, extraInfo) {
        const self = this
        return new Promise(function (resolve, reject) {
            let currentTimestamp = TimeUtils.currentTimeMillis()
            let stmt = db.prepare('insert into Record (user_id, tag_id, target_id, create_time, modify_time,record_time, money, currency, description, extra_info) values (?,?,?,?,?,?,?,?,?,?)')
            stmt.run(userID, tagID, targetID, currentTimestamp, currentTimestamp, recordTime, money, currency, description, extraInfo, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, '操作成功'))
            })
        })
    },

    /**
     * 删除流水记录
     * @param userID
     * @param recordID
     */
    recordDelete : function (userID, recordID) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('delete from Record where _id = ? and user_id = ?', [recordID, userID])
            console.log('recordDelete : ' + sql)
            let stmt = db.prepare(sql).run(function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, err))
                    return
                }
                resolve(self.createActionResult(true, '操作成功'))
            })
        })
    },

    /**
     * 根据条件筛选流水列表
     * @param userID 必填，用户
     * @param offset 必填，偏移量
     * @param count 必填，获取数量
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param moneyMin 最小金额
     * @param moneyMax 最大金额
     * @param tags 标签列表
     * @param targets 对象列表
     * @param currencies 货币列表
     * @param orderBy 排序方式
     * @param isReverse 是否倒序
     */
    recordGetList : function (userID, startTime, endTime, moneyMin, moneyMax, tags, targets, currencies, orderBy, isReverse, count, offset) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = 'select * from Record where user_id=? '
            let sqlParams = [userID]
            // 开始组装SQL语句
            if (!FormatUtils.isEmpty(tags)){ // 标签
                let tagList = []
                for (index in tags){
                    tagList.push(parseInt(tags[index]))
                }
                sql += 'and tag_id in(?)'
                sqlParams.push(tagList.toString())
            }
            if (!FormatUtils.isEmpty(targets)){ // 对象
                let targetList = []
                for (index in targets){
                    targetList.push(parseInt(targets[index]))
                }
                sql += 'and target_id in(?)'
                sqlParams.push(targetList.toString())
            }
            if (!FormatUtils.isEmpty(currencies)){ // 货币
                let currencyList = []
                for (index in currencies){
                    currencyList.push(parseInt(currencies[index]))
                }
                sql += 'and currency in(?)'
                sqlParams.push(currencyList.toString())
            }
            if (!FormatUtils.isEmpty(moneyMin)){ // 最小金额
                sql += 'and money > ? '
                sqlParams.push(moneyMin)
            }
            if (!FormatUtils.isEmpty(moneyMax)){ // 最大金额
                sql += 'and money < ? '
                sqlParams.push(moneyMax)
            }
            if (!FormatUtils.isEmpty(startTime)){ // 开始时间
                sql += 'and record_time > ? '
                sqlParams.push(startTime)
            }
            if (!FormatUtils.isEmpty(endTime)){ // 结束时间
                sql += 'and record_time < ? '
                sqlParams.push(endTime)
            }
            sql += 'order by ? ' // 排序依据
            sqlParams.push(orderBy)
            if (isReverse){ // 是否倒序
                sql += 'desc '
            }
            sql += 'limit ? ' // 查询数量
            sqlParams.push(count)
            sql += 'offset ? ' // 查询偏移量
            sqlParams.push(offset)
            // 组装结束，执行语句
            sql = FormatUtils.formatString(sql, sqlParams) // 从 offset 开始，获取 count 个
            console.log('recordGetList : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                if (result === undefined || result === null){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, result))
            })
        })
    },

    /**
     * 判断指定的流水记录是否存在
     * @param userID
     * @param recordID
     */
    recordIsExist : function(userID, recordID){
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('select * from Record where user_id=? and _id=?', [userID, recordID])
            console.log('recordIsExist : ' + sql)
            db.all(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                if (FormatUtils.isEmpty(result)){
                    resolve(self.createActionResult(true, {
                        isExist : false
                    }))
                    return
                }
                resolve(self.createActionResult(true, {
                    isExist : false,
                    item : result[0]
                }))
            })
        })
    },

    /**
     * 编辑流水记录
     * @param recordID
     * @param userID
     * @param tagID
     * @param targetID
     * @param recordTime
     * @param money
     * @param currency
     * @param description
     * @param extraInfo
     */
    recordUpdate : function (userID, recordID, tagID, targetID, recordTime, money, currency, description, extraInfo) {
        const self = this
        return new Promise(function (resolve, reject) {
            let sql = FormatUtils.formatString('update Record set tag_id=?,target_id=?,modify_time=?,record_time=?,money=?,currency=?,description="?",extra_info="?" where _id=?,user_id=?', [tagID, targetID, TimeUtils.currentTimeMillis(), recordTime, money, currency, description, extraInfo, recordID, userID])
            console.log('recordUpdate : ' + sql)
            db.run(sql, function (err, result) {
                if (err){
                    resolve(self.createActionResult(false, '服务器内部错误'))
                    return
                }
                resolve(self.createActionResult(true, '操作成功'))
            })
        })
    }


}