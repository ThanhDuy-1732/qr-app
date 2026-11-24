import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  flashCoreColor,
  sparkColor,
  sparkHeadColor,
} from './firework-color.ts'

test('light theme never picks a hard-white spark body', () => {
  for (let whiteRoll = 0; whiteRoll <= 1; whiteRoll += 0.05) {
    assert.notEqual(sparkColor(['#7c3aed', '#0e7490'], true, whiteRoll, 0.5), '#ffffff')
  }
})

test('dark theme keeps the white-hot sparks', () => {
  assert.equal(sparkColor(['#a78bfa'], false, 0.1, 0.5), '#ffffff')
  assert.equal(sparkColor(['#a78bfa'], false, 0.9, 0), '#a78bfa')
})

test('spark heads keep their own colour in the light theme', () => {
  assert.equal(sparkHeadColor('#7c3aed', true), '#7c3aed')
  assert.equal(sparkHeadColor('#c4b5fd', false), '#ffffff')
})

test('flash core is tinted, not white, in the light theme', () => {
  assert.match(flashCoreColor([124, 58, 237], true), /^rgba\(124,58,237,/)
  assert.equal(flashCoreColor([124, 58, 237], false), '#ffffff')
})
