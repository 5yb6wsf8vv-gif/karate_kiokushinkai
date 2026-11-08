import unittest
import cv2
import numpy as np
from arm_mask import arm_mask,repair_short_gaps

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

if __name__=='__main__':unittest.main()
