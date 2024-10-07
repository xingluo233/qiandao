# 介绍
一键完成某些网站或者软件的每日任务

# 使用
1. 使用Git clone本项目  
2. 安装nodejs  
3. cd进项目文件夹 `cd qiandao`  
4. 安装依赖 `npm install`  
5. 打开目录中的config 文件夹复制config.toml.example并改名为config.toml，脚本的多用户功能靠读取不同的配置文件实现，你可以创建无数个自定义名字.toml，脚本会扫描config目录下toml为拓展名的文件，并按照名称顺序依次执行。
6. 请使用 vscode/notepad++等文本编辑器打开上一步复制好的配置文件
7. 根据[教程](./config/README.md)进行配置
8. 运行脚本 `npm start`

## 高级用法
本项目支持通过命令行参数来控制运行  
`-c`  指定配置文件，多个配置以空格隔开，当不指定时，默认运行所有的配置文件  
`-t`  指定脚本，多个脚本以空格隔开，当不指定时，默认执行配置文件里所填写的任务列表  

### 示例
```shell
npm start -- -t mt  #根据所有的配置文件依次执行mt脚本
npm start -- -c conifg  #根据config.toml执行脚本
npm start -- -c conifg -t mt  #根据config.toml执行mt脚本
```

# 关于使用 Github Action 运行
本项目**不推荐**使用`Github Action`来每日自动执行！  
也**不会**处理使用`Github Action`执行有关的 issues！  

# 支持列表
- [x] [不可能的世界](./src/scripts/bkneng.js)：每日签到和看视频领阅读券  
- [x] [刺猬猫阅读](./src/scripts/ciweimao.js)：每日任务  
- [x] [次元姬小说](./src/scripts/ciyuanji.js)：每日签到  
- [x] [看雪论坛](./src/scripts/kanxue.js)：每日签到  
- [x] [库街区](./src/scripts/kurobbs.js)：每日任务  
- [x] [MT论坛](./src/scripts/mt.js)：每日签到  
- [x] [绅士领域](./src/scripts/ssly.js)：每日签到
