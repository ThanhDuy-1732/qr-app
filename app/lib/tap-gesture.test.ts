import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isTapGesture } from './tap-gesture.ts'

const at = (x: number, y: number, time: number) => ({ x, y, at: time })

test('accepts a short press that barely moves', () => {
  assert.equal(isTapGesture(at(100, 100, 0), at(105, 104, 120)), true)
})

test('accepts exactly the distance and duration limits', () => {
  assert.equal(isTapGesture(at(0, 0, 0), at(0, 12, 800)), true)
})

test('rejects a pointer that moved past 12px', () => {
  assert.equal(isTapGesture(at(0, 0, 0), at(13, 0, 200)), false)
})

test('rejects a press longer than 800ms', () => {
  assert.equal(isTapGesture(at(0, 0, 0), at(4, 4, 801)), false)
})
