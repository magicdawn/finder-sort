// Replace 123 with 990123
// This makes all numbers sort properly
function forceNumbersIntoOrder(str: string) {
  return str.replace(/\d+/g, (match) => {
    return '9'.repeat(match.length - 1) + '0' + match
  })
}

function separateExtensions(ary: string[]) {
  let result: string[] = []
  for (let part of ary) {
    let i = part.indexOf('.')
    if (i === -1) {
      result.push(part)
      result.push('')
    } else {
      result.push(part.slice(0, i))
      result.push(part.slice(i))
    }
  }
  return result
}

// type NoneString<T> = T extends string ? never : T
type NoneString = Exclude<unknown, string>

// required mapKey for none-string[]
export function finderSort<T extends NoneString>(
  data: T[] | readonly T[],
  options: { mapKey: (item: T) => string; folderFirst?: boolean; locale?: string }
): T[]
// optional mapKey for string[]
export function finderSort(
  data: string[] | readonly string[],
  options?: { mapKey?: (item: string) => string; folderFirst?: boolean; locale?: string }
): string[]

export function finderSort<T extends string | NoneString>(
  data: T[] | readonly T[],
  options: { mapKey?: (item: T) => string; folderFirst?: boolean; locale?: string } = {}
) {
  const mapped = data.map((item) => {
    const key = typeof item === 'string' ? item : options.mapKey!(item)
    const sortKey = getFinderSortKey(key, options.folderFirst)
    return { item, sortKey }
  })

  const compare = createFinderSortKeyComparator(options.locale)
  mapped.sort((a, b) => compare(a.sortKey, b.sortKey))
  return mapped.map((m) => m.item)
}
export default finderSort

export type FinderSortKey = ReturnType<typeof getFinderSortKey>

export function getFinderSortKey(filePath: string, folderFirst?: boolean) {
  filePath = forceNumbersIntoOrder(filePath) // number
  const splited = filePath.split('/')
  if (folderFirst) {
    splited.forEach((dir, index) => {
      if (index !== splited.length - 1) {
        splited[index] = '0'.repeat(20) + splited[index] // pad with many zero
      }
    })
  }
  return separateExtensions(splited)
}

export function createFinderSortKeyComparator(locale?: string) {
  return function cascadeLocalecompare(a: FinderSortKey, b: FinderSortKey) {
    let common_len = Math.min(a.length, b.length)
    for (let i = 0; i < common_len; i++) {
      if (a[i] === b[i]) {
        continue
      }
      let r = locale ? a[i].localeCompare(b[i], locale) : a[i].localeCompare(b[i])
      if (r !== 0) {
        return r
      } else if (a > b) {
        return 1
      } else if (a < b) {
        return -1
      }
    }
    return a.length - b.length
  }
}
