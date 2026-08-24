import os
from PIL import Image, ImageFilter

frames_dir = '/Users/parth/Developer/Shopify store shoes/assets/images/ezgif-12907b4ef7736deb-png-split'
out_dir = '/Users/parth/Developer/Shopify store shoes/assets/shoes'
os.makedirs(out_dir, exist_ok=True)

def remove_bg_and_crop(frame_filename, crop_box, output_filename, bg_color=(237, 237, 237), tolerance=22):
    img_path = os.path.join(frames_dir, frame_filename)
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
    
    img = Image.open(img_path).convert("RGBA")
    cropped = img.crop(crop_box)
    
    # Process transparency
    datas = cropped.getdata()
    newData = []
    
    for item in datas:
        r, g, b, a = item
        # Check distance to background color
        diff = max(abs(r - bg_color[0]), abs(g - bg_color[1]), abs(b - bg_color[2]))
        
        if diff < tolerance:
            # Fully transparent
            newData.append((255, 255, 255, 0))
        elif diff < tolerance + 18:
            # Smooth feather edge
            alpha = int(255 * (diff - tolerance) / 18)
            newData.append((r, g, b, alpha))
        else:
            newData.append((r, g, b, 255))
            
    cropped.putdata(newData)
    
    # Trim empty borders
    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)
        
    out_path = os.path.join(out_dir, output_filename)
    cropped.save(out_path, "PNG")
    print(f"Saved: {out_path} ({cropped.size})")

# Extract Gucci (frame 001 center)
remove_bg_and_crop("ezgif-frame-001.png", (220, 50, 480, 360), "gucci-flashtrek.png", bg_color=(238, 238, 238), tolerance=16)

# Extract Balenciaga Triple S (frame 007 center)
remove_bg_and_crop("ezgif-frame-007.png", (240, 110, 480, 370), "balenciaga-triples.png", bg_color=(238, 238, 238), tolerance=16)

# Extract Palm Angels Flame (frame 012 center / frame 026 center)
remove_bg_and_crop("ezgif-frame-026.png", (240, 100, 480, 370), "palm-angels-flame.png", bg_color=(238, 238, 238), tolerance=16)

# Extract Palm Angels Front View (frame 045)
remove_bg_and_crop("ezgif-frame-045.png", (90, 200, 370, 450), "palm-angels-front.png", bg_color=(255, 255, 255), tolerance=10)

# Extract Palm Angels Heel View (frame 050)
remove_bg_and_crop("ezgif-frame-050.png", (90, 200, 370, 450), "palm-angels-heel.png", bg_color=(255, 255, 255), tolerance=10)

# Extract Eytys Loafers (frame 014 grid item 1)
remove_bg_and_crop("ezgif-frame-014.png", (140, 140, 290, 260), "eytys-loafers.png", bg_color=(238, 238, 238), tolerance=18)

# Extract Balenciaga White & Red (frame 014)
remove_bg_and_crop("ezgif-frame-014.png", (450, 180, 600, 300), "balenciaga-white-red.png", bg_color=(238, 238, 238), tolerance=18)

# Extract Nike White & Pink (frame 014)
remove_bg_and_crop("ezgif-frame-014.png", (140, 230, 290, 350), "nike-sneakers.png", bg_color=(238, 238, 238), tolerance=18)
