
import * as env from '../config/env'
import * as array from '../util/array'

/**
 * 是否是数字
 *
 * @param {number} charCode
 * @return {boolean}
 */
export function isNumber(charCode) {
  return charCode >= 48 && charCode <= 57 // 0...9
}

/**
 * 是否是空白符
 *
 * @param {number} charCode
 * @return {boolean}
 */
export function isWhitespace(charCode) {
  return charCode === 32  // space
    || charCode === 9     // tab
}

/**
 * 变量开始字符必须是 字母、下划线、$
 *
 * @param {number} charCode
 * @return {boolean}
 */
export function isIdentifierStart(charCode) {
  return charCode === 36 // $
    || charCode === 95   // _
    || (charCode >= 97 && charCode <= 122) // a...z
    || (charCode >= 65 && charCode <= 90)  // A...Z
}

/**
 * 变量剩余的字符必须是 字母、下划线、$、数字
 *
 * @param {number} charCode
 * @return {boolean}
 */
export function isIdentifierPart(charCode) {
  return isIdentifierStart(charCode) || isNumber(charCode)
}

/**
 * 用倒排 token 去匹配 content 的开始内容
 *
 * @param {string} content
 * @param {Array.<string>} sortedTokens 数组长度从大到小排序
 * @return {?string}
 */
export function matchBestToken(content, sortedTokens) {
  let result
  array.each(
    sortedTokens,
    function (token) {
      if (content.startsWith(token)) {
        result = token
        return env.FALSE
      }
    }
  )
  return result
}

/**
 * 懒得说各种细节错误，表达式都输出了看不出原因我也没办法
 *
 * @param {string} expression
 */
export function parseError(expression) {
  logger.error(`Failed to parse expression: [${expression}].`)
}
