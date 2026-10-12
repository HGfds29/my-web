# Renkt Shell

一个功能丰富的命令行工具，支持命令执行、脚本解析、环境变量管理、VS Code 插件下载等功能。

## 功能特性

- **命令行界面**：交互式命令行，支持 Tab 自动补全
- **IP 查询**：获取当前公网 IP 及地理位置信息
- **环境变量管理**：创建、读取、删除环境变量
- **VS Code 插件下载**：从 Marketplace 获取插件信息并下载
- **脚本执行**：支持 `.rekt` 脚本文件解析执行
- **日志系统**：详细的日志记录，按时间命名
- **插件系统**：支持动态加载插件扩展功能
- **GUI 界面**：可选的图形化界面（需安装 PySimpleGUI）

## 快速开始

### 环境要求

- Python 3.8+
- 依赖库：`requests`, `alive-progress`, `prompt_toolkit`

### 安装依赖

```bash
pip install requests alive-progress prompt_toolkit
```

如需使用 GUI 功能：

```bash
pip install PySimpleGUI
```

### 运行

```bash
python main.py
```

## 命令列表

### 基础命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `ip` | 获取当前 IP 地址信息 | `ip` |
| `user` | 获取当前系统用户名 | `user` |
| `help` | 显示帮助信息 | `help` |
| `stop` | 停止程序 | `stop` |

### 环境变量命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `create-variable` | 创建环境变量（自动识别类型） | `create-variable COUNT 42` |
| `get-variable` | 读取环境变量 | `get-variable PATH` |
| `get-variable --all` | 列出所有环境变量 | `get-variable --all` |
| `del-variable` | 删除环境变量 | `del-variable MY_VAR` |

### VS Code 插件命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `get_vsixmarket` | 获取插件信息 | `get_vsixmarket <URL>` |
| `get_vsixmarket --d` | 下载插件 | `get_vsixmarket --d <URL>` |

### 脚本命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `run` | 运行脚本或查看文件 | `run test.rekt` |

## REKT 脚本

### 简介

`.rekt` 是 Renkt Shell 的脚本文件格式，支持逐行执行命令。

### 脚本示例

```rekt
# 这是一个注释
指令输出=false
print 欢迎使用 Renkt Shell
ip
set name Renkt
get name
if name == Renkt
then
    print 变量匹配成功
endif
sleep 2
print 脚本执行完成
```

### 内置命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `print/echo` | 打印内容 | `print Hello World` |
| `set` | 设置变量 | `set var value` |
| `get` | 获取变量 | `get var` |
| `if/then/endif` | 条件判断 | `if var == value` |
| `sleep` | 暂停指定秒数 | `sleep 2` |
| `exit` | 退出脚本 | `exit` |

### 配置选项

在脚本开头添加配置选项：

```rekt
指令输出=false    # 取消命令行前缀输出
```

## 项目结构

```
Renkt/
├── main.py              # 主入口
├── user.json            # 用户数据
├── core/                # 核心模块
│   ├── Api.py           # API 接口
│   ├── commands.py      # 命令定义
│   ├── completer.py     # 自动补全
│   ├── log.py           # 日志系统
│   └── rt_parser.py     # REKT 脚本解析器
├── plugins/             # 插件目录
│   ├── __init__.py      # 插件加载器
│   └── GUI Viewer.py    # GUI 插件
├── downloads/           # 下载目录
└── logs/                # 日志目录
```

## 日志系统

日志文件保存在 `logs/renkt_YYYY-MM-DD_HH-MM-SS.log`，格式如下：

```
2026-07-18 10:06:22 - INFO     - log:info:35 - 执行命令: ip
2026-07-18 10:06:22 - INFO     - log:info:35 - IP信息：
```

## 插件开发

在 `plugins/` 目录下创建 `.py` 文件，定义 `cmd_` 前缀的函数即可自动注册为命令。

示例：

```python
def cmd_hello(args):
    print("Hello, Renkt!")
```

## 许可证

MIT License