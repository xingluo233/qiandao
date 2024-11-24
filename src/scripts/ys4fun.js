import got from 'got';
import {digest, sleep} from "../tools/utils.js";

let authorization = config.ys4fun.authorization;

function generateNonce() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let t = "";
    for (let n = 0; n < 10; n++) {
        const r = Math.floor(Math.random() * e.length);
        t += e.charAt(r);
    }
    return t;
}

function u3e(e, nonce, time) {
    let secret = "d9d973c01b3517aef6b9c2a7dacde323";
    let i = "";
    const s = [];
    for (const a in e)
        s.push(a);
    s.sort();
    for (const a of s) {
        i = i + "&" + a + "=" + e[a];
    }
    i = i.substring(1) + "&appSecret=" + secret + "&nonce=" + nonce + "&timestamp=" + time
    return digest(i, "md5");
}

async function get(option) {
    let time = new Date().getTime();
    let params = {
        ...option.params,
        _t: time,
    };
    let nonce = generateNonce();
    let sign = u3e(params, nonce, time)
    return await got({
        url: `https://bbs-api.ys4fun.com/bbs-api/${option.url}`,
        method: "GET",
        searchParams: params,
        headers: {
            Authorization: authorization,
            "Client-type": 1,
            priority: "u=1, i",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "x-api-nonce": nonce,
            "x-api-signature": sign,
            "x-api-signtype": "md5",
            "x-api-timestamp": time
        },
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

async function post(option) {
    let time = new Date().getTime();
    let params = {
        ...option.params,
        _t: time,
    };
    let nonce = generateNonce();
    let sign = u3e(option.data, nonce, time)
    return await got({
        url: `https://bbs-api.ys4fun.com/bbs-api/${option.url}`,
        method: "POST",
        searchParams: params,
        form: option.data,
        headers: {
            Authorization: authorization,
            "Client-type": 1,
            priority: "u=1, i",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "x-api-nonce": nonce,
            "x-api-signature": sign,
            "x-api-signtype": "md5",
            "x-api-timestamp": time
        },
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

//任务列表
async function gettask() {
    return await get({
        url: "user_level/my_level",
        params: {
            gameId: 1
        }
    }).then((res) => {
        return res;
    })
}

//签到
async function sign() {
    return await get({
        url: "user_sign_in/add",
        params: {
            gameId: 1
        }
    }).then((res) => {
        return res;
    })
}

//帖子列表
async function bbsList() {
    return await get({
        url: "post/list",
        params: {
            gameId: 1,
            isFirstPage: true,
            lastId: 0,
            size: 10,
            sort: 2,
            listType: 3,
            categoryIds: 11
        }
    })
}

//点赞 type add是点赞，cancel是取消点赞
async function like(type, postId) {
    return await post({
        url: `post_like/${type}`,
        data: {
            postId: postId
        }
    })
}

//浏览帖子
async function getBbs(postId) {
    return get({
        url: `post/get/${postId}`,
        params: {}
    })
}


export default async function main() {
    let result = "【弥弥尔频道】：";
    if (!authorization) {
        console.log(`${result}authorization未填写`);
        return 0;
    }
    await sign();
    let ls = []
    let bbslist = await bbsList();
    for (let i = 1; i <= 5; i++) {
        let random = Math.floor(Math.random() * bbslist.data.list.length);
        if (ls.includes(random)) {
            i--;
            continue;
        }
        ls.push(random);
        let bbs = bbslist.data.list[random];
        await getBbs(bbs.id)
        await like("add", bbs.id);
        await like("cancel", bbs.id);
    }
    await sleep(3000);
    let res = await gettask();
    let tasklist = res.data.dayTaskList;
    for (let item of tasklist) {
        let taskname = item.name;
        let status = item.currentNumber === item.totalNumber ? "已完成" : "未完成";
        result += `\n    ${taskname}：${status}`;
    }
    console.log(result);
    return result;
}