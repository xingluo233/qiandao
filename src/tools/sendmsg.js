import got from "got";

let currentTime = new Date();
let year = currentTime.getFullYear();
let month = currentTime.getMonth() + 1;
let day = currentTime.getDate();
let formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;


export default async function push(msg) {
    if (config.Push.qywx.corpsecret) await qywx(msg, config.Push.qywx);
    if (config.Push.telegram.chatid) await tgpush(msg, config.Push.telegram);
    if (config.Push.pushdeer.key) await pushdeer(msg, config.Push.pushdeer);
    if (config.Push.ftqq.key) await ftqq(msg, config.Push.ftqq);
}

async function ftqq(msg) {
    return await got({
        url: `https://sctapi.ftqq.com/${config.Push.ftqq.key}.send`,
        method: "post",
        json: {
            title: `【${formattedDate}】日签到`,
            desp: msg
        },
        responseType: "json"
    }).then(res => {
        return res.body;
    })
}

function tgpush(msg, token) {
    return new Promise(async (resolve) => {
        try {
            //let url = "https://api.telegram.org/bot${tgbotoken}/sendMessage";
            let data = `parse_mode=Markdown&text=${msg.replace(/\n/g, "%0A").replace(/【|】/g, "*")}&chat_id=${token.chatid}`
            let url = `https://tg-bot.0x23.cf/bot${token.tgbotoken}/sendMessage?parse_mode=Markdown&text=${encodeURI(msg.replace(/【|】/g, "*"))}&chat_id=${token.chatid}`
            //let res = await got.post(url,{body:data});
            let res = await got.get(url);
            let $ = JSON.parse(res.body)
            if ($.ok) {
                console.log("Tg：发送成功");
            } else {
                console.log("Tg：发送失败!");
                console.log($);
            }
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

async function pushdeer(msg, token) {
    try {
        let url = "https://api2.pushdeer.com/message/push"
        let body = {
            pushkey: token.key,
            text: `落地成盒【${formattedDate}】`,
            desp: msg.replace(/[【】]/g, "*"),
            type: "markdown"
        }
        let res = await got.post(url, {json: body});
        let $ = JSON.parse(res.body)
        if ($.code === 0) {
            console.log("pushdeer：发送成功");
        } else {
            console.log("Tg：发送失败!" + $.error);
        }
    } catch (err) {
        console.log(err);
    }
}

function qywx(msg, token) {
    return new Promise(async (resolve) => {
        try {
            let {corpsecret, corpid, agentid, mediaid} = token
            let url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`
            let res = await got.get(url)
            let accdata = JSON.parse(res.body)
            let access_token = accdata.access_token
            let turl = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`
            let text = {
                "touser": "@all",
                "msgtype": "text",
                "agentid": agentid ? agentid : 1000002,
                "text": {
                    "content": msg
                },
                "safe": 0
            }

            let mpnews = {
                "touser": "@all",
                "msgtype": "mpnews",
                "agentid": agentid ? agentid : 1000002,
                "mpnews": {
                    "articles": [
                        {
                            "title": `签到盒落子版【${formattedDate}】`,
                            "thumb_media_id": mediaid ? mediaid : "",
                            "author": "wenmoux",
                            "content_source_url": "",
                            "content": msg.replace(/\n/g, "<br>"),
                            "digest": msg
                        }
                    ]
                },
                "safe": 0
            }
            let data = mediaid ? mpnews : text
            let tres = await got.post(turl, {body: JSON.stringify(data)})
            let tdata = JSON.parse(tres.body)
            if (tdata.errcode === 0) {
                console.log("企业微信:发送成功");
            } else {
                console.log("企业微信:发送失败");
                console.log(tdata.errmsg);
            }
        } catch (err) {
            console.log("企业微信：发送接口调用失败");
            console.log(err);
        }
        resolve();
    });
}