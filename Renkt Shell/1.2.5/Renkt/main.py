# Renkt Shell 1.0.0
# Copyright (c) 2026 杰哥ERTW
# Released under MIT License

import json
import time
import os
from core import Api
from core import commands
from core import completer
from core import log
from pathlib import Path
import plugins

class Timer:
    def __init__(self):
        self._start = 0.0
        self._pause_acc = 0.0
        self._is_running = False

    def start(self):
        """开始/恢复计时"""
        if not self._is_running:
            self._start = time.perf_counter()
            self._is_running = True

    def pause(self):
        """暂停计时"""
        if self._is_running:
            self._pause_acc += time.perf_counter() - self._start
            self._is_running = False

    def reset(self):
        """重置计时器"""
        self._start = 0.0
        self._pause_acc = 0.0
        self._is_running = False

    def elapsed_ms(self) -> float:
        """返回耗时 毫秒"""
        if not self._is_running:
            return self._pause_acc * 1000
        now = time.perf_counter()
        return (now - self._start + self._pause_acc) * 1000


print("Renkt Shell 1.2.5")
print("版权所有（C） ERTW Shell 保留所有权利。")
log.info("Renkt Shell v1.2.1启动")

timer = Timer()
timer.start()

try:
    with open("user.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    ms = timer.elapsed_ms()
    print(f"读取用户文件耗时：{ms:.2f} 毫秒")
    log.info(f"读取用户文件耗时：{ms:.2f} 毫秒")
except FileNotFoundError:
    print("[!] 用户文件不存在，将创建空用户数据")
    log.warning("用户文件不存在，将创建空用户数据")
    data = []
except json.JSONDecodeError as e:
    print(f"[!] 用户文件解析失败：{e}，将使用空用户数据")
    log.error(f"用户文件解析失败：{e}")
    data = []
except Exception as e:
    print(f"[!] 读取用户文件时发生错误：{e}")
    log.error(f"读取用户文件时发生错误：{e}")
    data = []

try:
    plugins.load_plugins(commands.command_map)
    log.info("插件加载成功")
except plugins.PluginLoadError as e:
    print(f"[×] 插件加载异常：{e}")
    print("[!] 继续运行，已禁用所有插件")
    log.error(f"插件加载异常：{e}")
except Exception as e:
    print(f"[×] 插件加载发生未知错误：{e}")
    print("[!] 继续运行，已禁用所有插件")
    log.error(f"插件加载发生未知错误：{e}")

try:
    custom_input = completer.setup_autocomplete(commands.command_map)
    log.info("Tab自动补全已启用")
except Exception as e:
    print(f"[!] Tab自动补全初始化失败：{e}，将使用标准输入")
    log.warning(f"Tab自动补全初始化失败：{e}")
    def custom_input(prompt=""):
        return input(prompt)

try:
    while True:
        try:
            user_input = custom_input(f"{commands.username}>>")
        except KeyboardInterrupt:
            print("\nCtrl+C 程序终止")
            log.info("用户通过Ctrl+C终止程序")
            break
        except EOFError:
            print("程序终止")
            log.info("用户通过EOF终止程序")
            break
        except Exception as e:
            print(f"[!] 输入读取错误：{e}")
            log.error(f"输入读取错误：{e}")
            continue
        
        if not user_input:
            continue
        parts = user_input.split()
        if not parts:
            continue
        cmd = parts[0]
        args = parts[1:] if len(parts) > 1 else []
        log.info(f"执行命令: {cmd} {' '.join(args)}")
        if cmd in commands.command_map:
            try:
                if cmd == "gui" or cmd == "get_vsixmarket":
                    commands.command_map[cmd](args)
                else:
                    import io
                    import sys
                    
                    class TeeOutput(io.StringIO):
                        def __init__(self, original):
                            super().__init__()
                            self.original = original
                        
                        def write(self, text):
                            super().write(text)
                            self.original.write(text)
                            self.original.flush()
                    
                    old_stdout = sys.stdout
                    sys.stdout = TeeOutput(old_stdout)
                    
                    try:
                        commands.command_map[cmd](args)
                    finally:
                        cmd_output = sys.stdout.getvalue()
                        sys.stdout = old_stdout
                    
                    if cmd_output.strip():
                        lines = cmd_output.strip().split('\n')
                        for line in lines:
                            log.info(line)
            except KeyboardInterrupt:
                print("\n命令已中断")
                log.warning(f"命令 {cmd} 被中断")
            except SystemExit:
                log.info("程序正常终止")
                break
            except Exception as e:
                print(f"[!] 命令执行错误 [{cmd}]：{e}")
                log.error(f"命令执行错误 [{cmd}]：{e}")
        else:
            print(f"错误：未知指令 [{cmd}]，输入help查看可用命令")
            log.warning(f"未知指令：{cmd}")
except SystemExit:
    print("程序终止")
    log.info("程序终止")
except Exception as err:
    print(f"Renkt error：{err}")
    print("Renkt terminated due to an error. Please check plugins or update to the latest version.")
    log.critical(f"程序异常终止：{err}")
