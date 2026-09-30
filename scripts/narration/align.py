# Forced alignment of the narration script against the ElevenLabs audio.
#
# Produces word-level timings used to place caption cues and beats in
# src/config/gapOutreach.ts. Needs Python 3 with: pocketsphinx imageio-ffmpeg
#
#   FF=$(python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
#   $FF -i src/media/gap-narration.mp3 -ac 1 -ar 16000 -f s16le /tmp/narration.raw
#   $FF -i src/media/gap-narration.mp3 -af silencedetect=noise=-38dB:d=0.35 -f null -   # sentence pauses -> `bounds`
#   python scripts/narration/align.py /tmp/narration.raw scripts/narration/gap-narration.alignment.json
#
# `bounds` below are the speech segments between those pauses (one per
# sentence). If the narration changes, update `bounds` and `sentences`.
import json, re, sys
from pocketsphinx import Decoder

SR = 16000
raw = open(sys.argv[1], 'rb').read()
# Sentence segments from ffmpeg silencedetect (start, end), padded slightly.
bounds = [0.0, 5.229, 5.790, 11.506, 12.195, 18.576, 19.202, 22.006, 22.516, 25.557, 26.097, 28.860, 29.442,
          32.670, 33.228, 36.274, 36.811, 41.927, 42.560, 48.089, 48.634, 52.842, 53.364, 57.436, 58.143,
          66.251, 66.826, 73.248, 73.790, 78.11]
segs = [(bounds[i], bounds[i + 1]) for i in range(0, len(bounds), 2)]
sentences = [
 "A truck carrying stock to a Gap distribution centre is going to miss its unloading appointment.",
 "Someone needs to confirm when it will arrive, agree a new slot, and keep the receiving team informed.",
 "A HappyRobot agent could call the carrier, confirm the revised arrival time, and record the reason for the delay.",
 "Here, the carrier expects to arrive at noon.",
 "The receiving team gets an update without having to chase.",
 "The agent could then request a new unloading slot.",
 "In this example, the receiving team approves twelve-thirty.",
 "The agent checks with the carrier that the new appointment works.",
 "Once the carrier confirms, the agent updates the appointment and notifies the receiving team.",
 "If a suitable slot can’t be agreed, it passes the case to a person with the details already gathered.",
 "That means less time chasing carriers and passing updates between teams.",
 "People keep control of the decisions, while the agent handles the follow-through.",
 "At DHL, HappyRobot already confirms carrier arrival times, updates transport systems, and supports warehouse coordination.",
 "For Gap, we’d start with one workflow, prove its value, then explore other sites and related tasks.",
 "Where could taking that follow-up off your team’s hands make the biggest difference?",
]
assert len(sentences) == len(segs)

def to_align(s):
    s = s.replace('’', "'").replace('HappyRobot', 'happy robot').replace('DHL', 'd h l').replace('centre', 'center')
    s = s.replace('twelve-thirty', 'twelve thirty').replace('follow-through', 'follow through').replace('follow-up', 'follow up')
    s = s.replace('workflow', 'work flow')
    return re.sub(r"[^a-z' ]", ' ', s.lower()).split()

out = []
for (a, b), text in zip(segs, sentences):
    pa, pb = max(0, a - 0.15), min(len(raw) / 2 / SR, b + 0.15)
    chunk = raw[int(pa * SR) * 2:int(pb * SR) * 2]
    words = to_align(text)
    d = Decoder(lm=None, loglevel='FATAL')
    d.set_align_text(' '.join(words))
    d.start_utt(); d.process_raw(chunk, full_utt=True); d.end_utt()
    got = [(w.word, round(pa + w.start_frame / 100, 2), round(pa + (w.end_frame + 1) / 100, 2)) for w in d.seg() if w.word not in ('<s>', '</s>', '<sil>', '[NOISE]')]
    ok = [re.sub(r'\(\d+\)$', '', g[0]) for g in got] == words
    out.append({'text': text, 'start': a, 'end': b, 'aligned': ok, 'words': got})
    print(f"{a:6.2f}-{b:6.2f} {'OK ' if ok else 'MISMATCH'} " + ' '.join(f"{w}@{s}" for w, s, e in got))
json.dump(out, open(sys.argv[2], 'w'), indent=1)
