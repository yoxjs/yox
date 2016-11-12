
import * as env from '../config/env'

import * as logger from './logger'

import getLocationByIndex from '../function/getLocationByIndex'

const breaklinePrefixPattern = /^[ \t]*\n/
const breaklineSuffixPattern = /\n[ \t]*$/

const nonSingleQuotePattern = /^[^']*/
const nonDoubleQuotePattern = /^[^"]*/

export function isBreakLine(str) {
  return str.indexOf('\n') >= 0 && !str.trim()
}

export function trimBreakline(str) {
  return str
    .replace(breaklinePrefixPattern, '')
    .replace(breaklineSuffixPattern, '')
}

export function matchByQuote(str, nonQuote) {
  let match = str.match(nonQuote === '"' ? nonDoubleQuotePattern : nonSingleQuotePattern)
  return match ? match[0] : ''
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
