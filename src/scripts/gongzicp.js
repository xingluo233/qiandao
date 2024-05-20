import got from "got";
import {digest} from "../tools/utils.js";
import crypto from "crypto";

let token = config.gongzicp.token;
let imei = config.gongzicp.imei;

function getNowFormatDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let Day = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (Day >= 0 && Day <= 9) {
        Day = "0" + Day;
    }
    return year + "-" + month + "-" + Day;
}

function formatUrlMap(paraMap, urlEncode, keyToLower) {
    let arrayList = Object.entries(paraMap);
    arrayList.sort(function (a, b) {
        return a[0].localeCompare(b[0]);
    });
    let sb = [];
    for (let i = 0; i < arrayList.length; i++) {
        let entry = arrayList[i];
        if (entry[0] !== "") {
            let key = entry[0];
            let value = entry[1];
            if (urlEncode) {
                value = encodeURIComponent(value);
            }
            if (keyToLower) {
                sb.push(key.toLowerCase() + "=" + value);
            } else {
                sb.push(key + "=" + value);
            }
        }
    }
    return sb.join("&");
}

function encrypt(data) {
    let key = "JHXqCgsD@LCy8H4k";
    let iv = Buffer.from("BNQxVTg5ZJYJiN+LviWzjQ==", "base64");
    let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8','base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

async function post(options) {
    let time = Math.floor(new Date().getTime() / 1000)
    let aesEncrypt = encrypt(imei)
    let json = formatUrlMap(options.data, true, false)
    let headers
    if(options.version === "v3") {
        let nonce = time + (Math.floor(Math.random() * 10000)).toString()
        let requestKey = digest(json + time + nonce + aesEncrypt + "android_020604" + "fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√", "sha256").substring(10, 42)
        headers = {
            referer: "https://www.gongzicp.com",
            requestKey: requestKey,
            client: "android",
            imei: aesEncrypt,
            nonce: nonce,
            version: "android_020604",
            timestamp: time,
            token: token,
            "User-Agent": "chang pei yue du/2.6.4 (Android 14; Mi 14; Xiaomi)"
        }
    } else {
        let requestKey = digest(json + time + "android_020604" + "fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√", "sha256").substring(10, 42)
        headers = {
            referer: "https://www.gongzicp.com",
            requestKey: requestKey,
            randStr: time.toString(),
            client: "android",
            imei: aesEncrypt,
            version: "android_020604",
            token: token,
            "User-Agent": "chang pei yue du/2.6.4 (Android 14; Mi 14; Xiaomi)"
        }
    }
    return await got({
        url: `https://api1.gongzicp.com/${options.version}/${options.url}`,
        method: "POST",
        json: options.data,
        headers: headers,
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

async function get(options) {
    let time = Math.floor(new Date().getTime() / 1000)
    let aesEncrypt = encrypt(imei)
    let json = formatUrlMap(options.data, true, false)
    let headers
    if(options.version === "v3") {
        let nonce = time + (Math.floor(Math.random() * 10000)).toString()
        let requestKey = digest(json + time + nonce + aesEncrypt + "android_020604" + "fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√", "sha256").substring(10, 42)
        headers = {
            referer: "https://www.gongzicp.com",
            requestKey: requestKey,
            client: "android",
            imei: aesEncrypt,
            nonce: nonce,
            version: "android_020604",
            timestamp: time,
            token: token,
            "User-Agent": "chang pei yue du/2.6.4 (Android 14; Mi 14; Xiaomi)"
        }
    } else {
        let requestKey = digest(json + time + "android_020604" + "fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√", "sha256").substring(10, 42)
        headers = {
            referer: "https://www.gongzicp.com",
            requestKey: requestKey,
            randStr: time.toString(),
            client: "android",
            imei: aesEncrypt,
            version: "android_020604",
            token: token,
            "User-Agent": "chang pei yue du/2.6.4 (Android 14; Mi 14; Xiaomi)"
        }
    }
    return await got({
        url: `https://api1.gongzicp.com/${options.version}/${options.url}`,
        method: "GET",
        searchParams: options.data,
        headers: headers,
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

//签到
async function sign() {
    return await post({
        url: "user/sign",
        data: {
            date: getNowFormatDate()
        },
        version: "v3"
    }).then((res) => {
        return res;
    })
}

//看广告领代券
async function ad() {
    return await post({
        url: "task/takeReward",
        data: {
            task_id: 1
        },
        version: "v3"
    }).then((res) => {
        return res;
    })
}

//看广告剩余次数
async function getad() {
    return await get({
        url: "task/list",
        data: {},
        version: "v3"
    }).then((res) => {
        return res;
    })
}

export default async function main() {
    let result = "【长佩阅读】：";
    if (!token) {
        console.log(`${result}token未填写`);
        return `${result}token未填写`;
    }
    let a = await sign();
    if (a.code === 200) {
        result += "\n    每日签到：已完成    ";
    } else {
        result += `\n    每日签到：${a.msg}    `;
    }
    let adcs = await getad();
    for (let i = 1; i <= adcs.data[0].allowed_times - adcs.data[0].complrted_times; i++) {
        await ad();
    }
    adcs = await getad();
    result += `\n    视频福利：剩余${adcs.data[0].allowed_times - adcs.data[0].complrted_timesn}次机会    `;
    console.log(result);
    return result;
}