"""Render the user's training video as a silhouette on a virtual tatami.
Requires mediapipe==0.10.21, numpy<2, opencv-contrib-python and ffmpeg.
The segmentation models ship with the pinned MediaPipe package.
Usage: python render-silhouette.py input.mp4 output.mp4
"""
import argparse, json, subprocess, tempfile
from pathlib import Path
import cv2
import mediapipe as mp
import numpy as np


def arena(width, height):
    y, x = np.mgrid[0:height, 0:width]
    glow = np.exp(-(((x-width*.5)/(width*.45))**2+((y-height*.43)/(height*.6))**2)*2)
    image = np.empty((height,width,3),np.float32)
    for channel, (base,light) in enumerate([(22,31),(12,17),(10,7)]):
        image[:,:,channel]=base+glow*light
    image=np.uint8(image)
    # A perspective grid of mats. No original room pixels enter this image.
    def point(u,v):
        half=260+v*290
        return (int(width*.5+(u-.5)*2*half),int(415+v*270))
    for row in range(4):
        for column in range(6):
            corners=np.array([point(column/6,row/4),point((column+1)/6,row/4),point((column+1)/6,(row+1)/4),point(column/6,(row+1)/4)])
            color=(69,47,24) if (row+column)%2 else (85,59,29)
            if column in [2,3] and row in [1,2]:color=(100,64,41)
            cv2.fillConvexPoly(image,corners,color,cv2.LINE_AA)
            cv2.polylines(image,[corners],True,(119,103,53),1,cv2.LINE_AA)
    cv2.polylines(image,[np.array([point(0,0),point(1,0),point(1,1),point(0,1)])],True,(222,192,76),3,cv2.LINE_AA)
    cv2.ellipse(image,(width//2,343),(210,210),0,15,340,(95,65,28),2,cv2.LINE_AA)
    cv2.putText(image,'TAIKYOKU SONO ICHI',(48,57),cv2.FONT_HERSHEY_SIMPLEX,.85,(215,226,235),2,cv2.LINE_AA)
    cv2.putText(image,'KIHONGO  /  FOLLOW THE COACH',(49,87),cv2.FONT_HERSHEY_SIMPLEX,.4,(155,148,118),1,cv2.LINE_AA)
    return image


def render(source,target):
    cap=cv2.VideoCapture(str(source))
    fps=cap.get(cv2.CAP_PROP_FPS)
    if not cap.isOpened() or fps<=0:raise RuntimeError('Cannot open input video')
    total=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width,height=1280,720
    base=arena(width,height)
    previous_mask=None
    transform=None
    missed=0
    with tempfile.TemporaryDirectory(prefix='kihongo-silhouette-') as temp:
        silent=Path(temp)/'silent.mp4'
        process=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{width}x{height}','-r',str(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p',str(silent)],stdin=subprocess.PIPE)
        with mp.solutions.pose.Pose(model_complexity=1,enable_segmentation=True,smooth_segmentation=True,min_detection_confidence=.35,min_tracking_confidence=.35) as pose:
            index=0
            while True:
                ok,frame=cap.read()
                if not ok:break
                frame=cv2.resize(frame,(960,540),interpolation=cv2.INTER_AREA)
                result=pose.process(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
                if result.segmentation_mask is None:
                    missed+=1
                    if previous_mask is None:raise RuntimeError('No person found in first frame')
                    mask=previous_mask.copy()
                else:
                    mask=np.uint8(result.segmentation_mask>.48)*255
                    count,labels,stats,_=cv2.connectedComponentsWithStats(mask)
                    if count>1:
                        largest=1+np.argmax(stats[1:,cv2.CC_STAT_AREA])
                        mask=np.uint8(labels==largest)*255
                    mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
                    previous_mask=mask.copy()
                ys,xs=np.nonzero(mask)
                if len(xs)<200:raise RuntimeError(f'Person mask too small at frame {index}')
                top,bottom=ys.min(),ys.max()
                center=(xs.min()+xs.max())/2
                if result.pose_landmarks:
                    lm=result.pose_landmarks.landmark
                    center=(lm[23].x+lm[24].x)*480
                scale=450/max(1,bottom-top)
                target_transform=np.array([scale,center,bottom],np.float32)
                transform=target_transform if transform is None else transform*.7+target_transform*.3
                scale,center,bottom=transform
                matrix=np.float32([[scale,0,width*.5-center*scale],[0,scale,644-bottom*scale]])
                projected=cv2.warpAffine(mask,matrix,(width,height),flags=cv2.INTER_LINEAR)
                alpha=cv2.GaussianBlur(projected,(3,3),.6).astype(np.float32)/255
                edge=cv2.dilate(projected,np.ones((7,7),np.uint8))
                aura=cv2.GaussianBlur(edge,(31,31),8).astype(np.float32)/255
                output=base.astype(np.float32).copy()
                shadow=np.zeros((height,width),np.uint8)
                cv2.ellipse(shadow,(width//2,647),(145,12),0,0,360,120,-1,cv2.LINE_AA)
                shadow=cv2.GaussianBlur(shadow,(31,15),7).astype(np.float32)/255
                output*=1-shadow[:,:,None]*.7
                output+=aura[:,:,None]*np.array([70,50,5],np.float32)
                border=np.maximum(0,edge.astype(np.float32)/255-alpha)
                output=output*(1-border[:,:,None]) + np.array([243,219,79],np.float32)*border[:,:,None]
                output=output*(1-alpha[:,:,None]) + np.array([246,249,241],np.float32)*alpha[:,:,None]
                process.stdin.write(np.uint8(np.clip(output,0,255)).tobytes())
                if index%120==0:print(f'{index}/{total} frames',flush=True)
                index+=1
        cap.release();process.stdin.close()
        if process.wait()!=0:raise RuntimeError('Video encoding failed')
        target.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(silent),'-i',str(source),'-map','0:v:0','-map','1:a:0?','-c:v','copy','-c:a','aac','-b:a','96k','-map_metadata','-1','-movflags','+faststart',str(target)],check=True)
        print(json.dumps({'frames':index,'fps':fps,'missing_masks':missed,'output':str(target)}),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('target',type=Path)
    args=parser.parse_args();render(args.source,args.target)
