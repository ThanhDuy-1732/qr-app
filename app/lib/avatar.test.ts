import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AVATAR_COLORS, getAvatarColor, getDisplayName, getInitial } from './avatar.ts'

test('empty and anonymous names get ?', () => {
  assert.equal(getInitial(''), '?')
  assert.equal(getInitial('   '), '?')
  assert.equal(getInitial('Ẩn danh'), '?')
})

test('uses first and last initials', () => {
  assert.equal(getInitial('Minh Hạnh'), 'MH')
  assert.equal(getInitial('Nguyễn Văn An'), 'NA')
})

test('single name uses one letter', () => {
  assert.equal(getInitial('An'), 'A')
})

test('whitespace names display as Ẩn danh', () => {
  assert.equal(getDisplayName('   '), 'Ẩn danh')
  assert.equal(getDisplayName(''), 'Ẩn danh')
  assert.equal(getDisplayName('  Hạnh  '), 'Hạnh')
})

test('avatar color is deterministic and from the palette', () => {
  assert.equal(getAvatarColor('abc'), getAvatarColor('abc'))
  assert.ok(AVATAR_COLORS.includes(getAvatarColor('abc')))
})
