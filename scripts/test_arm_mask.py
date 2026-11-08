import unittest
import cv2
import numpy as np
from arm_mask import arm_mask,repair_short_gaps,front_arm_layers,apply_wrist_anchors

class ArmCoverageTests(unittest.TestCase):
    def test_extended_arm_is_connected_to_shoulder_including_wrist(self):
        joints=np.zeros((33,3),np.float32)
        joints[11]=[.2,.5,.9];joints[13]=[.5,.5,.9];joints[15]=[.8,.5,.9]
        mask=arm_mask((300,400),joints)
        self.assertTrue(np.all(mask[150,80:321]>0))
        count,_=cv2.connectedComponents(mask)
        self.assertEqual(count,2)
    def test_short_dropout_is_repaired_but_long_occlusion_is_not(self):
        tracks=np.zeros((16,33,3),np.float32)
        tracks[0,15]=[.2,.5,.9];tracks[3,15]=[.8,.5,.9];tracks[15,15]=[.8,.5,.9]
        result=repair_short_gaps(tracks)
        self.assertGreater(result[1,15,2],.35)
        self.assertAlmostEqual(float(result[1,15,0]),.4,places=5)
        self.assertEqual(result[8,15,2],0)

    def test_front_arm_can_be_outlined_but_hidden_arm_is_not_drawn_over_torso(self):
        joints=np.zeros((33,4),np.float32)
        joints[11]=[.2,.5,.9,0];joints[13]=[.4,.5,.9,-.1];joints[15]=[.6,.5,.9,-.2]
        self.assertEqual(len(front_arm_layers((300,400),joints)),1)
        joints[15,3]=.2
        self.assertEqual(len(front_arm_layers((300,400),joints)),0)

    def test_manual_hand_anchor_follows_observed_translation(self):
        frames=[]
        for index in range(9):
            image=np.zeros((120,200),np.uint8)
            cv2.rectangle(image,(40+index,40),(60+index,60),220,-1)
            cv2.circle(image,(50+index,50),3,20,-1)
            frames.append(image)
        tracks=np.zeros((9,33,4),np.float32)
        tracks[:,15,:2]=[.25,.42];tracks[:,16,:2]=[.9,.9]
        result=apply_wrist_anchors(tracks,frames,[{'time':4,'start':0,'end':8,'wrist':[54,50]}],1)
        self.assertAlmostEqual(float(result[0,15,0])*200,50,delta=1)
        self.assertAlmostEqual(float(result[8,15,0])*200,58,delta=1)

if __name__=='__main__':unittest.main()
