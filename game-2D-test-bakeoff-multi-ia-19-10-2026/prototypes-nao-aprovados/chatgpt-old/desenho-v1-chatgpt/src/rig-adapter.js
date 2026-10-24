// RIG-01-compatible 2D static-pose adapter. This is NOT the real external RIG-01 engine.
// Contract: an actual rig must supply rotations for anatomical anchors in this coordinate space.
export const ARM_SHOULDER=[143,594];
export const ARM_FIST=[145,175];
const ANGLES={neutral:[0,0],tpose:[-.68,-.68],run:[.35,-.43],attack:[-.18,-1.11],idle:[0,0]};
export function armAngle(pose,side){
 const v=ANGLES[pose]??ANGLES.neutral;
 return side<0?v[0]:v[1];
}
export function shoulderHand(side,pose){
 const a=armAngle(pose,side),[x,y]=ARM_FIST;const cs=Math.cos(a),sn=Math.sin(a);
 return [side*(ARM_SHOULDER[0]+x*cs-y*sn),ARM_SHOULDER[1]+x*sn+y*cs];
}
// Provide no-op fallback for head/body in case external rig is unavailable.
export function localBodyPose(pose){return {
 headShift:pose==='run'?[-4,-13]:pose==='attack'?[8,4]:[0,0],
 torsoAngle:pose==='attack'?.045:pose==='run'?-.035:0,
 leftLegAngle:pose==='run'?.09:0,rightLegAngle:pose==='run'?-.09:0
}}
// RIG-01.1 produces 3D joint coordinates (shoulderL/R, elbowL/R, wristL/R etc).
// This converts a snapshot to PART-local arm angles without creating new anatomical painters.
export function adaptRig01Snapshot(data){
 if(!data?.joints)return null;
 const p=data.joints,angles={};
 for(const [side,suffix] of [['left','L'],['right','R']]){
   const a=p['shoulder'+suffix],w=p['wrist'+suffix];
   if(!a||!w)continue;
   const sign=side==='left'?-1:1;
   // +Z in RIG-01 maps to upward canvas (-Y); +Y depth compresses into 3/4 screen projection.
   angles[side]=Math.atan2(-(w.z-a.z),sign*(w.x-a.x)+.001);
 }
 return Object.keys(angles).length===2?angles:null;
}
