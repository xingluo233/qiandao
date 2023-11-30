import cheerio from "cheerio";
import got from "got";

let cookie = config.kanxue.cookie;

export default async function main() {
    let result = "【看雪论坛】："
    if (!cookie) {
        console.log(`${result}请填写cookie`);
        return `${result}请填写cookie`;
    }
    let response = await got.get("https://bbs.kanxue.com/", {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.54",
            cookie: cookie
        }
    });
    let $ = cheerio.load(response.body);
    if ($("a.login_btn").text() !== "登录") {
        let csrftoken = $("[name=csrf-token]").attr("content");
        await got.post("https://bbs.kanxue.com/user-signin.htm",{
            body: `csrf_token=${csrftoken}`,
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.54",
                cookie: cookie
            }
        }).then(res =>{
            let $ = JSON.parse(res.body);
            if ($.code !== "0") result += $.message;
            else result += `签到成功，获得${$.message}个雪币`;
            console.log(result);
            return result;
        })
    } else console.log(`${result}cookie已失效`);
}