
import * as switcher from '../config/switcher'

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
export function warn(msg) {
  if (switcher.debug && hasConsole) {
    console.warn(msg)
  }
}

/**
 * 打印错误日志
 *
 * @param {string} msg
 */
export function error(msg) {
  if (hasConsole) {
    console.error(msg)
  }
}
