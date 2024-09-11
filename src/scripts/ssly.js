import got from "got";
import {digest} from "../tools/utils.js";

let uid = config.ssly.uid;

export default async function main() {
    let result = "【绅士领域】：";
    if (!uid) {
        console.log(`${result}请填写uid`);
        return `${result}请填写uid`;
    }
    let timestamp = Math.round(new Date() / 1000).toString();
    let mac = digest(digest(digest(timestamp, "md5"), "sha1"), "md5");
    let data = `time=${timestamp}&mac=${mac}&u_id=${uid}`;
    let response = await got(`https://sslyapp.site/mz_pbl/app_con/add_sign.php`, {
        body: data,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "user-agent": "Mozilla/5.0 (Linux; Android 12; PESM10 Build/RKQ1.211119.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.5735.196 Mobile Safari/537.36 Html5Plus/1.0"
        }
    });
    let $ = JSON.parse(response.body);
    if ($.state === "0") {
        result += $.erro;
    } else if ($.state === "1") {
        result += $.sms;
    } else {
        result += "签到失败,原因未知";
    }
    console.log(result);
    return result;
}