import TOML from "@ltd/j-toml";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    let files = [];
    let items = fs.readdirSync(path.join(__dirname, "../config"));
    items.forEach(item => {
        let fullPath = path.join(__dirname, `../config/${item}`);
        if (fs.statSync(fullPath).isFile()) {
            if (path.extname(fullPath) === ".toml") {
                files.push(fullPath);
            }
        }
    })
    if (files.length === 0) {
        console.log("配置文件不存在");
    } else {
        for (let fl of files) {
            console.log(`正在运行${path.basename(fl)}`);
            global.config = TOML.parse(fs.readFileSync(fl));
            let taskList = config.taskList;
            if (taskList.length === 0) console.log("你还没有填写任务列表");
            else {
                for (let i of taskList) {
                    if (!fs.existsSync(path.join(__dirname, `./scripts/${i}.js`))) {
                            console.log(`【失败】：脚本${i}不存在`);
                            continue;
                    }
                    let res = await import (path.join(__dirname, `./scripts/${i}.js`));
                    await res.default();
                }
            }
        }
    }
}

await main();