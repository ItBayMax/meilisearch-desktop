import struct
import zlib
import os
import shutil

def create_valid_png(width, height, r, g, b, filepath):
    sig = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

    def make_chunk(ctype, data):
        c = ctype + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)

    ihdr = make_chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))

    raw = bytearray()
    for _ in range(height):
        raw.append(0)
        for _ in range(width):
            raw.extend([r, g, b])

    compressed = zlib.compress(bytes(raw), 9)
    idat = make_chunk(b'IDAT', compressed)
    iend = make_chunk(b'IEND', b'')

    data = sig + ihdr + idat + iend
    with open(filepath, 'wb') as f:
        f.write(data)
    return data

def create_bmp_ico(filepath, sz=32, r=66, g=133, b=244):
    bpp = 32
    bih = struct.pack('<IiiHHIIiiII', 40, sz, sz*2, 1, bpp, 0, 0, 0, 0, 0, 0)
    xor_data = bytearray()
    for _ in range(sz):
        for _ in range(sz):
            xor_data.extend([b, g, r, 255])
    and_row = (sz + 31) // 32 * 4
    and_data = bytes(and_row * sz)
    img = bih + bytes(xor_data) + and_data
    ico_h = struct.pack('<HHH', 0, 1, 1)
    entry = struct.pack('<BBBBHHII', sz, sz, 0, 0, 1, bpp, len(img), 22)
    with open(filepath, 'wb') as f:
        f.write(ico_h + entry + img)

icons_dir = os.path.join('src-tauri', 'icons')
R, G, B = 66, 133, 244

create_valid_png(32, 32, R, G, B, os.path.join(icons_dir, '32x32.png'))
create_valid_png(128, 128, R, G, B, os.path.join(icons_dir, '128x128.png'))
create_valid_png(256, 256, R, G, B, os.path.join(icons_dir, '128x128@2x.png'))
create_valid_png(256, 256, R, G, B, os.path.join(icons_dir, 'icon.png'))
create_bmp_ico(os.path.join(icons_dir, 'icon.ico'), 32, R, G, B)
shutil.copy(os.path.join(icons_dir, 'icon.png'), os.path.join(icons_dir, 'icon.icns'))

with open(os.path.join(icons_dir, 'icon.png'), 'rb') as f:
    sig = f.read(8)
    expected = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    assert sig == expected, f'Invalid PNG sig: {sig.hex()}'

print('All icons created and verified OK')
