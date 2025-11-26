import os
import json

# 配置
DIRS = { 'image': 'images', 'video': 'videos' }
EXTENSIONS = {
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video': ['.mp4', '.mov', '.webm']
}
OUTPUT_FILE = 'data.json'
gallery_data = []

def scan_directory(base_dir, media_type):
    if not os.path.exists(base_dir):
        print(f"⚠️ 目录 {base_dir} 不存在，跳过。")
        return

    # 遍历子文件夹 (年份)
    for root, dirs, files in os.walk(base_dir):
        folder_name = os.path.basename(root)
        
        # 简单校验：只处理数字命名的文件夹 (即年份)
        if not folder_name.isdigit():
            continue 

        for filename in files:
            if any(filename.lower().endswith(ext) for ext in EXTENSIONS[media_type]):
                # 生成相对路径
                rel_path = os.path.relpath(os.path.join(root, filename), '.')
                rel_path = './' + rel_path.replace('\\', '/') # Windows 路径兼容
                
                # 获取文件名 (不含后缀)
                title = os.path.splitext(filename)[0]
                # 获取文件修改时间 (用于排序)
                timestamp = os.path.getmtime(os.path.join(root, filename))

                gallery_data.append({
                    "src": rel_path,
                    "type": media_type,
                    "title": title,
                    "year": folder_name,
                    "timestamp": timestamp
                })

print("📂 正在扫描...")
scan_directory(DIRS['image'], 'image')
scan_directory(DIRS['video'], 'video')

# 排序：年份倒序 -> 文件时间倒序
gallery_data.sort(key=lambda x: (int(x['year']), x['timestamp']), reverse=True)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(gallery_data, f, ensure_ascii=False, indent=2)

print(f"✅ 完成！已生成 {OUTPUT_FILE}，包含 {len(gallery_data)} 个文件。")
