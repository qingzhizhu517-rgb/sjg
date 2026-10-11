import test from 'node:test'
import assert from 'node:assert/strict'
import { PerspectiveCamera, Vector3 } from 'three'
import * as renderer from '../src/craft/huluRenderer.js'
import { createGourdGeometry, createGourdStemGeometry } from '../src/craft/gourdGeometry.js'
test('默认机位容纳三种坯形的全身与干蒂，长腰形不切顶', () => {
  assert.equal(typeof renderer.fitGourdCamera,'function')
  for(const shape of ['balanced','slender','full']) {
    const body=createGourdGeometry(shape,'mobile'), stem=createGourdStemGeometry(body.userData.gourd.maxY,'mobile')
    stem.computeBoundingBox()
    const pose=renderer.fitGourdCamera({minY:body.userData.gourd.minY,maxY:stem.boundingBox.max.y})
    const camera=new PerspectiveCamera(35,1,.1,40),target=new Vector3(0,pose.targetY,0)
    camera.position.set(0,Math.cos(pose.phi)*pose.radius+pose.targetY,Math.sin(pose.phi)*pose.radius)
    camera.lookAt(target);camera.updateMatrixWorld()
    for(const mesh of [body,stem])for(let i=0;i<mesh.attributes.position.count;i++) {
      const point=new Vector3().fromBufferAttribute(mesh.attributes.position,i).project(camera)
      assert.ok(Math.abs(point.y)<.97,shape+' '+point.y)
    }
    body.dispose();stem.dispose()
  }
})
