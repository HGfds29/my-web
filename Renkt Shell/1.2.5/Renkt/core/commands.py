import sys
from core import Api
from core.Api import get_ip_info, get_vsixmarket
from core import rt_parser
import plugins
import os


try:
    username = os.getlogin()
except Exception:
    username = "User"

def ip(args=None):
    try:
        ip_info = get_ip_info("GET")
        if ip_info:
            print("IP信息：")
            print(f"  IP地址: {ip_info.get('ip', '未知')}")
            print(f"  国家: {ip_info.get('country', '未知')}")
            print(f"  省份: {ip_info.get('province', '未知')}")
            print(f"  城市: {ip_info.get('city', '未知')}")
            print(f"  区县: {ip_info.get('district', '') or '无'}")
            print(f"  运营商: {ip_info.get('isp', '未知')}")
            print(f"  省份代码: {ip_info.get('provcode', '未知')}")
            print(f"  城市代码: {ip_info.get('citycode', '未知')}")
        else:
            print("获取IP信息失败")
    except Exception as e:
        print(f"获取IP信息时发生错误：{e}")

def user(args=None):
    print(f"当前系统用户名：{username}")

def help(args=None):
    try:
        print("Renkt Shell 帮助")
        print("可用命令：")
        for cmd in command_map:
            if cmd == "ip":
                print(f"  ip: 获取当前IP地址")
            elif cmd == "user":
                print(f"  user: 获取当前用户名")
            elif cmd == "help":
                print(f"  help: 显示帮助信息")
            elif cmd == "stop":
                print(f"  stop: 停止程序")
            elif cmd == "create-variable":
                print(f"  create-variable [--int/-i --string/-s --bool/-b --float/-f] <变量名> <值>: 创建一个环境变量")
                print(f"    示例: create-variable MY_VAR my_value")
            elif cmd == "get-variable":
                print(f"  get-variable <变量名> [--all/-a --detail/-d]: 读取环境变量")
                print(f"    示例: get-variable PATH")
                print(f"    详细: get-variable --detail PATH")
            elif cmd == "del-variable":
                print(f"  del-variable <变量名>: 删除环境变量")
                print(f"    示例: del-variable MY_VAR")
            elif cmd == "get_vsixmarket":
                print(f"  get_vsixmarket [--d/-d/download] <URL> [版本]: 解析VS Code插件Marketplace地址，获取下载链接或直接下载")
                print(f"    示例: get_vsixmarket https://marketplace.visualstudio.com/items?itemName=ms-python.python")
                print(f"    下载: get_vsixmarket --d https://marketplace.visualstudio.com/items?itemName=ms-python.python")
            else:
                print(f"  {cmd}: 插件命令")
    except Exception as e:
        print(f"显示帮助时发生错误：{e}")

def stop(args=None):
    plugins.cmd_crash("Manual termination triggered by user command")

def _auto_detect_type(value_str):
    try:
        value_str = str(value_str)
    except (TypeError, ValueError):
        return "string", str(value_str)
    
    lower_val = value_str.lower().strip()
    
    if lower_val in ("true", "false", "yes", "no", "1", "0", "on", "off"):
        if lower_val in ("true", "yes", "1", "on"):
            return "bool", True
        else:
            return "bool", False
    
    try:
        if value_str.strip().lstrip('-').isdigit():
            int_val = int(value_str)
            return "int", int_val
    except (ValueError, TypeError):
        pass
    
    try:
        float_val = float(value_str)
        return "float", float_val
    except (ValueError, TypeError):
        pass
    
    return "string", value_str

def get_variable_cmd(args=None):
    args = args or []
    
    if len(args) < 1:
        print("用法：get-variable <变量名>")
        print("")
        print("选项：")
        print("  --all, -a: 列出所有环境变量")
        print("  --detail, -d: 显示详细信息")
        print("")
        print("示例：")
        print("  get-variable PATH")
        print("  get-variable MY_VAR")
        print("  get-variable --all")
        print("  get-variable --detail PATH")
        return
    
    detail = False
    filtered_args = []
    for arg in args:
        if arg == "--detail" or arg == "-d":
            detail = True
        else:
            filtered_args.append(arg)
    
    if len(filtered_args) < 1:
        print("请指定变量名或使用 --all 选项")
        return
    
    if filtered_args[0] == "--all" or filtered_args[0] == "-a":
        print("所有环境变量：")
        print("=" * 60)
        for key, value in os.environ.items():
            var_type, _ = _auto_detect_type(value)
            value_preview = value[:50] + "..." if len(value) > 50 else value
            print(f"  {key:<30} [{var_type}] = {value_preview}")
        print(f"\n共 {len(os.environ)} 个环境变量")
        return
    
    var_name = filtered_args[0]
    
    if var_name in os.environ:
        var_value = os.environ[var_name]
        var_type, typed_value = _auto_detect_type(var_value)
        
        if detail:
            print(f"环境变量信息：")
            print(f"┌─────────────────────────────────────────────────────┐")
            print(f"│ 变量名: {var_name:<40} │")
            print(f"│ 值:     {var_value[:45]}...{'':<10} │" if len(var_value) > 45 else f"│ 值:     {var_value:<45} │")
            print(f"│ 类型:   {var_type:<45} │")
            print(f"│ 长度:   {len(var_value):<45} │")
            print(f"│ Python类型: {type(typed_value).__name__:<38} │")
            print(f"└─────────────────────────────────────────────────────┘")
        else:
            print(f"{var_name}={var_value}")
            print(f"  类型: {var_type}")
            print(f"  值长度: {len(var_value)}")
    else:
        print(f"环境变量 {var_name} 不存在")

def del_variable_cmd(args=None):
    args = args or []
    
    if len(args) < 1:
        print("用法：del-variable <变量名>")
        print("")
        print("示例：")
        print("  del-variable MY_VAR")
        print("  del-variable TEMP_VAR")
        return
    
    var_name = args[0]
    
    try:
        if var_name in os.environ:
            del os.environ[var_name]
            print(f"环境变量 {var_name} 删除成功")
        else:
            print(f"环境变量 {var_name} 不存在")
    except Exception as e:
        print(f"删除环境变量失败：{e}")

def create_variable_cmd(args=None):
    args = args or []
    
    var_type = None
    type_flags = {
        "--int": "int", "-i": "int",
        "--string": "string", "-s": "string",
        "--bool": "bool", "-b": "bool",
        "--float": "float", "-f": "float"
    }
    
    filtered_args = []
    for arg in args:
        if arg in type_flags:
            var_type = type_flags[arg]
        else:
            filtered_args.append(arg)
    
    if len(filtered_args) < 2:
        print("用法：create-variable [--int/-i --string/-s --bool/-b --float/-f] <变量名> <值>")
        print("")
        print("选项：")
        print("  --int, -i: 创建整数类型变量")
        print("  --string, -s: 创建字符串类型变量")
        print("  --bool, -b: 创建布尔类型变量")
        print("  --float, -f: 创建浮点数类型变量")
        print("  (不指定类型时自动识别)")
        print("")
        print("示例：")
        print("  create-variable MY_VAR hello")
        print("  create-variable COUNT 42")
        print("  create-variable PI 3.14")
        print("  create-variable ENABLED true")
        print("  create-variable --string NUM 42")
        return
    
    var_name = filtered_args[0]
    var_value_str = " ".join(filtered_args[1:])
    
    try:
        if var_type:
            if var_type == "int":
                value = int(var_value_str)
            elif var_type == "float":
                value = float(var_value_str)
            elif var_type == "bool":
                value = var_value_str.lower() in ("true", "yes", "1", "on")
            else:
                value = var_value_str
        else:
            var_type, value = _auto_detect_type(var_value_str)
        
        os.environ[var_name] = str(value)
        print(f"环境变量 {var_name} 创建成功！")
        print(f"  类型: {var_type}")
        print(f"  值: {value}")
    except ValueError as e:
        print(f"创建环境变量失败：{e}")
    except Exception as e:
        print(f"创建环境变量时发生错误：{e}")

def download_vsix(url, filename):
    try:
        import requests
        from alive_progress import alive_bar
        
        os.makedirs("downloads", exist_ok=True)
        file_path = os.path.join("downloads", filename)
        
        if os.path.exists(file_path):
            while True:
                choice = input(f"文件 {filename} 已存在，是否覆盖？(s=跳过/c=覆盖): ").strip().lower()
                if choice in ["s", "skip", "跳过"]:
                    print("已跳过下载")
                    return file_path
                elif choice in ["c", "cover", "覆盖", "y", "yes"]:
                    break
                else:
                    print("无效输入，请输入 s(跳过) 或 c(覆盖)")
        
        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                resp = requests.get(url, headers=Api.HEADERS, timeout=60, stream=True)
                resp.raise_for_status()
                
                total_size = int(resp.headers.get("content-length", 0))
                downloaded = 0
                
                with open(file_path, "wb") as f:
                    if total_size > 0:
                        current_progress = 0
                        with alive_bar(total_size, title="下载中", bar="blocks", spinner="dots", dual_line=True) as bar:
                            for chunk in resp.iter_content(chunk_size=8192):
                                if chunk:
                                    f.write(chunk)
                                    downloaded += len(chunk)
                                    remaining = total_size - current_progress
                                    increment = min(len(chunk), remaining)
                                    bar(increment)
                                    current_progress += increment
                                    bar.text(f"-> {downloaded}/{total_size} bytes")
                    else:
                        for chunk in resp.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                
                print(f"\n下载完成！文件保存在: {file_path}")
                return file_path
            except requests.exceptions.RequestException as e:
                if attempt < max_retries:
                    print(f"\n下载失败 (尝试 {attempt + 1}/{max_retries + 1})：{e}")
                    print(f"等待 3 秒后重试...")
                    import time
                    time.sleep(3)
                else:
                    print(f"\n下载失败 (已重试 {max_retries} 次)：{e}")
                    return None
            except Exception as e:
                print(f"\n下载失败：{e}")
                return None
    except Exception as e:
        print(f"\n下载失败：{e}")
        return None

def get_vsixmarket_cmd(args=None):
    args = args or []
    
    download_flag = False
    if len(args) >= 1 and (args[0] == "--d" or args[0] == "-d" or args[0].lower() == "download"):
        download_flag = True
        args = args[1:]
    
    if len(args) < 1:
        print("用法：get_vsixmarket [--d/-d/download] <VS Code插件Marketplace URL> [版本号]")
        print("")
        print("选项：")
        print("  --d, -d, download: 下载插件到本地")
        print("")
        print("示例：")
        print("  get_vsixmarket https://marketplace.visualstudio.com/items?itemName=ms-python.python")
        print("  get_vsixmarket https://marketplace.visualstudio.com/items?itemName=ms-python.python 2024.0.0")
        print("  get_vsixmarket --d https://marketplace.visualstudio.com/items?itemName=ms-python.python")
        print("  get_vsixmarket download https://marketplace.visualstudio.com/items?itemName=ms-python.python")
        print("")
        print("功能：解析VS Code插件Marketplace地址，获取下载链接或直接下载")
        return
    
    market_url = args[0]
    target_version = args[1] if len(args) >= 2 else None
    
    try:
        result = get_vsixmarket(market_url, target_version)
        if result:
            print("插件信息：")
            print(f"  插件名称: {result['itemName']}")
            print(f"  Publisher: {result['fieldA']}")
            print(f"  插件ID: {result['fieldB']}")
            print(f"  版本: {result['version']}")
            print(f"  下载链接: {result['download_url']}")
            
            if download_flag:
                filename = f"{result['itemName']}-{result['version']}.vsix"
                print(f"\n开始下载: {filename}")
                download_vsix(result['download_url'], filename)
    except ValueError as e:
        print(f"错误：{e}")
    except RuntimeError as e:
        print(f"错误：{e}")
    except Exception as e:
        print(f"请求失败：{e}")

def run_cmd(path=None):
    try:
        if path is None or len(path) == 0 or path[0] == "":
            print("用法: run <文件路径>")
            print("")
            print("支持的文件类型:")
            print("  .rekt  - Renkt Shell 脚本文件（逐行执行命令）")
            print("  .py    - Python 脚本文件")
            print("  其他   - 文本文件（直接显示内容）")
            print("")
            print("示例:")
            print("  run c:/scripts/test.rekt")
            print("  run ./scripts/test.py")
            print("  run README.md")
            return
        
        file_path = path[0]
        
        if not os.path.exists(file_path):
            print(f"错误：文件不存在 [{file_path}]")
            return
        
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == ".py":
            import subprocess
            result = subprocess.run([sys.executable, file_path], capture_output=True, text=True, encoding="utf-8", errors="replace")
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print(f"错误输出:\n{result.stderr}")
            print(f"退出码: {result.returncode}")
        elif ext == ".rekt":
            success_count, fail_count = rt_parser.parse_rekt_file(file_path, command_map)
            print(f"\n执行完成：成功 {success_count} 条，失败 {fail_count} 条")
        else:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            print(content)
    except Exception as e:
        print(f"运行失败：{e}")
def register(command_map: dict):
    command_map.update(command_map)

command_map = {
    "ip": ip,
    "user": user,
    "help": help,
    "stop": stop,
    "get_vsixmarket": get_vsixmarket_cmd,
    "create-variable": create_variable_cmd,
    "get-variable": get_variable_cmd,
    "del-variable": del_variable_cmd,
    "run":run_cmd
}
