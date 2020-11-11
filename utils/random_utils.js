
const TimeUtils = require('./time_utils')
const MD5Node = require('md5-node')

module.exports = {

    /**
     * 随机生成一个登录成功后的Key
     * @return {string}
     */
    generateKey : function () {
        function generateRdStr() {
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let text = "";
            for (let i = 0; i < 8; i++){
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
        let content = TimeUtils.currentTimeMillis().toString()
        content += generateRdStr()
        return MD5Node(content, '56as44d4v13as8d448481k8')
    }

}