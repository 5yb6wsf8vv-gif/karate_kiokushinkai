"""Generate bundled Japanese term audio using pyopenjtalk-plus and Mei.
Install pyopenjtalk-plus==0.4.1.post10 in an isolated environment; requires ffmpeg.
Input JSON is exported from src/data.js. Kana readings are curated in the app.
"""
import argparse,json,subprocess,tempfile,wave
from pathlib import Path
import numpy as np
import pyopenjtalk
parser=argparse.ArgumentParser();parser.add_argument('terms',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args()
args.output.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='kihongo-japanese-') as temporary:
 for i,term in enumerate(json.loads(args.terms.read_text())):
  signal,rate=pyopenjtalk.tts(term['kana'],speed=.9,predict_nani=False)
  peak=float(np.max(np.abs(signal)))
  if not peak:raise RuntimeError(f'Empty synthesis: {term["id"]}')
  signal=np.pad(signal/peak*.86,(round(rate*.08),round(rate*.15)))
  wav=Path(temporary)/'term.wav'
  with wave.open(str(wav),'wb') as out:
   out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate);out.writeframes(np.int16(signal*32767).tobytes())
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-ar','24000','-ac','1','-codec:a','libmp3lame','-b:a','48k','-map_metadata','-1',str(args.output/(term['id']+'.mp3'))],check=True)
  if i%10==0:print(i+1,term['id'],flush=True)
