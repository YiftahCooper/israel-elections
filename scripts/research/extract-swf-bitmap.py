#!/usr/bin/env python3
"""Decode one original DefineBitsJPEG3 bitmap, preserving its JPEG pixels and alpha.

Usage: python extract-swf-bitmap.py original.swf character_id output.png
Requires Pillow. No Flash vector rendering, tracing, or animation reconstruction.
"""
import io
from pathlib import Path
import sys
import zlib
from PIL import Image

raw = Path(sys.argv[1]).read_bytes()
assert raw[:3] in (b'CWS', b'FWS'), 'unsupported SWF compression'
b = raw[:8] + zlib.decompress(raw[8:]) if raw[:3] == b'CWS' else raw
assert len(b) == int.from_bytes(b[4:8], 'little'), 'SWF length mismatch'
rect_bits = b[8] >> 3
i = 8 + (5 + 4 * rect_bits + 7) // 8 + 4
while i < len(b):
    header = int.from_bytes(b[i:i + 2], 'little')
    i += 2
    tag, size = header >> 6, header & 63
    if size == 63:
        size = int.from_bytes(b[i:i + 4], 'little')
        i += 4
    body = b[i:i + size]
    i += size
    assert len(body) == size, 'truncated SWF tag'
    if tag == 35 and int.from_bytes(body[:2], 'little') == int(sys.argv[2]):
        offset = int.from_bytes(body[2:6], 'little')
        im = Image.open(io.BytesIO(body[6:6 + offset])).convert('RGBA')
        alpha = zlib.decompress(body[6 + offset:])
        assert len(alpha) == im.width * im.height
        im.putalpha(Image.frombytes('L', im.size, alpha))
        im.save(sys.argv[3], 'PNG', optimize=True)
        print(f'Decoded original bitmap {sys.argv[2]}: {im.width}x{im.height}')
        break
else:
    raise ValueError('requested JPEG3 bitmap not found')
