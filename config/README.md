# Config配置教程

## 关于单/多用户运行
单用户只需要填写`config.toml`即可，当[config]()文件夹里有个多个`.toml`文件时，会把所有的`.toml`文件都当作配置文件，依次运行  

## 配置说明
第一行为任务列表，是一个数组，在这里填写脚本名字  
填写示例：`taskList = ["mt", "kanxue"]`  
脚本名即[scripts](../src/scripts)目录下的`.js`文件名，一个`.js`文件对应一个脚本  
