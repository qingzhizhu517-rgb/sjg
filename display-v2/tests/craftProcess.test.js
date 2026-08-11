import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  clampStep, nextStep, prevStep, isLastStep,
  resolveStepVisible, findStepConflicts,
} from '../src/utils/craftProcess.js'

const STEPS = [
  { key: 'a', visible: ['gourd_raw', 'scene_*'], animations: [] },
  { key: 'b', visible: ['gourd_body'], animations: [{ target: 'gourd_raw', fadeOut: true }] },
  { key: 'c', visible: ['painted_layer'], animations: [] },
]
const ALL = ['gourd_raw', 'gourd_body', 'painted_layer', 'scene_base', 'scene_prop_dish']

test('clampStep 首末钳制', () => {
  assert.equal(clampStep(-1, 3), 0)
  assert.equal(clampStep(5, 3), 2)
  assert.equal(clampStep(1, 3), 1)
})

test('next/prev 边界', () => {
  assert.equal(nextStep(0, 3), 1)
  assert.equal(nextStep(2, 3), 2)
  assert.equal(prevStep(0, 3), 0)
  assert.equal(prevStep(2, 3), 1)
})

test('isLastStep', () => {
  assert.ok(!isLastStep(0, 3))
  assert.ok(isLastStep(2, 3))
})

test('resolveStepVisible 展开通配并返回 Set', () => {
  const v = resolveStepVisible(STEPS[0], ALL)
  assert.ok(v instanceof Set)
  assert.ok(v.has('gourd_raw'))
  assert.ok(v.has('scene_base'))
  assert.ok(v.has('scene_prop_dish'))
  assert.ok(!v.has('gourd_body'))
})

test('findStepConflicts 检出 fadeOut 目标仍在 visible 的冲突', () => {
  assert.equal(findStepConflicts(STEPS[0], ALL).length, 0)
  const bad = { visible: ['gourd_raw'], animations: [{ target: 'gourd_raw', fadeOut: true }] }
  assert.deepEqual(findStepConflicts(bad, ALL), ['gourd_raw'])
})
