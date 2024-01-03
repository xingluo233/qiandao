import cheerio from "cheerio";
import got from "got";

let cookie = config.mt.cookie;

export default async function main() {
    let result = "【MT论坛】：";
    if (!cookie) {
        console.log(`${result}请填写cookie`);
        return `${result}请填写cookie`;
    }
    let response = await got.get("https://bbs.binmt.cc/k_misign-sign.html", {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.54",
            cookie: cookie
        }
    });
    let $ = cheerio.load(response.body);
    if ($("#JD_sign").attr("href") !== "member.php?mod=logging&action=login") {
        let formhash = $("[name=formhash]").attr("value");
        await got.get(`https://bbs.binmt.cc/plugin.php?id=k_misign:sign&operation=qiandao&formhash=${formhash}&format=empty&inajax=1&ajaxtarget=`, {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.54",
                cookie: cookie
            }
        }).then(res => {
            let $ = cheerio.load(res.body, {
                xmlMode: true
            });
            if ($("root").text() === "今日已签") result += "今天已经签过到了";
            else result += "签到成功";
        })
    } else {
        result += `cookie已失效`;
    }
    return result;
}