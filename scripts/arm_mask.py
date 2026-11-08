"""Continuous arm silhouettes from observed pose joints; bounded gap interpolation."""
import cv2
import numpy as np
CHAINS=((11,13,15),(12,14,16))

def repair_short_gaps(tracks,max_gap=6,min_visibility=.35):
    result=tracks.copy()
    for joint in [11,12,13,14,15,16,17,18,19,20,21,22]:
        good=np.flatnonzero(tracks[:,joint,2]>=min_visibility)
        for left,right in zip(good,good[1:]):
            if 1<right-left<=max_gap+1:
                for index in range(left+1,right):
                    amount=(index-left)/(right-left)
                    result[index,joint,:2]=tracks[left,joint,:2]*(1-amount)+tracks[right,joint,:2]*amount
                    result[index,joint,2]=min(tracks[left,joint,2],tracks[right,joint,2])
                    if result.shape[2]>3:result[index,joint,3]=tracks[left,joint,3]*(1-amount)+tracks[right,joint,3]*amount
    return result

def arm_mask(shape,joints):
    mask=np.zeros(shape,np.uint8)
    height,width=shape
    for shoulder,elbow,wrist in CHAINS:
        points=joints[[shoulder,elbow,wrist]]
        if np.min(points[:,2])<.2:continue
        coords=points[:,:2]*np.array([width,height])
        upper=np.linalg.norm(coords[1]-coords[0]);fore=np.linalg.norm(coords[2]-coords[1])
        if max(upper,fore)>height*.5:continue
        # Solid connected coverage, independent of sleeve/skin pixel colour.
        radius=int(np.clip((upper+fore)*.065,6,18))
        for a,b in zip(coords,coords[1:]):
            cv2.line(mask,tuple(a.astype(int)),tuple(b.astype(int)),255,radius*2,cv2.LINE_AA)
        cv2.circle(mask,tuple(coords[2].astype(int)),radius+2,255,-1)
        for finger in [wrist+2,wrist+4,wrist+6]:
            if finger>=len(joints) or joints[finger,2]<.2:continue
            point=joints[finger,:2]*np.array([width,height])
            if np.linalg.norm(point-coords[2])<max(12,fore*.45):
                cv2.line(mask,tuple(coords[2].astype(int)),tuple(point.astype(int)),255,max(5,radius),cv2.LINE_AA)
    return mask


def front_arm_layers(shape,joints):
    """Arm boundaries over the torso only when the visible arm is in front."""
    layers=[]
    for chain in CHAINS:
        points=joints[list(chain)]
        if points.shape[1]<4 or np.min(points[:,2])<.35:continue
        # MediaPipe z decreases towards the camera. Do not expose hidden arms.
        if points[-1,3]>points[0,3]+.06:continue
        isolated=np.zeros_like(joints)
        isolated[list(chain)]=points
        layers.append(arm_mask(shape,isolated))
    return layers


def apply_wrist_anchors(tracks,frames,anchors,fps):
    """Track annotated source wrists with forward/backward-checked optical flow."""
    result=tracks.copy()
    for anchor in anchors:
        center=min(len(frames)-1,round(anchor['time']*fps))
        first=max(0,round(anchor['start']*fps));last=min(len(frames)-1,round(anchor['end']*fps))
        point=np.array(anchor['wrist'],np.float32)
        scale=np.array([frames[center].shape[1],frames[center].shape[0]],np.float32)
        wrist=min([15,16],key=lambda joint:np.linalg.norm(result[center,joint,:2]*scale-point))
        result[center,wrist,:2]=point/scale;result[center,wrist,2]=1
        accepted=1
        for direction,limit in [(-1,first),(1,last)]:
            previous=center;current_point=point.reshape(1,1,2)
            for index in range(center+direction,limit+direction,direction):
                next_point,status,_=cv2.calcOpticalFlowPyrLK(frames[previous],frames[index],current_point,None,winSize=(25,25),maxLevel=3)
                if next_point is None or not status[0,0]:break
                backward,back_status,_=cv2.calcOpticalFlowPyrLK(frames[index],frames[previous],next_point,None,winSize=(25,25),maxLevel=3)
                if backward is None or not back_status[0,0] or np.linalg.norm(backward-current_point)>2.5:break
                result[index,wrist,:2]=next_point[0,0]/scale;result[index,wrist,2]=1
                previous=index;current_point=next_point;accepted+=1
        print(f"Wrist anchor {anchor['time']}s: corrected {accepted} frames",flush=True)
    return result
