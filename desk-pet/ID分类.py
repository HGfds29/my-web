import os
import json

folder_path = r'd:\Documents\HBuilderProjects\网页桌宠「三角洲行动・蝶」\assets 蝶'
output_path = r'd:\Documents\HBuilderProjects\网页桌宠「三角洲行动・蝶」\蝶 图片ID.json'

files = sorted([f for f in os.listdir(folder_path) if f.endswith('.jpg') or f.endswith('.png') or f.endswith('.jpeg') or f.endswith('.gif') or f.endswith('.webp')])

result = []
for idx, filename in enumerate(files, 1):
    result.append({
        'id': idx,
        'path': 'assets 蝶/' + filename
    })

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f'共生成 {len(result)} 条记录')