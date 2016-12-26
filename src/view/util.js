
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as logger from 'yox-common/util/logger'

const breaklinePattern = /^[ \t]*\n[ \t]*$/
const breaklinePrefixPattern = /^[ \t]*\n/
const breaklineSuffixPattern = /\n[ \t]*$/

const nonSingleQuotePattern = /^[^']*/
const nonDoubleQuotePattern = /^[^"]*/

export function trimBreakline(str) {
  if (breaklinePattern.test(str)) {
    return ''
  }
  return str
    .replace(breaklinePrefixPattern, '')
    .replace(breaklineSuffixPattern, '')
}

export function matchByQuote(str, nonQuote) {
  let match = str.match(nonQuote === '"' ? nonDoubleQuotePattern : nonSingleQuotePattern)
  return match ? match[0] : ''
}

function getLocationByIndex(str, index) {

  let line = 0, col = 0, pos = 0

  array.each(
    str.split('\n'),
    function (lineStr) {
      line++
      col = 0

      let { length } = lineStr
      if (index >= pos && index <= (pos + length)) {
        col = index - pos
        return env.FALSE
      }

      pos += length
    }
  )

  return {
    line,
    col,
  }

}

export function parseError(str, errorMsg, errorIndex) {
  if (errorIndex == env.NULL) {
    errorMsg += '.'
  }
  else {
    let { line, col } = getLocationByIndex(str, errorIndex)
    errorMsg += `, at line ${line}, col ${col}.`
  }
  logger.error(errorMsg)
}
