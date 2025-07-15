import axios from "axios";

export default {
    // 请求主机
    ncvtHost: "https://class.bigdata.ncvt.net/",
    /**
     * NCVT GET 请求
     * @param {string} url 请求的 URL
     * @returns {Promise} 返回一个 Promise 对象，解析为响应数据或拒
     **/
    ncvtGET(url) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: this.ncvtHost + url,
                timeout: 5000,
            })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.message);
                });
        });
    },
    /**
     * NCVT POST 请求
     * @param {string} url 请求的 URL
     * @param {Object} data 请求的数据
     * @returns {Promise} 返回一个 Promise 对象，解析为响应数据或拒绝错误
     **/
    ncvtPOST(url, data) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: this.ncvtHost + url,
                data: data,
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
            })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.message);
                });
        });
    },
    /**
     * FIF POST 请求
     * @param {string} url 请求的 URL
     * @param {Object} data 请求的数据
     * @returns {Promise} 返回一个 Promise 对象，解析为响应数据或拒绝错误
     **/
    fifPOST(url, data) {
        const userToken = localStorage.getItem('Authorization')
        const userInfo = JSON.parse(localStorage.getItem('userInfo')).data
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: url,
                data: data,
                timeout: 5000,
                headers: {
                    'loginName': userInfo.loginName,
                    'language': 2,
                    'Authorization': `Bearer ${userToken}`,
                    'realName': encodeURIComponent (userInfo.realName),
                    'source': '10003',
                    'userRole': '0',
                    'userId': userInfo.userId,
                    'clientType':'6',
                    'userNo': userInfo.userNo,
                    'schoolId': userInfo.schoolId,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.message);
                });
        });
    }
};
