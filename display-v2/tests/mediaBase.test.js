import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveMediaBase } from '../src/utils/mediaBase.js'

test('dev 环境恒用本地 public 路径（忽略 OSS 配置）', () => {
  assert.equal(resolveMediaBase({ dev: true, ossUrl: 'https://oss.example.com' }), '')
})

test('prod 环境有 OSS 配置用 OSS 前缀', () => {
  assert.equal(
    resolveMediaBase({ dev: false, ossUrl: 'https://oss.example.com' }),
    'https://oss.example.com',
  )
})

test('prod 环境无 OSS 配置回退本地', () => {
  assert.equal(resolveMediaBase({ dev: false, ossUrl: undefined }), '')
  assert.equal(resolveMediaBase({ dev: false, ossUrl: '' }), '')
})
