import sys


def setup_autocomplete(command_map):
    commands = list(command_map.keys())
    
    if sys.stdin.isatty():
        try:
            import importlib
            
            def custom_input(prompt_text=""):
                prompt_toolkit = importlib.import_module('prompt_toolkit')
                completion = importlib.import_module('prompt_toolkit.completion')
                WordCompleter = completion.WordCompleter
                prompt_func = prompt_toolkit.prompt
                
                command_completer = WordCompleter(commands, ignore_case=True)
                return prompt_func(prompt_text, completer=command_completer, complete_while_typing=False)
            return custom_input
        except ImportError:
            pass
    else:
        try:
            import readline
            
            def complete_func(text, state):
                matches = [cmd for cmd in commands if cmd.startswith(text)]
                if state < len(matches):
                    return matches[state]
                return None
            
            readline.set_completer(complete_func)
            readline.set_completer_delims('\t')
            readline.parse_and_bind("tab: complete")
            return input
        except ImportError:
            pass
    
    print("[!] Tab 补全功能暂不可用，使用标准输入")
    return input
