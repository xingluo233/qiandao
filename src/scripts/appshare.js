import got from "got";
import {digest} from "../tools/utils.js";

let token = config.appshare.token;

function getNowFormatDate(timestamp) {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let aDate = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (aDate >= 1 && aDate <= 9) {
        aDate = "0" + aDate;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (min >= 0 && min <= 9) {
        min = "0" + min;
    }
    return `${year}${month}${aDate}${hour}${min}`;
}

async function get(options) {
    let timestamp = new Date().getTime();
    let sign = digest(token + getNowFormatDate(timestamp), "md5").toUpperCase();
    return await got({
        url: `https://appshare.vip/${options.url}`,
        method: "get",
        searchParams: {
            token: token,
            oaid: token,
            ...options.data,
            sign: sign
        },
        headers: {
            api_sign: `${options.url}:${sign}:${timestamp}`,
            device: "23049RAD8C",
            brand: "Redmi",
            android_sdk: 34,
            versionName: "3.1.6",
            versionCode: "xQew4MDDtGdB18CcP9dp9g%3D%3D",
            "User-Agent": "okhttp/4.12.0"
        },
        responseType: "json"
    }).then(res => {
        return res.body;
    }).catch(err => {
        return err.response.body;
    })
}

//签到
async function sign() {
    return await get({
        url: "user/v1/daySign",
        data: {}
    }).then((res) => {
        return res;
    })
}

export default async function main() {
    let result = "【AppShare】：";
    if (!token) {
        console.log(`${result}token未填写`);
        return `${result}token未填写`;
    }
    let a = await sign();
    if (a.code === 100) {
        result += "\n    每日签到：已完成    ";
    } else {
        result += `\n    每日签到：${a.message}    `;
    }
    console.log(result);
    return result;
}