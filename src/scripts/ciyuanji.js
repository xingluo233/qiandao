import got from "got";
import CryptoJS from "crypto-js";
import {digest, base64Encode, uuid} from "../tools/utils.js";

let token = config.ciyuanji.token;
let deviceno = config.ciyuanji.deviceno;
let oaid = config.ciyuanji.oaid;
let targetmodel = config.ciyuanji.targetmodel;
let version = "3.4.2";

function encrypt(data) {
    let key = CryptoJS.enc.Utf8.parse('ZUreQN0E');
    let encrypted = CryptoJS.DES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

const headers = {
    channel: 25,
    deviceno: deviceno,
    platform: 1,
    imei: "",
    targetmodel: targetmodel,
    oaid: oaid,
    version: version,
    token: token,
    "user-agent": "Mozilla/5.0 (Linux; Android 11; Pixel 4 XL Build/RP1A.200720.009; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.115 Mobile Safari/537.36"
}

async function get(options) {
    let timestamp = new Date().getTime();
    let requestId = uuid();
    let param = encrypt(JSON.stringify({
        ...options.data,
        timestamp: timestamp
    }));
    let sign = digest(base64Encode(`param=${param}&requestId=${requestId}&timestamp=${timestamp}&key=NpkTYvpvhJjEog8Y051gQDHmReY54z5t3F0zSd9QEFuxWGqfC8g8Y4GPuabq0KPdxArlji4dSnnHCARHnkqYBLu7iIw55ibTo18`), "md5").toUpperCase();
    return await got({
        url: `https://api.hwnovel.com/api/ciyuanji/client/${options.url}`,
        method: "GET",
        searchParams: {
            param,
            requestId,
            sign,
            timestamp
        },
        headers,
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

async function post(options) {
    let timestamp = new Date().getTime();
    let requestId = uuid();
    let param = encrypt(JSON.stringify({
        ...options.data,
        timestamp: timestamp
    }));
    let sign = digest(base64Encode(`param=${param}&requestId=${requestId}&timestamp=${timestamp}&key=NpkTYvpvhJjEog8Y051gQDHmReY54z5t3F0zSd9QEFuxWGqfC8g8Y4GPuabq0KPdxArlji4dSnnHCARHnkqYBLu7iIw55ibTo18`), "md5").toUpperCase();
    return await got({
        url: `https://api.hwnovel.com/api/ciyuanji/client/${options.url}`,
        method: "POST",
        json: {
            param,
            requestId,
            sign,
            timestamp
        },
        headers,
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

//签到
async function sign() {
    return await post({
        url: "sign/sign",
        data: {}
    }).then((res) => {
        return res;
    })
}

//领取奖励
async function lqjl(taskId, rewardId) {
    return await post({
        url: "task/receiveTaskReward",
        data: {
            taskId: taskId,
            rewardId: rewardId
        }
    }).then(res => {
        return res.data;
    })
}

//任务列表
async function gettask() {
    return await get({
        url: "task/getTaskList",
        data: {}
    }).then((res) => {
        return res.data;
    })
}

export default async function main() {
    let result = "【次元姬小说】：";
    if (!token) {
        console.log(`${result}token未填写`);
        return 0;
    }
    let a = await sign();
    if (a.code === "200") {
        result += "\n    每日签到：已完成    ";
    } else {
        result += `\n    每日签到：${a.msg}    `;
    }
    let tasklist = await gettask();
    for (let i of tasklist.daliyTask) {
        if (i.taskState === "1") {
            await lqjl(i.taskId, i.rewardId);
        }
    }
    tasklist = await gettask();
    for (let i of tasklist.daliyTask) {
        let taskname = i.taskName;
        let status = i.taskState === "2" ? "已完成" : "未完成";
        result += `\n    ${taskname}：${status}`;
    }
    console.log(result);
    return result;
}