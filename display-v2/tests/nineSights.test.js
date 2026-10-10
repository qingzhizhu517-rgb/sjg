import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { NINE_SIGHTS } from '../src/config/nineSights.js'
import { NINE_CITIES } from '../src/config/nineCities.js'
import * as atlas from '../src/config/atlasPreview.js'

test('one sight per city, in upstream → downstream order', () => {
  assert.deepEqual(NINE_SIGHTS.map((s) => s.city), [...NINE_CITIES])
})

test('every sight cites a real poem record and a scenic spot', () => {
  for (const s of NINE_SIGHTS) {
    assert.ok(Number.isInteger(s.spotId) && s.spotId > 0, `${s.name} spotId`)
    assert.ok(Number.isInteger(s.poemId) && s.poemId > 0, `${s.name} poemId`)
    assert.ok(s.verse && s.poem && s.poet && s.dynasty, `${s.name} citation`)
  }
})

test('every slug has a matching sight illustration on disk', () => {
  const slugs = NINE_SIGHTS.map((s) => s.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const slug of slugs) {
    const asset = new URL(`../public/media/inkwash/sights/${slug}.webp`, import.meta.url)
    assert.ok(existsSync(asset), `缺少插画：${slug}.webp`)
  }
})

test('sights asset directory carries no orphan illustration', () => {
  const dir = new URL('../public/media/inkwash/sights/', import.meta.url)
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.webp'))
    .map((f) => f.replace(/\.webp$/, ''))
    .sort()
  assert.deepEqual(files, NINE_SIGHTS.map((s) => s.slug).sort())
})

test('all nine homepage preview links resolve to matching local scenic specimens', () => {
  for (const sight of NINE_SIGHTS) {
    const entry = atlas.findPreviewSpot?.(String(sight.spotId))
    assert.equal(entry?.name, sight.name)
    assert.equal(entry?.region, sight.city)
    assert.equal(entry?.imageAnimeUrl, `/media/inkwash/sights/${sight.slug}.webp`)
  }
  assert.equal(atlas.findPreviewSpot?.('unknown'), null)
})
