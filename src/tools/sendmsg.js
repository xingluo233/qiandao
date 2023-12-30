import got from "got"
var currentTime = new Date();
var year = currentTime.getFullYear();
var month = currentTime.getMonth() + 1;
var day = currentTime.getDate();
var formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;


export default async function push(msg, token) {
    if(token.qywx.corpsecret)await qywx(msg, token.qywx)
    if(token.telegram.chatid)await tgpush(msg, token.telegram)
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
function qywx(msg, token) {
    return new Promise(async (resolve) => {
        try {
            let { corpsecret, corpid, agentid, mediaid } = token
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
            let tres = await got.post(turl, { body: JSON.stringify(data) })
            let tdata = JSON.parse(tres.body)
            if (tdata.errcode == 0) {
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