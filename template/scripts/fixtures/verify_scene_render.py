"""Check actual decoded colors and local clocks in the isolated SceneTrack fixture."""
import hashlib
import json
import math
import sys
from pathlib import Path
from PIL import Image


def verify(root):
    files = sorted((root / 'frames').glob('*.png'))
    assert len(files) == 90, len(files)
    frames = [Image.open(p).convert('RGB') for p in files]
    assert all(im.size == (320, 180) for im in frames)

    def progress(frame, start):
        return 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, (frame - start) / 17)))

    colors = clocks = 0
    for frame, im in enumerate(frames):
        for x in [2, 300]:
            expected = [20, 40, 100]
            if frame >= 21:
                local = max(0, min(29, frame - 30))
                source = [40 + 2 * (15 + local * 2), 100, 60]
                p = progress(frame, 21)
                expected = [a * (1 - p) + b * p for a, b in zip(expected, source)]
            if frame >= 51:
                edge = progress(frame, 51) * 320
                if abs(edge - (x + 0.5)) < 1:
                    continue  # Do not assert exact colors at an antialiased clip edge.
                if x + 0.5 < edge:
                    expected = [32, 80, 48]
            actual = im.getpixel((x, 100))
            assert all(abs(a - b) <= 3 for a, b in zip(actual, expected)), (frame, x, actual, expected)
            colors += 1
        if frame <= 20 or 38 <= frame <= 50 or frame >= 69:
            local = frame if frame < 30 else frame - 30 if frame < 60 else frame - 60
            for x in range(32):
                white = all(c > 245 for c in im.getpixel((x, 3)))
                assert white == (x < local + 1), ('graphic clock', frame, x)
                clocks += 1
    repeat = Image.open(root / 'repeat.png').convert('RGB')
    assert repeat.tobytes() == frames[38].tobytes(), 'Repeated frame differs'
    return {'frames': 90, 'fps': 30, 'width': 320, 'height': 180, 'colorChecks': colors,
            'clockChecks': clocks, 'repeatedFrame': 38, 'repeatedPixelsEqual': True,
            'rawFramesSha256': hashlib.sha256(b''.join(im.tobytes() for im in frames)).hexdigest()}


if __name__ == '__main__':
    print(json.dumps(verify(Path(sys.argv[1]))))
