import json, sys, zlib, struct
from pathlib import Path
def frame(d, pose):
    rows = list(d["base"])
    for r, line in d["poses"].get(pose, {}).items():
        r = int(r); rows[r] = "".join(b if c == "-" else c for b, c in zip(rows[r], line))
    return rows
def sheet(sprites, out, S=12, GAP=2):
    poses = ["base", "inhale", "closed", "left", "right", "fidget"]
    bgs = [(30, 30, 46), (235, 235, 230)]
    W = len(poses) * (17 + GAP) + GAP
    H = len(sprites) * len(bgs) * (12 + GAP) + GAP
    px = [[(90, 90, 90)] * W for _ in range(H)]
    y = GAP
    for d in sprites:
        for bg in bgs:
            x = GAP
            for pose in poses:
                for r, line in enumerate(frame(d, pose)):
                    for c, ch in enumerate(line):
                        col = d["palette"].get(ch)
                        px[y + r][x + c] = tuple(int(col[i:i+2], 16) for i in (1, 3, 5)) if col else bg
                x += 17 + GAP
            y += 12 + GAP
    raw = b"".join(b"\x00" + b"".join(bytes(p) * S for p in row) for row in px for _ in range(S))
    def chunk(t, dd): return struct.pack(">I", len(dd)) + t + dd + struct.pack(">I", zlib.crc32(t + dd))
    Path(out).write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", W * S, H * S, 8, 2, 0, 0, 0))
                          + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))
if __name__ == "__main__":
    out = sys.argv[1]
    sheet([json.loads(Path(p).read_text()) for p in sys.argv[2:]], out)
