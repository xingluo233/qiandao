import got from "got";
import {digest, uuid} from "../tools/utils.js";

let cookie = config.sfacg.cookie;
let devicetoken = config.sfacg.devicetoken;
let userId = config.sfacg.userId;

const SALT = "FN_Q29XHVmfV3mYX"
const version = "5.0.52"

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

async function get(url) {
    let nonce = uuid().toUpperCase();
    let timestamp = Math.round(new Date().getTime()).toString();
    let sign = digest(nonce + timestamp + devicetoken.toUpperCase() + SALT, "md5").toUpperCase();
    return await got({
        url: url,
        method: "get",
        headers: {
            cookie: cookie,
            authorization: "Basic YW5kcm9pZHVzZXI6MWEjJDUxLXl0Njk7KkFjdkBxeHE=",
            "user-agent": `boluobao/${version}(android;34)/H5/${devicetoken}/H5`,
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
        url: options.url,
        method: options.method,
        json: options.data,
        headers: {
            cookie: cookie,
            authorization: "Basic YW5kcm9pZHVzZXI6MWEjJDUxLXl0Njk7KkFjdkBxeHE=",
            "user-agent": `boluobao/${version}(android;34)/H5/${devicetoken}/H5`,
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
    return await get(`https://api.sfacg.com/user/tasks?taskCategory=1&package=com.sfacg&deviceToken=${devicetoken}&page=0&size=20`).then(res => {
        return res.data;
    })
}

//签到
async function sign() {
    return await post({
        url: "https://api.sfacg.com/user/newSignInfo",
        method: "put",
        data: {
            signDate: getNowFormatDate()
        }
    }).then(res => {
        return res;
    })
}

//领取任务
async function lqrw(id) {
    return await post({
        url: `https://api.sfacg.com/user/tasks/${id}`,
        method: "post",
        data: {}
    }).then(res => {
        return res;
    })
}

//领取奖励
async function lqjl(id) {
    return await post({
        url: `https://api.sfacg.com/user/tasks/${id}`,
        method: "put",
        data: {}
    }).then(res => {
        return res;
    })
}

async function getad() {
    return await get(`https://api.sfacg.com/user/tasks?taskCategory=5&package=com.sfacg&deviceToken=${devicetoken}&page=0&size=20`).then(res => {
        return res.data;
    })
}

//看广告领代券
async function ad() {
    return await post({
        url: `https://api.sfacg.com/user/tasks/21/advertisement?aid=43&deviceToken=${devicetoken}`,
        method: "put",
        data: {
            num: 1
        }
    }).then(res => {
        return res;
    })
}

//天天分享
async function share(userId) {
    return await post({
        url: `https://api.sfacg.com/user/tasks?taskId=4&userId=${userId}`,
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
        url: "https://api.sfacg.com/user/readingtime",
        method: "put",
        data: {
            seconds: time,
            entityType: 2,
            chapterId: 4709238,
            entityId: 368037,
            readingDate: getNowFormatDate()
        }
    }).then(res => {
        return res;
    })
}

export default async function main() {
    let result = "【菠萝包轻小说】：";
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
    let adcs = await getad();
    for (let i = 1; i <= adcs[0].requireNum - adcs[0].completeNum; i++) {
        await ad();
        await lqjl(21);
    }
    console.log(result);
    return result;
}