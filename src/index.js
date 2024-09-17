import TOML from "@ltd/j-toml";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import sendmsg from "../src/tools/sendmsg.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv.slice(2)

function getArgumentsValues(args, flag) {
    let values = [];
    let found = false;
    for (let arg of args) {
        if (arg === flag) {
            found = true;
        } else if (found) {
            if (arg.startsWith("-")) {
                break;
            }
            values.push(arg);
        }
    }
    return values;
}

async function main() {
    let msg = ""
    if (getArgumentsValues(args, "-c").length === 0) {
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
            return 0;
        }
        for (let fl of files) {
            console.log(`正在运行${path.basename(fl)}`)
            msg += `配置${path.basename(fl)}：\n`;
            global.config = TOML.parse(fs.readFileSync(fl));
            let taskList;
            if (getArgumentsValues(args, "-t").length !== 0) {
                taskList = getArgumentsValues(args, "-t")
            } else {
                taskList = config.taskList;
            }
            if (taskList.length === 0) {
                console.log("你还没有填写任务列表");
            } else {
                for (let i of taskList) {
                    if (!fs.existsSync(path.join(__dirname, `./scripts/${i}.js`))) {
                        console.log(`【失败】：脚本${i}不存在`);
                        continue;
                    }
                    let res = await import ("file://" + path.join(__dirname, `./scripts/${i}.js`));
                    msg += await res.default() + "    \n";
                }
            }
        }
    } else {
        let files = [];
        for (let item of getArgumentsValues(args, "-c")) {
            let fullPath = path.join(__dirname, `../config/${item}.toml`);
            if (fs.existsSync(fullPath)) {
                files.push(fullPath);
            } else {
                console.log(`【失败】：配置文件${item}不存在`);
            }
        }
        for (let fl of files) {
            console.log(`正在运行${path.basename(fl)}`)
            msg += `配置${path.basename(fl)}：\n`;
            global.config = TOML.parse(fs.readFileSync(fl));
            let taskList;
            if (getArgumentsValues(args, "-t").length !== 0) {
                taskList = getArgumentsValues(args, "-t")
            } else {
                taskList = config.taskList;
            }
            if (taskList.length === 0) {
                console.log("你还没有填写任务列表");
            } else {
                for (let i of taskList) {
                    if (!fs.existsSync(path.join(__dirname, `./scripts/${i}.js`))) {
                        console.log(`【失败】：脚本${i}不存在`);
                        continue;
                    }
                    let res = await import ("file://" + path.join(__dirname, `./scripts/${i}.js`));
                    msg += await res.default() + "    \n";
                }
            }
        }
    }
    await sendmsg(msg);
    return msg;
}

await main()