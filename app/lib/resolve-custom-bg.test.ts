import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCustomBg } from './resolve-custom-bg.ts'

test('keeps near-black presets in dark theme', () => {
  assert.equal(resolveCustomBg('dark', '#07070f'), '#07070f')
})

test('mutes white toward the dark base', () => {
  assert.equal(resolveCustomBg('dark', '#ffffff'), '#22232a')
})

test('keeps light presets in light theme', () => {
  assert.equal(resolveCustomBg('light', '#f5f4ff'), '#f5f4ff')
})

test('mutes black toward the light base', () => {
  assert.equal(resolveCustomBg('light', '#000000'), '#d8d4e0')
})

test('leaves invalid colors untouched', () => {
  assert.equal(resolveCustomBg('dark', 'not-a-color'), 'not-a-color')
})
