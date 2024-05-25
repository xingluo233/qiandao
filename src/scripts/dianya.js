import got from "got";
import {digest, uuid} from "../tools/utils.js";

let cookie = config.dianya.cookie;
let devicetoken = config.dianya.devicetoken;

const SALT = "xw3#a12-x"
const  version = "1.9.28"

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

async function get(options) {
    let nonce = uuid().toUpperCase();
    let timestamp = Math.round(new Date().getTime()).toString();
    let sign = digest(nonce + timestamp + devicetoken.toUpperCase() + SALT, "md5").toUpperCase();
    return await got({
        url: `https://api.sfacg.com/${options.url}`,
        method: "get",
        searchParams: options.data,
        headers: {
            cookie: cookie,
            authorization: "Basic ZGlhbnlhdXNlcjpkZVBtM2MjcTRfQXQ=",
            "user-agent": `boluobao_chatnovel/${version}(android;34)/H5/${devicetoken}/Google`,
            "sfsecurity": `nonce=${nonce}&timestamp=${timestamp}&devicetoken=${devicetoken.toUpperCase()}&sign=${sign}`
        },
        responseType: "json"
    }).then(res => {
        return res.body;
    }).catch(err => {
        return err.response.body;
    })
}

async function post(options) {
    let nonce = uuid().toUpperCase();
    let timestamp = Math.round(new Date().getTime()).toString();
    let sign = digest(nonce + timestamp + devicetoken.toUpperCase() + SALT, "md5").toUpperCase();
    return await got({
        url: `https://api.sfacg.com/${options.url}`,
        method: options.method,
        json: options.data,
        headers: {
            cookie: cookie,
            authorization: "Basic ZGlhbnlhdXNlcjpkZVBtM2MjcTRfQXQ=",
            "user-agent": `boluobao_chatnovel/${version}(android;34)/H5/${devicetoken}/Google`,
            "sfsecurity": `nonce=${nonce}&timestamp=${timestamp}&devicetoken=${devicetoken.toUpperCase()}&sign=${sign}`
        },
        responseType: "json"
    }).then(res => {
        return res.body;
    }).catch(err => {
        return err.response.body;
    })
}

//查询任务
async function gettask() {
    return await get({
        url: `user/tasks`,
        data: {
            taskCategory: 1,
            package: "com.sfacg.chatnovel",
            deviceToken: devicetoken,
            page: 0,
            size: 20
        }
    }).then(res => {
        return res.data;
    })
}

//签到
async function sign() {
    return await post({
        url: "user/newSignInfo",
        method: "put",
        data: {
            signDate: ""
        }
    }).then(res => {
        return res;
    })
}

//领取奖励
async function lqjl(id) {
    return await post({
        url: `user/tasks/${id}`,
        method: "put",
        data: {}
    }).then(res => {
        return res;
    })
}

async function getad() {
    return await get({
        url: `user/tasks`,
        data: {
            taskCategory: 5,
            package: "com.sfacg.chatnovel",
            deviceToken: devicetoken,
            page: 0,
            size: 20
        }
    }).then(res => {
        return res.data;
    })
}

//看广告领代券
async function ad() {
    return await post({
        url: `user/tasks/72/advertisement?aid=43&deviceToken=${devicetoken}`,
        method: "put",
        data: {
            num: 1
        }
    }).then(res => {
        return res;
    })
}

//阅读时长
async function read(time) {
    return await post({
        url: "user/readingtime",
        method: "put",
        data: {
            seconds: time,
            entityType: 5,
            chapterId: 8270934,
            entityId: 688020,
            readingDate: getNowFormatDate()
        }
    }).then(res => {
        return res;
    })
}

export default async function main() {
    let result = "【点鸭】：";
    if (!cookie || !devicetoken) {
        console.log(`${result}cookie或devicetoken未填写`);
        return 0;
    }
    let a = await sign();
    if (a.status.httpCode === 200) {
        result += "\n    每日签到：已完成    ";
    } else {
        result += `\n    每日签到：${a.status.msg}    `;
    }
    let adcs = await getad();
    for (let i = 1; i <= 5; i++) {
        await ad();
        await lqjl(72);
    }
    await read(12000);
    let tasklist = await gettask();
    for (let i of tasklist) {
        if (i.status === 1) {
            await lqjl(i.taskId);
        }
    }
    tasklist = await gettask();
    for (let i of tasklist) {
        if (i.type === "signIn") continue;
        let taskname = i.name;
        let status = i.status === 2 ? "已完成" : "未完成";
        result += `\n    ${taskname}：${status}`;
    }
    console.log(result);
    return result;
}