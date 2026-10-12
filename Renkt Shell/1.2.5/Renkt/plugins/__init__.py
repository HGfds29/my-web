import os
import importlib
from typing import Dict


class PluginLoadError(Exception):
    pass


def load_plugins(command_map: Dict[str, callable]):
    plugin_dir = "plugins"
    success_count = 0
    failed_count = 0
    
    if not os.path.exists(plugin_dir):
        os.makedirs(plugin_dir)
        print("[!] 创建插件目录：plugins")
        return
    
    for filename in os.listdir(plugin_dir):
        if filename.endswith(".py") and not filename.startswith("_") and filename != "__init__.py":
            module_name = filename[:-3]
            try:
                module = importlib.import_module(f"plugins.{module_name}")
                if hasattr(module, "register"):
                    module.register(command_map)
                    print(f"[√] 成功加载插件：{module_name}")
                    success_count += 1
                else:
                    print(f"[×] 插件 {filename} 缺少 register 函数")
                    failed_count += 1
                    raise PluginLoadError(f"插件 {filename} 缺少 register 函数")
            except PluginLoadError:
                raise
            except Exception as e:
                failed_count += 1
                print(f"[×] 加载插件 {filename} 失败：{e}")
                raise PluginLoadError(f"加载插件 {filename} 失败：{e}")
    
    if success_count == 0 and failed_count == 0:
        pass


def cmd_crash(args):
    raise SystemExit(args)
