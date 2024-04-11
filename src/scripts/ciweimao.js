import got from "got";
import crypto from "crypto";
import {sleep} from "../tools/utils.js";

let account = config.ciweimao.account;
let login_token = config.ciweimao.token;
let device_token = "ciweimao_";
let app_version = "2.9.322";

function decrypt(data) {
    let key = crypto.createHash('sha256').update('zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn').digest();
    let iv = Buffer.alloc(16, 0);
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function getNowFormatDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let aDate = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
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
    if (sec >= 0 && sec <= 9) {
        sec = "0" + sec;
    }
    return `${year}-${month}-${aDate} ${hour}:${min}:${sec}`;
}

async function post(options) {
    return await got({
        url: `https://app.happybooker.cn/${options.url}`,
        method: "POST",
        form: {
            ...options.data,
            app_version,
            device_token,
            account,
            login_token
        },
        headers: {
            "user-agent": `Android  com.kuangxiangciweimao.novel  ${app_version},Xiaomi, Mi 14, 34, 14`
        }
    }).then(res => {
        return JSON.parse(decrypt(res.body)).data;
    })
}

const book = {
    data: [{
        bid: "100346721",
        list: ["109614912", "109589642", "109586662", "109589701", "109631032", "109631029", "109625745", "109626991", "109643147", "109638517"]
    },
        {
            bid: "100293922",
            list: ["108315620", "108284663", "108289456", "108294592", "108267077", "108272356", "108239560", "108248456", "108220236", "108215820"]
        },
        {

            bid: "100323512",
            list: ["109012824", "109013007", "108980293", "108989400", "108952587", "108942799", "108933344", "108927340", "108915351", "108904304"]
        },
        {
            bid: "100338867",
            list: ["109363038", "109360440", "109351751", "109340611", "109337642", "109321224", "109325405", "109326171", "109323353", "109319366"]
        },
        {
            bid: "100343334",
            list: ["109562898", "109563193", "109537168", "109541302", "109537184", "109502951", "109499567", "109482527", "109482930", "109476426"]
        }
    ]
}

async function getBbsId() {
    return await post({
        url: "bbs/get_bbs_list",
        data: {
            bbs_type: 5,
            count: 10,
            page: 0
        }
    }).then((res) => {
        return res;
    })
}

//签到
async function sign() {
    return await post({
        url: "reader/get_task_bonus_with_sign_recommend",
        data: {
            task_type: 1
        }
    }).then((res) => {
        return res;
    })
}

//阅读60min
async function addr() {
    let a = Math.floor(Math.random() * 9);
    let b = Math.floor(Math.random() * 4);
    let bid = book.data[b].bid;
    let cid = book.data[b].list[a];
    return await post({
        url: "reader/add_readbook",
        data: {
            readTimes: 1200,
            getTime: getNowFormatDate(),
            book_id: bid,
            chapter_id: cid
        }
    }).then((res) => {
        return res;
    })
}

//浏览插画区5min
async function addb() {
    return await post({
        url: "bbs/add_bbs_read_time",
        data: {
            readTimes: 300,
            getTime: getNowFormatDate()
        }
    }).then((res) => {
        return res;
    })
}

//分享插画区帖子
async function share_bbs() {
    let random = Math.floor(Math.random() * 10);
    let bbs_list = (await getBbsId()).bbs_list;
    let bbs_id = bbs_list[random].bbs_id;
    return await post({
        url: "bbs/share_bbs",
        data: {
            bbs_id: bbs_id
        }
    }).then((res) => {
        return res;
    })
}

//点赞5个插画区帖子
async function dianzan() {
    let bbs_list = (await getBbsId()).bbs_list;
    for (let i = 0; i < 5; i++) {
        let bbs_id = bbs_list[i].bbs_id;
        await post({
            url: `bbs/unlike_bbs`,
            data: {
                bbs_id: bbs_id
            }
        })
        await post({
            url: `bbs/like_bbs`,
            data: {
                bbs_id: bbs_id
            }
        })
        await post({
            url: `bbs/unlike_bbs`,
            data: {
                bbs_id: bbs_id
            }
        })
    }
}

//在插画区评论3条帖子
async function pl() {
    let bbs_list = (await getBbsId()).bbs_list;
    for (let i = 1; i <= 3; i++) {
        let bbs_id = bbs_list[i].bbs_id;
        await post({
            url: "bbs/add_bbs_comment",
            data: {
                bbs_id: bbs_id,
                comment_content: "#(滑稽)"
            }
        })
        await sleep(5000);
    }
}

//任务列表
async function gettask() {
    return await post({
        url: "task/get_all_task_list",
        data: {}
    }).then((res) => {
        return res;
    })
}

async function ce() {
    let res = await gettask();
    let a = res.daily_task_list[2].task_type;
    switch (a) {
        case "19":
            await addb();
            break; //浏览插画区5min
        case "20":
            await share_bbs();
            break; //分享插画区帖子
        case "21":
            await dianzan("like");
            break; //点赞5个插画区帖子
        case "22":
            await pl();
            break; //在插画区评论3条帖子
    }
}

export default async function main() {
    let result = "【刺猬猫小说】：";
    if (!account || !login_token) {
        console.log(`${result}account或者login_token未填写`);
        return 0;
    }
    await sign();
    await addr();
    await addr();
    await addr();
    await ce();
    let res = await gettask();
    let tasklist = res.daily_task_list;
    for (let i in tasklist) {
        let taskname = tasklist[i].name;
        let status = tasklist[i].is_finished === "1" ? "已完成" : "未完成";
        result += `\n    ${taskname}：${status}`;
    }
    console.log(result);
    return result;
}