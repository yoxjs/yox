
import {
  NULL,
} from '../config/env'

import * as logger from '../config/logger'

import getLocationByIndex from '../function/getLocationByIndex'

const breaklinePrefixPattern = /^[ \t]*\n/
const breaklineSuffixPattern = /\n[ \t]*$/

export function isBreakLine(str) {
  return str.indexOf('\n') >= 0 && !str.trim()
}

export function trimBreakline(str) {
  return str
    .replace(breaklinePrefixPattern, '')
    .replace(breaklineSuffixPattern, '')
}

export function parseError(str, errorMsg, errorIndex) {
  if (errorIndex == NULL) {
    errorMsg += '.'
  }
  else {
    let { line, col } = getLocationByIndex(str, errorIndex)
    errorMsg += `, at line ${line}, col ${col}.`
  }
  logger.error(errorMsg)
}
