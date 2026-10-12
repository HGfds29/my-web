import os


REKT_COMMANDS = {}


def register_rekt_command(name, func):
    """
    注册 REKT 脚本命令
    
    Args:
        name: 命令名称
        func: 命令函数，接收参数列表和上下文字典
    """
    REKT_COMMANDS[name] = func


def deregister_rekt_command(name):
    """
    注销 REKT 脚本命令
    
    Args:
        name: 命令名称
    """
    if name in REKT_COMMANDS:
        del REKT_COMMANDS[name]


def get_rekt_commands():
    """
    获取所有已注册的 REKT 命令
    
    Returns:
        list: 命令名称列表
    """
    return list(REKT_COMMANDS.keys())


def _cmd_print(args, context):
    """print <内容> - 打印内容"""
    print(" ".join(args))


def _cmd_echo(args, context):
    """echo <内容> - 输出内容（同print）"""
    print(" ".join(args))


def _cmd_sleep(args, context):
    """sleep <秒数> - 暂停指定秒数"""
    if not args:
        print("用法: sleep <秒数>")
        return
    try:
        import time
        seconds = float(args[0])
        time.sleep(seconds)
    except ValueError:
        print(f"错误：无效的秒数 '{args[0]}'")


def _cmd_exit(args, context):
    """exit - 退出脚本执行"""
    raise SystemExit("脚本退出")


def _cmd_set(args, context):
    """set <变量名> <值> - 设置变量"""
    if len(args) < 2:
        print("用法: set <变量名> <值>")
        return
    var_name = args[0]
    var_value = " ".join(args[1:])
    context["variables"][var_name] = var_value
    print(f"已设置变量 {var_name} = {var_value}")


def _cmd_get(args, context):
    """get <变量名> - 获取变量值"""
    if not args:
        print("用法: get <变量名>")
        return
    var_name = args[0]
    if var_name in context["variables"]:
        print(context["variables"][var_name])
    else:
        print(f"变量 {var_name} 未定义")


def _cmd_if(args, context):
    """if <条件> - 条件判断（简单相等比较）"""
    if len(args) < 3:
        print("用法: if <变量> == <值>")
        return
    
    var_name = args[0]
    operator = args[1]
    expected_value = " ".join(args[2:])
    
    if operator not in ("==", "!="):
        print(f"不支持的操作符: {operator}")
        return
    
    var_value = context["variables"].get(var_name, "")
    
    if operator == "==":
        context["if_result"] = (var_value == expected_value)
    elif operator == "!=":
        context["if_result"] = (var_value != expected_value)


def _cmd_then(args, context):
    """then - if条件满足时执行"""
    if context.get("if_result"):
        context["if_active"] = True
    else:
        context["if_active"] = False


def _cmd_endif(args, context):
    """endif - 结束if块"""
    context["if_active"] = False
    context["if_result"] = False


register_rekt_command("print", _cmd_print)
register_rekt_command("echo", _cmd_echo)
register_rekt_command("sleep", _cmd_sleep)
register_rekt_command("exit", _cmd_exit)
register_rekt_command("set", _cmd_set)
register_rekt_command("get", _cmd_get)
register_rekt_command("if", _cmd_if)
register_rekt_command("then", _cmd_then)
register_rekt_command("endif", _cmd_endif)


def parse_rekt_file(file_path, command_map):
    """
    解析并执行 .rekt 脚本文件
    
    配置选项（脚本开头）:
        指令输出=false   - 取消命令行前缀输出（如 "> print xxx"）
    
    Args:
        file_path: REKT脚本文件路径
        command_map: Shell命令映射字典
    
    Returns:
        tuple: (success_count, fail_count)
    """
    if not os.path.exists(file_path):
        print(f"错误：文件不存在 [{file_path}]")
        return 0, 1
    
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        
        commands = content.splitlines()
        success_count = 0
        fail_count = 0
        
        context = {
            "variables": {},
            "if_result": False,
            "if_active": True,
            "show_cmd_output": True
        }
        
        for cmd_line in commands:
            cmd_line = cmd_line.strip()
            if not cmd_line or cmd_line.startswith("#"):
                continue
            
            if cmd_line.startswith("指令输出="):
                value = cmd_line.split("=", 1)[1].strip().lower()
                context["show_cmd_output"] = (value != "false")
                continue
            
            if not context["if_active"]:
                if cmd_line.startswith("endif"):
                    pass
                else:
                    continue
            
            if context["show_cmd_output"]:
                print(f"> {cmd_line}")
            
            parts = cmd_line.split()
            if not parts:
                continue
            
            cmd = parts[0]
            cmd_args = parts[1:] if len(parts) > 1 else []
            
            if cmd in REKT_COMMANDS:
                try:
                    REKT_COMMANDS[cmd](cmd_args, context)
                    success_count += 1
                except SystemExit:
                    print("脚本已退出")
                    break
                except Exception as e:
                    print(f"错误：{e}")
                    fail_count += 1
            elif cmd in command_map:
                try:
                    command_map[cmd](cmd_args)
                    success_count += 1
                except Exception as e:
                    print(f"错误：{e}")
                    fail_count += 1
            else:
                print(f"未知指令：{cmd}")
                fail_count += 1
        
        return success_count, fail_count
    
    except Exception as e:
        print(f"解析REKT文件失败：{e}")
        return 0, 1