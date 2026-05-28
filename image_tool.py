#!/usr/bin/env python3
"""
LAMBOMODELS Image Tool
======================
Compresses, renames, and watermarks photos for the website.

Usage:
  python3 image_tool.py

Requirements:
  sudo apt install imagemagick pngquant python3-tk

Folder structure (relative to this script):
  before-processing/   ← put your raw photos here (JPGs + one PNG thumbnail)
  images/              ← processed files land here
  watermark.png        ← your logo watermark file
"""

import os
import subprocess
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

# ── Path helpers ─────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def rel(path):
    """Make a path relative to the script directory."""
    return os.path.join(SCRIPT_DIR, path)

# ── Checks ───────────────────────────────────────────────────
def check_tool(name):
    try:
        subprocess.run([name, '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

# ── GALLERY PROCESSING ───────────────────────────────────────
def process_images(source_folder, output_folder, code, quality, max_size,
                   watermark_path, watermark_pos, watermark_opacity, watermark_size,
                   status_var, progress_var, root):
    """
    Process all JPG/JPEG files in source_folder.
    Renames to CODE_1.jpg, CODE_2.jpg etc.
    Skips PNG files (those go to the No-BG tab).
    """
    # Only grab JPG/JPEG for gallery — PNG is the thumbnail, handled separately
    jpg_exts = ('.jpg', '.jpeg', '.JPG', '.JPEG')
    images = sorted([f for f in os.listdir(source_folder) if f.endswith(jpg_exts)])

    if not images:
        messagebox.showwarning("No JPG Images",
            "No JPG/JPEG files found in the selected folder.\n\n"
            "Gallery photos should be JPG files.\n"
            "The PNG thumbnail is handled by the No-BG tab.")
        return

    os.makedirs(output_folder, exist_ok=True)

    gravity_map = {
        'Bottom Right':  'SouthEast',
        'Bottom Left':   'SouthWest',
        'Bottom Center': 'South',
        'Top Right':     'NorthEast',
        'Top Left':      'NorthWest',
    }
    gravity = gravity_map.get(watermark_pos, 'SouthEast')
    use_watermark = bool(watermark_path and os.path.exists(watermark_path))

    for i, fname in enumerate(images, start=1):
        src = os.path.join(source_folder, fname)
        out_name = f"{code}_{i}.jpg"
        out_path = os.path.join(output_folder, out_name)

        status_var.set(f"Processing {i}/{len(images)}: {fname} → {out_name}")
        progress_var.set(i / len(images) * 100)
        root.update()

        cmd = [
            'convert', src,
            '-resize', f'{max_size}x{max_size}>',
            '-quality', str(quality),
        ]

        if use_watermark:
            cmd += [
                '-gravity', gravity,
                '(',
                    watermark_path,
                    '-resize', f'{watermark_size}%',
                    '-alpha', 'set',
                    '-channel', 'alpha',
                    '-evaluate', 'multiply', str(watermark_opacity / 100),
                    '+channel',
                ')',
                '-composite',
                '-geometry', '+15+15',
            ]

        cmd.append(out_path)
        result = subprocess.run(cmd, capture_output=True)
        if result.returncode != 0:
            status_var.set(f"ERROR on {fname}: {result.stderr.decode()[:100]}")
            root.update()
            continue

    status_var.set(f"✓ Done! {len(images)} gallery images saved to: {output_folder}")
    progress_var.set(100)
    messagebox.showinfo("Done", f"{len(images)} gallery images processed.\n\nSaved to:\n{output_folder}")


# ── NO-BG PNG PROCESSING ─────────────────────────────────────
def process_nobg(source_folder, output_folder, code, target_kb, status_var, progress_var, root):
    """
    Finds the PNG file in source_folder (explicitly looks for .png/.PNG).
    Falls back to first image if no PNG found.
    Compresses to target_kb using pngquant (lossy) or imagemagick (lossless).
    Saves as CODE.png.
    """
    all_files = os.listdir(source_folder)

    # Explicitly prefer PNG files
    png_files = sorted([f for f in all_files if f.lower().endswith('.png')])
    jpg_files = sorted([f for f in all_files if f.lower().endswith(('.jpg','.jpeg'))])

    if png_files:
        src_file = png_files[0]
        status_var.set(f"Found PNG: {src_file}")
    elif jpg_files:
        src_file = jpg_files[0]
        status_var.set(f"No PNG found, using JPG: {src_file}")
        messagebox.showwarning("No PNG found",
            f"No PNG file found in folder.\nUsing {src_file} instead.\n\n"
            "For best results, provide a no-background PNG file.")
    else:
        messagebox.showwarning("No Images", "No image files found in the selected folder.")
        return

    src = os.path.join(source_folder, src_file)
    os.makedirs(output_folder, exist_ok=True)
    out_path = os.path.join(output_folder, f"{code}.png")
    tmp_path = os.path.join(output_folder, f"_tmp_{code}.png")

    root.update()

    # Step 1: Use ImageMagick to resize (659px source stays as-is, larger gets shrunk)
    # Keep PNG, just strip metadata first
    cmd_im = ['convert', src, '-strip', tmp_path]
    r = subprocess.run(cmd_im, capture_output=True)
    if r.returncode != 0:
        status_var.set(f"ImageMagick error: {r.stderr.decode()[:100]}")
        return

    progress_var.set(40)
    root.update()

    # Step 2: Try pngquant for lossy compression to hit target size
    # Map target_kb to a quality range
    if target_kb <= 50:
        q_range = '30-55'
    elif target_kb <= 75:
        q_range = '45-70'
    else:
        q_range = '60-85'

    has_pngquant = check_tool('pngquant')

    if has_pngquant:
        pq_out = tmp_path.replace('.png', '-fs8.png')  # pngquant default output name
        cmd_pq = [
            'pngquant', '--quality', q_range,
            '--strip', '--force',
            '--output', out_path,
            '--', tmp_path
        ]
        r2 = subprocess.run(cmd_pq, capture_output=True)
        if r2.returncode not in (0, 98, 99):  # 98/99 = quality too low warning, still produces output
            # Fall back to just the imagemagick version
            os.rename(tmp_path, out_path)
        else:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    else:
        # No pngquant — just use imagemagick output
        os.rename(tmp_path, out_path)
        messagebox.showwarning("pngquant not found",
            "pngquant is not installed. PNG was compressed with ImageMagick only "
            "(lossless — file may be larger than target).\n\n"
            "Install pngquant for better compression:\n  sudo apt install pngquant")

    progress_var.set(100)

    # Report actual file size
    if os.path.exists(out_path):
        actual_kb = os.path.getsize(out_path) / 1024
        status_var.set(f"✓ Saved: {code}.png  ({actual_kb:.0f} KB — target was {target_kb} KB)")
        messagebox.showinfo("Done",
            f"Saved: {code}.png\nActual size: {actual_kb:.0f} KB  (target: {target_kb} KB)\n\nLocation:\n{out_path}")
    else:
        status_var.set("ERROR: output file not found")


# ── GUI ──────────────────────────────────────────────────────
def build_gui():
    root = tk.Tk()
    root.title("LAMBOMODELS Image Tool")
    root.geometry("700x760")
    root.resizable(False, False)
    root.configure(bg='#1a1a1a')

    style = ttk.Style()
    style.theme_use('clam')
    style.configure('TFrame', background='#1a1a1a')
    style.configure('TLabel', background='#1a1a1a', foreground='#e8e3db', font=('Helvetica', 11))
    style.configure('TButton', font=('Helvetica', 11, 'bold'), padding=8)
    style.configure('TEntry', font=('Helvetica', 11), padding=6)
    style.configure('TCombobox', font=('Helvetica', 11))
    style.configure('TNotebook', background='#1a1a1a')
    style.configure('TNotebook.Tab', font=('Helvetica', 11, 'bold'), padding=(12, 6))

    # Header
    tk.Frame(root, bg='#fdc30d', height=4).pack(fill='x')
    tk.Label(root, text="LAMBOMODELS Image Tool",
             font=('Helvetica', 18, 'bold'), bg='#1a1a1a', fg='#fdc30d').pack(pady=(16, 2))
    tk.Label(root, text="Compress • Rename • Watermark",
             font=('Helvetica', 11), bg='#1a1a1a', fg='#666').pack(pady=(0, 12))

    notebook = ttk.Notebook(root)
    notebook.pack(fill='both', expand=True, padx=20, pady=0)

    # Shared code variable — synced across both tabs automatically
    shared_code_var = tk.StringVar()

    def make_row(parent, label, pady=(4, 4)):
        f = tk.Frame(parent, bg='#1a1a1a')
        f.pack(fill='x', padx=20, pady=pady)
        tk.Label(f, text=label, width=20, anchor='w', bg='#1a1a1a', fg='#9a9590',
                 font=('Helvetica', 10)).pack(side='left')
        return f

    def folder_entry(parent, var, label, pady=(4,4)):
        f = make_row(parent, label, pady)
        tk.Entry(f, textvariable=var, width=32, bg='#252525', fg='#e8e3db',
                 insertbackground='white', relief='flat',
                 font=('Helvetica', 10)).pack(side='left', padx=(0, 6))
        tk.Button(f, text="Browse",
                  command=lambda: var.set(filedialog.askdirectory()),
                  bg='#333', fg='white', relief='flat', padx=8,
                  font=('Helvetica', 10)).pack(side='left')

    def slider_row(parent, label, var, from_, to, pady=(4,4), suffix=''):
        f = make_row(parent, label, pady)
        tk.Scale(f, from_=from_, to=to, orient='horizontal', variable=var,
                 length=210, bg='#1a1a1a', fg='#e8e3db', troughcolor='#333',
                 highlightthickness=0, activebackground='#fdc30d').pack(side='left')
        tk.Label(f, textvariable=var, bg='#1a1a1a', fg='#fdc30d',
                 font=('Helvetica', 12, 'bold'), width=3).pack(side='left')
        if suffix:
            tk.Label(f, text=suffix, bg='#1a1a1a', fg='#555',
                     font=('Helvetica', 9)).pack(side='left', padx=(4, 0))

    # ── TAB 1: GALLERY PHOTOS ────────────────────────────────
    tab1 = ttk.Frame(notebook)
    notebook.add(tab1, text='  Gallery Photos (JPG)  ')

    src_var = tk.StringVar(value=rel('before-processing'))
    out_var = tk.StringVar(value=rel('images'))
    folder_entry(tab1, src_var, "Source folder:", pady=(16, 4))
    folder_entry(tab1, out_var, "Output folder:", pady=(4, 4))

    code_var = shared_code_var
    f = make_row(tab1, "Model code:", pady=(4, 4))
    tk.Entry(f, textvariable=code_var, width=20, bg='#252525', fg='#fdc30d',
             insertbackground='white', relief='flat',
             font=('Helvetica', 12, 'bold')).pack(side='left')
    tk.Label(f, text="  e.g. JarSVR-1", bg='#1a1a1a', fg='#555',
             font=('Helvetica', 10)).pack(side='left')

    qual_var  = tk.IntVar(value=87)
    size_var  = tk.IntVar(value=1400)
    wmop_var  = tk.IntVar(value=75)
    wmsize_var = tk.IntVar(value=30)

    slider_row(tab1, "JPEG quality:", qual_var, 60, 97, pady=(8, 4))

    f = make_row(tab1, "Max dimension px:", pady=(4, 4))
    tk.OptionMenu(f, size_var, 800, 1000, 1200, 1400, 1600, 1920).pack(side='left')

    # Watermark file
    wm_var = tk.StringVar(value=rel('watermark.png'))
    f = make_row(tab1, "Watermark PNG:", pady=(10, 4))
    tk.Entry(f, textvariable=wm_var, width=28, bg='#252525', fg='#e8e3db',
             insertbackground='white', relief='flat',
             font=('Helvetica', 10)).pack(side='left', padx=(0, 6))
    tk.Button(f, text="Browse",
              command=lambda: wm_var.set(filedialog.askopenfilename(
                  filetypes=[('PNG', '*.png')])),
              bg='#333', fg='white', relief='flat', padx=8,
              font=('Helvetica', 10)).pack(side='left')

    wmpos_var = tk.StringVar(value='Bottom Right')
    f = make_row(tab1, "Watermark pos:", pady=(4, 4))
    ttk.Combobox(f, textvariable=wmpos_var, width=14,
                 values=['Bottom Right','Bottom Left','Bottom Center','Top Right','Top Left'],
                 state='readonly').pack(side='left')

    slider_row(tab1, "Watermark opacity:", wmop_var, 10, 100, pady=(4, 4), suffix='%')
    slider_row(tab1, "Watermark size:", wmsize_var, 5, 40, pady=(4, 4), suffix='% of image width')

    tk.Label(tab1, text="Only JPG/JPEG files are processed here. PNG thumbnail → use No-BG tab.",
             bg='#1a1a1a', fg='#555', font=('Helvetica', 9, 'italic')).pack(pady=(6, 0))

    status1_var   = tk.StringVar(value="Ready.")
    progress1_var = tk.DoubleVar(value=0)
    tk.Label(tab1, textvariable=status1_var, bg='#1a1a1a', fg='#b0ab9f',
             font=('Helvetica', 10), wraplength=640).pack(pady=(10, 4))
    ttk.Progressbar(tab1, variable=progress1_var, maximum=100, length=600).pack(pady=(0, 10))

    def run_gallery():
        if not src_var.get() or not out_var.get() or not code_var.get():
            messagebox.showwarning("Missing fields",
                "Please fill in source folder, output folder, and model code.")
            return
        progress1_var.set(0)
        process_images(
            src_var.get(), out_var.get(), code_var.get().strip(),
            qual_var.get(), size_var.get(),
            wm_var.get(), wmpos_var.get(), wmop_var.get(), wmsize_var.get(),
            status1_var, progress1_var, root
        )

    tk.Button(tab1, text="▶  Process Gallery Photos",
              command=run_gallery, bg='#fdc30d', fg='#111',
              font=('Helvetica', 13, 'bold'), relief='flat',
              padx=20, pady=10).pack(pady=(0, 14))

    # ── TAB 2: NO-BG PNG ────────────────────────────────────
    tab2 = ttk.Frame(notebook)
    notebook.add(tab2, text='  No-BG Thumbnail (PNG)  ')

    src2_var = tk.StringVar(value=rel('before-processing'))
    out2_var = tk.StringVar(value=rel('images'))
    folder_entry(tab2, src2_var, "Source folder:", pady=(16, 4))
    folder_entry(tab2, out2_var, "Output folder:", pady=(4, 4))

    code2_var = shared_code_var
    f = make_row(tab2, "Model code:", pady=(4, 4))
    tk.Entry(f, textvariable=code2_var, width=20, bg='#252525', fg='#fdc30d',
             insertbackground='white', relief='flat',
             font=('Helvetica', 12, 'bold')).pack(side='left')
    tk.Label(f, text="  saves as CODE.png", bg='#1a1a1a', fg='#555',
             font=('Helvetica', 10)).pack(side='left')

    # Target file size selector
    target_kb_var = tk.IntVar(value=75)
    f = make_row(tab2, "Target file size:", pady=(10, 4))
    for kb in [50, 75, 100]:
        tk.Radiobutton(f, text=f"{kb} KB", variable=target_kb_var, value=kb,
                       bg='#1a1a1a', fg='#e8e3db', selectcolor='#333',
                       activebackground='#1a1a1a', activeforeground='#fdc30d',
                       font=('Helvetica', 11, 'bold')).pack(side='left', padx=(0, 14))

    tk.Label(tab2,
             text=(
                 "Looks for a .png file in the source folder first.\n"
                 "Falls back to JPG if no PNG found.\n"
                 "Uses pngquant for lossy compression (sudo apt install pngquant).\n"
                 "Actual size may vary slightly from target depending on image content."
             ),
             bg='#1a1a1a', fg='#555', font=('Helvetica', 9, 'italic'),
             justify='left').pack(pady=(12, 0), padx=20, anchor='w')

    status2_var   = tk.StringVar(value="Ready.")
    progress2_var = tk.DoubleVar(value=0)
    tk.Label(tab2, textvariable=status2_var, bg='#1a1a1a', fg='#b0ab9f',
             font=('Helvetica', 10), wraplength=640).pack(pady=(14, 4))
    ttk.Progressbar(tab2, variable=progress2_var, maximum=100, length=600).pack(pady=(0, 10))

    def run_nobg():
        if not src2_var.get() or not out2_var.get() or not code2_var.get():
            messagebox.showwarning("Missing fields", "Please fill in all fields.")
            return
        progress2_var.set(0)
        process_nobg(
            src2_var.get(), out2_var.get(), code2_var.get().strip(),
            target_kb_var.get(),
            status2_var, progress2_var, root
        )

    tk.Button(tab2, text="▶  Process No-BG Thumbnail",
              command=run_nobg, bg='#fdc30d', fg='#111',
              font=('Helvetica', 13, 'bold'), relief='flat',
              padx=20, pady=10).pack(pady=(0, 14))

    # ── FOOTER ──────────────────────────────────────────────
    tk.Frame(root, bg='#fdc30d', height=3).pack(fill='x', side='bottom')
    tk.Label(root, text="LAMBOMODELS.COM — Image Tool v2.0",
             bg='#1a1a1a', fg='#444', font=('Helvetica', 9)).pack(side='bottom', pady=4)

    # Startup checks
    missing = []
    if not check_tool('convert'):
        missing.append("imagemagick  →  sudo apt install imagemagick")
    if not check_tool('pngquant'):
        missing.append("pngquant     →  sudo apt install pngquant\n(needed for No-BG size targeting)")
    if missing:
        messagebox.showwarning("Missing tools",
            "Some tools are not installed:\n\n" + "\n".join(missing))

    root.mainloop()


if __name__ == '__main__':
    build_gui()
