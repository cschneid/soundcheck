import { describe, it, expect } from 'vitest'
import { shuffle, selectRandom } from '../shuffle'

describe('shuffle', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result.length).toBe(arr.length)
  })

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result.sort()).toEqual(arr.sort())
  })

  it('does not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const original = [...arr]
    shuffle(arr)
    expect(arr).toEqual(original)
  })

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('handles single element array', () => {
    expect(shuffle([1])).toEqual([1])
  })
})

describe('selectRandom', () => {
  it('returns requested number of items', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = selectRandom(arr, 5)
    expect(result.length).toBe(5)
  })

  it('returns all items if count > array length', () => {
    const arr = [1, 2, 3]
    const result = selectRandom(arr, 10)
    expect(result.length).toBe(3)
  })

  it('returns unique items (no duplicates)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = selectRandom(arr, 5)
    const unique = new Set(result)
    expect(unique.size).toBe(result.length)
  })

  it('returns items from original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = selectRandom(arr, 3)
    result.forEach((item) => {
      expect(arr).toContain(item)
    })
  })

  it('handles empty array', () => {
    expect(selectRandom([], 5)).toEqual([])
  })

  it('handles count of 0', () => {
    expect(selectRandom([1, 2, 3], 0)).toEqual([])
  })
})
