"""Replace all source audio with deterministic, locally synthesized strike SFX.
Usage: python add-strike-audio.py silent.mp4 output.mp4 cues.json
Requires numpy and ffmpeg; no downloaded sound samples are used.
"""
import argparse,json,subprocess,tempfile,wave
from pathlib import Path
import numpy as np

def synthesize(duration,impacts,rate=48000):
    signal=np.zeros(round(duration*rate),np.float64)
    rng=np.random.default_rng(20261108)
    for index,impact in enumerate(impacts):
        length=round(.38*rate)
        time=np.arange(length)/rate
        noise=rng.standard_normal(length)
        frequencies=np.fft.rfftfreq(length,1/rate)
        band=np.exp(-((frequencies-2100)/1900)**2)*(frequencies>450)
        sweep=np.fft.irfft(np.fft.rfft(noise)*band,n=length)
        sweep/=max(1e-9,np.max(np.abs(sweep)))
        # Air movement rises before extension; the short impact follows it.
        whoosh=np.sin(np.pi*np.clip(time/.21,0,1))**2*(time<.21)
        strike_time=np.maximum(0,time-.16)
        strike=(time>=.16)*np.exp(-strike_time*44)
        phase=2*np.pi*((145+index%3*8)*strike_time-80*strike_time**2)
        effect=.38*sweep*whoosh+.2*sweep*strike+.16*np.sin(phase)*strike
        begin=round((impact-.16)*rate);offset=max(0,-begin);begin=max(0,begin)
        count=min(length-offset,len(signal)-begin)
        if count>0:signal[begin:begin+count]+=effect[offset:offset+count]
    if np.max(np.abs(signal))>.7:signal*=.7/np.max(np.abs(signal))
    return np.int16(signal*32767)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('target',type=Path);parser.add_argument('cues',type=Path);args=parser.parse_args()
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(args.source)]))
    cue_data=json.loads(args.cues.read_text());impacts=[c.get('impactTime',c['time']) for c in cue_data if c['pose']=='tsuki']
    samples=synthesize(duration,impacts)
    with tempfile.TemporaryDirectory(prefix='kihongo-sfx-') as directory:
        wav=Path(directory)/'strikes.wav'
        with wave.open(str(wav),'wb') as output:
            output.setnchannels(1);output.setsampwidth(2);output.setframerate(48000);output.writeframes(samples.tobytes())
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(args.source),'-i',str(wav),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','128k','-t',str(duration),'-map_metadata','-1','-movflags','+faststart',str(args.target)],check=True)
    print(json.dumps({'duration':duration,'impacts':impacts,'originalAudioIncluded':False,'peak':float(np.max(np.abs(samples)))/32767}))

if __name__=='__main__':main()
