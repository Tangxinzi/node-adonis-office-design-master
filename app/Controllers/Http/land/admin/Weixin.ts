const Env = require('@ioc:Adonis/Core/Env');
const axios = require('axios');

function jscode2session(code) {
  return new Promise((resolve, reject) => {
    return axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${'wx8f18e8f9cc9c49f2' }&secret=${ 'd27c32f434eb5685cc10dd381976bf93' }&js_code=${ code }&grant_type=authorization_code`)
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  });
}

function token() {
  return new Promise((resolve, reject) => {
    return axios.get(`https://api.weixin.qq.com/cgi-bin/token?appid=${'wx8f18e8f9cc9c49f2' }&secret=${ 'd27c32f434eb5685cc10dd381976bf93' }&grant_type=client_credential`)
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  });
}

function getUserPhoneNumber(access_token, data) {
  return new Promise((resolve, reject) => {
    return axios.post(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${ access_token }`, {
      code: data.code,
      openid: data.openid
    })
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  });
}

module.exports = {
  jscode2session,
  token,
  getUserPhoneNumber
}
