import got from "got";
import crypto from "crypto";

let publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQClTsX4wJRr7xW7EKVUtSUg/K1frM2UGUOUya6MQCXwl+hHXxyqnf03lPKOdF2tTKARGoFVuy1EDLHca47rrnxt4SgtupzWy6W3sAda3Em5akn2onPkkUmPynnQD7ORW7N77frZ+cMX3eKhSx5njfiftD2CWy6bYD57fXY8NXSCSQIDAQAB
-----END PUBLIC KEY-----`;

let aesKey = Buffer.from(config.bkneng.aesKey, "base64");
let aesData = Buffer.from(config.bkneng.aesData, "base64");

let n4 = config.bkneng.n4
let n5 = config.bkneng.n5
let device = config.bkneng.device
let token = config.bkneng.token
let username = config.bkneng.username

let key = Buffer.from(crypto.publicDecrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
}, aesKey).toString(), "base64")


let decipher = crypto.createDecipheriv('aes-128-cbc', key, key);
let decrypted = JSON.parse(decipher.update(aesData, 'base64', 'utf8') + decipher.final('utf8'));
let userPriKey = `-----BEGIN PRIVATE KEY-----
${decrypted.userPriKey}
-----END PRIVATE KEY-----`

async function post(options) {
    let time = new Date().getTime();
    let sign = crypto.createSign('SHA1').update(`${new URLSearchParams(options.data)}&device=__${device}&timestamp=${time}&token=${token}&username=${username}`).sign(userPriKey, 'base64');
    return await got({
        url: `https://gt.bkneng.com/${options.url}`,
        method: "post",
        form: {
            n1: 100018,
            n2: 10054,
            n3: 2,
            n4: n4,
            n5: n5,
            n6: "com.bkneng.reader",
            ...options.data,
            device: device,
            sign: sign,
            timestamp: time,
            token: token,
            username: username
        },
        headers: {
            "user-agent": "okhttp/3.11.0"
        },
        responseType: "json"
    }).then(res => {
        return res.body
    })
}

async function get(options) {
    let time = new Date().getTime();
    let sign = crypto.createSign('SHA1').update(`${new URLSearchParams(options.data)}&device=__${device}&timestamp=${time}&token=${token}&username=${username}`).sign(userPriKey, 'base64');
    return await got({
        url: `https://gt.bkneng.com/${options.url}`,
        method: "get",
        searchParams: {
            n1: 100018,
            n2: 10054,
            n3: 2,
            n4: n4,
            n5: n5,
            n6: "com.bkneng.reader",
            ...options.data,
            device: device,
            sign: encodeURIComponent(sign),
            timestamp: time,
            token: token,
            username: username
        },
        headers: {
            "user-agent": "okhttp/3.11.0"
        },
        responseType: "json"
    }).then(res => {
        return res.body
    }).catch(err => {
        return err.response
    })
}

//签到
async function sign() {
    return await get({
        url: "user/out/welfare/checkIn",
        data: {
            day: new Date().getDay()
        }
    }).then((res) => {
        return res;
    })
}

export default async function main() {
    let result = "【不可能的世界】：";
    console.log(await sign())
    return result;
}