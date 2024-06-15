import test from 'ava'
import { sort } from 'fast-sort'
import { expectType } from 'tsd'
import { createFinderSortKeyComparator, finderSort, getFinderSortKey } from '../src'

// https://support.apple.com/kb/TA22935?locale=en_US
test('sorting in Finder order, returns new sorted array', (t) => {
  let data = Object.freeze(['aaa', '111', 'zzz', '_zzz', '11 10', '1110', 'a0'])
  let sorted = ['_zzz', '11 10', '111', '1110', 'a0', 'aaa', 'zzz']
  t.deepEqual(sorted, finderSort(data))
})

test('sorting numbers', (t) => {
  let data: string[] = []
  for (let i = 0; i <= 1000; i++) {
    data.push(`x${i}.txt`)
  }
  t.deepEqual(data, finderSort(data))
})

test('sorting multi-part paths', (t) => {
  let data = [
    '/a',
    '/a/b/c/1',
    '/a/B/c/3',
    '/A/b/c/2',
    '/A/B/c/4',
    '/x/y/z',
    '/x/y_/z',
    '/x/y0/z',
    'a',
  ]
  t.deepEqual(data, finderSort(data))
})

test('sorting objects with name key', (t) => {
  let data = [
    { name: 'cat1.jpg', color: 'white' },
    { name: 'cat11.jpg', color: 'brown' },
    { name: 'cat9.jpg', color: 'pink' },
  ]
  let expected = [
    { name: 'cat1.jpg', color: 'white' },
    { name: 'cat9.jpg', color: 'pink' },
    { name: 'cat11.jpg', color: 'brown' },
  ]
  t.deepEqual(expected, finderSort(data, { mapKey: (x) => x.name }))
})

test('extension is compared separately from basename', (t) => {
  let data = Object.freeze(['foo.png', 'foo_bar.png', 'foo.jpg', 'foo_bar.jpg'])
  let sorted = ['foo.jpg', 'foo.png', 'foo_bar.jpg', 'foo_bar.png']
  t.deepEqual(sorted, finderSort(data))
})

test('without folderFirst', (t) => {
  let data = Object.freeze([
    '啊.txt', // a
    '包青天/1.mp4', // b
  ])
  t.deepEqual(data, finderSort(data, { locale: 'zh-CN', folderFirst: false }))
})

test('folderFirst', (t) => {
  let data = Object.freeze([
    '啊.txt', // a
    '包青天/1.mp4', // b
  ])

  let sorted = [
    '包青天/1.mp4', // b
    '啊.txt', // a
  ]
  t.deepEqual(sorted, finderSort(data, { locale: 'zh-CN', folderFirst: true }))
})

test('type usage', (t) => {
  {
    const sorted = finderSort(['file1.txt', 'file2.txt'])
    expectType<string[]>(sorted)
  }

  {
    const sorted = finderSort(['file1.txt', 'file2.txt'], {
      mapKey: (filename) => filename.toUpperCase(),
    })
    expectType<string[]>(sorted)
  }

  {
    const sorted = finderSort(
      [
        { file: 'file1.txt', index: 0 },
        { file: 'file2.txt', index: 1 },
      ],
      { mapKey: (item) => item.file }
    )
    expectType<{ file: string; index: number }[]>(sorted)
  }
  t.pass()
})

test('works with fast-sort or _.orderBy', (t) => {
  let data = Object.freeze([
    { file: '啊.txt', val: 1 },
    { file: '啊.txt', val: 2 },
    { file: '包青天/1.mp4', val: 1 },
    { file: '包青天/1.mp4', val: 2 },
  ])

  {
    const sorted = sort(data).by([
      {
        asc: (item) => getFinderSortKey(item.file, true),
        comparer: createFinderSortKeyComparator('zh-CN'),
      },
      { asc: 'val' },
    ])
    const expected = [
      { file: '包青天/1.mp4', val: 1 },
      { file: '包青天/1.mp4', val: 2 },
      { file: '啊.txt', val: 1 },
      { file: '啊.txt', val: 2 },
    ]
    t.deepEqual(sorted, expected)
  }

  {
    const sorted = sort(data).by([
      {
        asc: (item) => getFinderSortKey(item.file),
        comparer: createFinderSortKeyComparator('zh-CN'),
      },
      { desc: 'val' },
    ])
    const expected = [
      { file: '啊.txt', val: 2 },
      { file: '啊.txt', val: 1 },
      { file: '包青天/1.mp4', val: 2 },
      { file: '包青天/1.mp4', val: 1 },
    ]
    t.deepEqual(sorted, expected)
  }
})
