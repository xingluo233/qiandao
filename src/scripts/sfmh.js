import got from "got";
import {digest, uuid} from "../tools/utils.js";

let cookie = config.sfmh.cookie;
let devicetoken = config.sfmh.devicetoken;
let userId = config.sfmh.userId;

const SALT = "xw3#a12-x"
const version = "1.5.18"

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
            authorization: "Basic Y29taWN1c2VyOmczQGYsRGo1dnJ3c1o=",
            "user-agent": `boluobao_comic/${version}(android;34)/H5/${devicetoken}/H5`,
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
            authorization: "Basic Y29taWN1c2VyOmczQGYsRGo1dnJ3c1o=",
            "user-agent": `boluobao_comic/${version}(android;34)/H5/${devicetoken}/H5`,
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
        url: "comic/signInfo",
        method: "put",
        data: {}
    }).then(res => {
        return res;
    })
}

//领取任务
async function lqrw(id) {
    return await post({
        url: `user/tasks/${id}`,
        method: "post",
        data: {}
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

//分享
async function share(userId) {
    return await post({
        url: `user/tasks?taskId=25&userId=${userId}`,
        method: "put",
        data: {
            env: 0
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
            entityType: 1,
            chapterId: 81461,
            entityId: 2937,
            readingDate: getNowFormatDate()
        }
    }).then(res => {
        return res;
    })
}

export default async function main() {
    let result = "【菠萝包漫画】：";
    if (!cookie || !devicetoken || !userId) {
        console.log(`${result}cookie,userId或devicetoken未填写`);
        return 0;
    }
    let a = await sign();
    if (a.status.httpCode === 200) {
        result += "\n    每日签到：已完成    ";
    } else {
        result += `\n    每日签到：${a.status.msg}    `;
    }
    let tasklist = await gettask();
    for (let i of tasklist) {
        if (i.status === 0) {
            await lqrw(i.taskId);
        }
    }
    await share(userId);
    await read(9000);
    tasklist = await gettask();
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