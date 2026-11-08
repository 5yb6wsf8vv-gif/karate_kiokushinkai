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
