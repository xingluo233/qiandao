import got from "got";
import {sleep} from "../tools/utils.js";

let token = config.kurobbs.token;
let userId = config.kurobbs.userId;
let devCode = config.kurobbs.devCode;
let distinctId = config.kurobbs.distinctId
let model = config.kurobbs.model;

async function post(option) {
    return await got.post({
        url: `https://api.kurobbs.com/${option.url}`,
        method: "POST",
        form: option.data,
        headers: {
            osVersion: "Android",
            devCode: devCode,
            distinct_id: distinctId,
            countryCode: "CN",
            ip: "",
            model: model,
            source: "android",
            lang: "zh-Hans",
            version: "2.1.1",
            versionCode: 2110,
            token: token,
            "User-Agent": "okhttp/3.11.0"
        },
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

//帖子列表
async function bbsList() {
    return await post({
        url: "forum/list",
        data: {
            forumId: 10,
            gameId: 3,
            pageIndex: 1,
            pageSize: 20,
            searchType: 1,
            timeType: 0,
            topicId: 0
        }
    })
}

//社区签到
async function bbsSign() {
    return await post({
        url: "user/signIn",
        data: {
            gameId: 2
        }
    })
}

//分享
async function share() {
    return await post({
        url: "encourage/level/shareTask",
        data: {
            gameId: 3
        }
    })
}

//点赞 type 1是点赞，2是取消点赞
async function like(type, bbs) {
    return await post({
        url: "forum/like",
        data: {
            forumId: bbs.gameForumId,
            gameId: 3,
            likeType: 1,
            operateType: type,
            postCommentId: 0,
            postCommentReplyId: 0,
            postId: bbs.postId,
            postType: bbs.postType,
            toUserId: bbs.userId
        }
    })
}

//浏览帖子
async function getBbs(bbs) {
    return post({
        url: "forum/getPostDetail",
        data: {
            isOnlyPublisher: 0,
            postId: bbs.postId,
            showOrderType: 2
        }
    })
}

//任务列表
async function task() {
    return post({
        url: "encourage/level/getTaskProcess",
        data: {
            gameId: 0,
            userId: userId
        }
    })
}

export default async function main() {
    let result = "【库街区】：";
    await bbsSign();
    let ls = []
    let bbslist = await bbsList();
    for (let i = 1; i <= 5; i++) {
        let random = Math.floor(Math.random() * bbslist.data.postList.length);
        ls.push(random)
        if (ls.includes(random)) {
            i--;
            continue;
        }
        let bbs = bbslist.data.postList[random];
        await like(1, bbs);
        await like(2, bbs);
    }
    await share();
    ls = [];
    for (let j = 1; j <= 3; j++) {
        let random = Math.floor(Math.random() * bbslist.data.postList.length);
        ls.push(random)
        if (ls.includes(random)) {
            i--;
            continue;
        }
        let bbs = bbslist.data.postList[random];
        await getBbs(bbs);
        await sleep(3000);
    }
    let taskList = await task();
    for (let i of taskList.data.dailyTask) {
        let taskName = i.remark;
        let status = i.completeTimes === i.needActionTimes ? "已完成" : "未完成";
        result += `\n    ${taskName}：${status}`;
    }
    console.log(result);
    return result;
}