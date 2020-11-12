const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database('Liquid.db')
const FormatUtils = require('./format_utils')
const RandomUtils = require('./random_utils')
const TimeUtils = require('./time_utils')

module.exports = {
    TABLE_ACCOUNT : 'Account',

    /**
     * 数据库升级
     */
    update : function(){

    },

    /**
     * 初始化表
     */
    init : async function(){
        // 初始化账号表
        db.run('create table if not exists Account(_id integer primary key autoincrement not null, account text not null unique, password text not null, register_time timestamp default current_timestamp , extra_info text)')
        // 初始化账号和Key的对应表【数据为临时数据，可以清除】
        db.run('create table if not exists AccountAuthKey(key text not null primary key unique , user_id integer not null, create_time timestamp not null default current_timestamp , latest_auth_time timestamp not null default current_timestamp )')
        // 初始化账号和验证码的对应表【数据为临时数据，可以清除】
        db.run('create table if not exists AccountAuthCode(user_id integer primary key not null unique , code text not null , latest_fetch_time timestamp not null default current_timestamp , today_fetch_times integer not null )')
        // 初始化标签表
        db.run('create table if not exists Tag(_id integer primary key autoincrement not null, parent_id integer default -1, user_id integer not null , create_time timestamp default current_timestamp , name text not null , color text , icon text, extra_info text)')
        // 初始化消费对象
        db.run('create table if not exists Target(_id integer primary key autoincrement not null, user_id integer not null, name text not null, extra_info text)')
        // 初始化流水表，一个流水对应一个标签，其中type为0代表支出，type为1代表收入
        db.run('create table if not exists Record(_id integer primary key autoincrement not null, user_id integer not null, tag_id integer not null, create_time timestamp default current_timestamp , modify_time timestamp default current_timestamp, record_time timestamp not null default current_timestamp, type integer not null default 0,money integer real not null, currency integer not null , description text, extra_info text)')
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
     * 数据库基本操作 - 同步查询
     * @param sql sql 语句
     * @return {Promise<unknown>}
     */
    databaseSelectSync : async function(sql){
        const self = this
        return new Promise(function (resolve, reject) {
            console.log(FormatUtils.formatString('数据库查询：?', [sql]))
            db.all(sql, function (err, result) {
                resolve(self.databaseCreateResult(err, result))
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
            let stmt = db.prepare('insert into Account (account, password) values (?,?)')
            stmt.run(account, password, function (err, result) {
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
            let sql = 'insert into AccountAuthKey(key, user_id) values (?, ?)'
            console.log('authInsertKey : ' + sql)
            let stmt = db.prepare(sql)
            stmt.run(key, userID, function (err, result) {
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
            let sql = FormatUtils.formatString('update AccountAuthKey set latest_auth_time = current_timestamp where key = "?"', [key])
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

    },

}