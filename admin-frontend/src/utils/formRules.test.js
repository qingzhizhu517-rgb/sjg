import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequiredRule, longitudeValidator, latitudeValidator, minLengthValidator } from './formRules.js'

function runValidator(validator, value) {
  return new Promise(resolve => {
    validator({}, value, error => resolve(error ? error.message : null))
  })
}

test('createRequiredRule returns a required Element Plus rule', () => {
  assert.deepEqual(createRequiredRule('请输入名称'), { required: true, message: '请输入名称', trigger: 'blur' })
})

test('coordinate validators accept empty values and reject out-of-range values', async () => {
  assert.equal(await runValidator(longitudeValidator, ''), null)
  assert.equal(await runValidator(longitudeValidator, 181), '经度需在 -180 到 180 之间')
  assert.equal(await runValidator(latitudeValidator, -91), '纬度需在 -90 到 90 之间')
})

test('minLengthValidator enforces trimmed string length', async () => {
  const validator = minLengthValidator(6, '密码至少 6 位')
  assert.equal(await runValidator(validator, '12345'), '密码至少 6 位')
  assert.equal(await runValidator(validator, '123456'), null)
})
