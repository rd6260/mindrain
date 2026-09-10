import os
import json
import shutil
import subprocess

source_dir = "/home/senku/winners/TUH WEB"
dest_pdf_dir = "/home/senku/dev/inventory/mindrain/public/past-winners/entry/2026/pdf"
dest_thumb_dir = "/home/senku/dev/inventory/mindrain/public/past-winners/entry/2026/thumb"

os.makedirs(dest_pdf_dir, exist_ok=True)
os.makedirs(dest_thumb_dir, exist_ok=True)

categories = []
for category_name in sorted(os.listdir(source_dir)):
    cat_path = os.path.join(source_dir, category_name)
    if not os.path.isdir(cat_path):
        continue
    
    winners_list = []
    
    # Sort positions numerically
    try:
        positions = sorted(os.listdir(cat_path), key=int)
    except ValueError:
        positions = sorted(os.listdir(cat_path))

    for pos in positions:
        pos_path = os.path.join(cat_path, pos)
        if not os.path.isdir(pos_path):
            continue
            
        data_file = os.path.join(pos_path, "data.json")
        if not os.path.exists(data_file):
            continue
            
        with open(data_file, "r") as f:
            data = json.load(f)
            
        pdf_file = None
        for f in os.listdir(pos_path):
            if f.lower().endswith(".pdf"):
                pdf_file = f
                break
                
        entry_data = {"big": "", "small": "", "pdf": ""}
        if pdf_file:
            pdf_path = os.path.join(pos_path, pdf_file)
            pdf_dest_name = f"{category_name.replace(' ', '_')}_{pos}_{pdf_file}".replace("(", "").replace(")", "")
            pdf_dest = os.path.join(dest_pdf_dir, pdf_dest_name)
            shutil.copy2(pdf_path, pdf_dest)
            
            # Generate thumbnail using pdftoppm
            thumb_prefix = os.path.join(dest_thumb_dir, pdf_dest_name.replace(".pdf", ""))
            subprocess.run(["pdftoppm", "-png", "-f", "1", "-l", "1", "-scale-to-x", "800", "-scale-to-y", "-1", pdf_dest, thumb_prefix])
            
            # pdftoppm appends -1 to the filename
            thumb_actual = f"{thumb_prefix}-1.png"
            thumb_final = f"{thumb_prefix}.png"
            if os.path.exists(thumb_actual):
                os.rename(thumb_actual, thumb_final)
                
            entry_data["pdf"] = f"/past-winners/entry/2026/pdf/{pdf_dest_name}"
            entry_data["big"] = f"/past-winners/entry/2026/thumb/{pdf_dest_name.replace('.pdf', '.png')}"
            entry_data["small"] = f"/past-winners/entry/2026/thumb/{pdf_dest_name.replace('.pdf', '.png')}"
            
        # Determine position string
        position_str = pos
        if category_name == "Honorable Mentions":
            position_str = "Honorable Mention"
        else:
            if pos == "1": position_str = "1st Prize"
            elif pos == "2": position_str = "2nd Prize"
            elif pos == "3": position_str = "3rd Prize"
            else: position_str = f"{pos}th Prize"
            
        members = [{"name": m, "pfp": ""} for m in data.get("members", [])]
        
        winner = {
            "position": position_str,
            "institute": data.get("college", ""),
            "description": data.get("quote", ""),
            "entry": entry_data,
            "members": members
        }
        winners_list.append(winner)
        
    categories.append({
        "category": category_name,
        "winners": winners_list
    })

output = {
    "name": "The Unreal House",
    "year": "2026",
    "categories": categories
}

with open("/home/senku/dev/inventory/mindrain/data/tuh2026.json", "w") as f:
    json.dump(output, f, indent=2)

print("Done generating /home/senku/dev/inventory/mindrain/data/tuh2026.json")
