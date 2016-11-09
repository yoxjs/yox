
import {
  noop,
} from './env'

import * as switcher from './switcher'

/**
 * 是否有原生的日志特性，没有需要单独实现
 *
 * @inner
 * @param {boolean}
 */
const hasConsole = typeof console !== 'undefined'

/**
 * 打印警告日志
 *
 * @param {string} msg
 */
export const warn = hasConsole
  ? function (msg) {
    if (switcher.debug) {
      console.warn(msg)
    }
  }
  : noop

/**
 * 打印错误日志
 *
 * @param {string} msg
 */
export const error = hasConsole
  ? function (msg) {
    console.error(msg)
  }
  : noop