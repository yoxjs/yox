
import {
  TRUE,
  FALSE,
  NULL,
  UNDEFINED,
} from '../config/env'

import * as cache from '../config/cache'
import * as logger from '../config/logger'

import {
  each,
} from './array'

import {
  keys,
} from './object'

import {
  isString,
  isFunction,
} from './is'

/**
 * 仅支持一句表达式，即不支持 `a + b, b + c`
 */

// 节点类型
export const LITERAL = 1
export const ARRAY = 2
export const IDENTIFIER = 3
export const THIS = 4
export const MEMBER = 5
export const UNARY = 6
export const BINARY = 7
export const CONDITIONAL = 8
export const CALL = 9

export const THIS_ARG = '$_$'

// 分隔符
const COMMA  = 44 // ,
const SEMCOL = 59 // ;
const PERIOD = 46 // .
const SQUOTE = 39 // '
const DQUOTE = 34 // "
const OPAREN = 40 // (
const CPAREN = 41 // )
const OBRACK = 91 // [
const CBRACK = 93 // ]
const QUMARK = 63 // ?
const COLON  = 58 // :

/**
 * 倒排对象的 key
 *
 * @inner
 * @param {Object} obj
 * @return {Array.<string>}
 */
function sortKeys(obj) {
  return keys(obj).sort(
    function (a, b) {
      return b.length - a.length
    }
  )
}

// 用于判断是否是一元操作符
const unaryOperatorMap = {
  '+': TRUE,
  '-': TRUE,
  '!': TRUE,
  '~': TRUE,
}

const sortedUnaryOperatorList = sortKeys(unaryOperatorMap)

// 操作符和对应的优先级，数字越大优先级越高
const binaryOperatorMap = {
  '||': 1,
  '&&': 2,
  '|': 3,
  '^': 4,
  '&': 5,
  '==': 6,
  '!=': 6,
  '===': 6,
  '!==': 6,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  '<<':8,
  '>>': 8,
  '>>>': 8,
  '+': 9,
  '-': 9,
  '*': 10,
  '/': 10,
  '%': 10,
}

const sortedBinaryOperatorList = sortKeys(binaryOperatorMap)

// 区分关键字和普通变量
// 举个例子：a === true
// 从解析器的角度来说，a 和 true 是一样的 token
const keywords = {
  'true': TRUE,
  'false': FALSE,
  'null': NULL,
  'undefined': UNDEFINED,
}

/**
 * 是否是数字
 *
 * @inner
 * @param {string} charCode
 * @return {boolean}
 */
function isNumber(charCode) {
  return charCode >= 48 && charCode <= 57 // 0...9
}

/**
 * 是否是空白符
 *
 * @inner
 * @param {string} charCode
 * @return {boolean}
 */
function isWhitespace(charCode) {
  return charCode === 32  // space
    || charCode === 9     // tab
}

/**
 * 变量开始字符必须是 字母、下划线、$
 *
 * @inner
 * @param {string} charCode
 * @return {boolean}
 */
function isIdentifierStart(charCode) {
  return charCode === 36 // $
    || charCode === 95   // _
    || (charCode >= 97 && charCode <= 122) // a...z
    || (charCode >= 65 && charCode <= 90)  // A...Z
}

/**
 * 变量剩余的字符必须是 字母、下划线、$、数字
 *
 * @inner
 * @param {string} charCode
 * @return {boolean}
 */
function isIdentifierPart(charCode) {
  return isIdentifierStart(charCode) || isNumber(charCode)
}

/**
 * 用倒排 token 去匹配 content 的开始内容
 *
 * @inner
 * @param {string} content
 * @param {Array.<string>} sortedTokens 数组长度从大到小排序
 * @return {string}
 */
function matchBestToken(content, sortedTokens) {
  let result
  each(sortedTokens, function (token) {
    if (content.startsWith(token)) {
      result = token
      return FALSE
    }
  })
  return result
}

/**
 * 懒得说各种细节错误，表达式都输出了看不出原因我也没办法
 *
 * @inner
 * @param {string} expression
 * @return {Error}
 */
function throwError(expression) {
  logger.error(`Failed to parse expression: [${expression}].`)
}

/**
 * 创建一个三目运算
 *
 * @inner
 * @param {Object} test
 * @param {Object} consequent
 * @param {Object} alternate
 * @return {Object}
 */
function createConditional(test, consequent, alternate) {
  return {
    type: CONDITIONAL,
    test,
    consequent,
    alternate,
  }
}

/**
 * 创建一个二元表达式
 *
 * @inner
 * @param {Object} right
 * @param {string} operator
 * @param {Object} left
 * @return {Object}
 */
function createBinary(right, operator, left) {
  return {
    type: BINARY,
    operator,
    left,
    right,
  }
}

/**
 * 创建一个一元表达式
 *
 * @inner
 * @param {string} operator
 * @param {Object} argument
 * @return {Object}
 */
function createUnary(operator, argument) {
  return {
    type: UNARY,
    operator,
    argument,
  }
}

function createLiteral(value) {
  return {
    type: LITERAL,
    value,
  }
}

function createIdentifier(name) {
  return {
    type: IDENTIFIER,
    name,
  }
}

function createThis() {
  return {
    type: THIS,
  }
}

function createMember(object, property) {
  return {
    type: MEMBER,
    object,
    property,
  }
}

function createArray(elements) {
  return {
    type: ARRAY,
    elements,
  }
}

function createCall(callee, args) {
  return {
    type: CALL,
    'arguments': args,
    callee,
  }
}

/**
 * 表达式解析成抽象语法树
 *
 * @param {string} content 表达式字符串
 * @return {Object}
 */
export function parse(content) {

  let { length } = content
  let index = 0
  let charCode
  let value

  function getChar() {
    return content.charAt(index)
  }
  function getCharCode(i) {
    return content.charCodeAt(i != NULL ? i : index)
  }

  function skipWhitespace() {
    while (isWhitespace(getCharCode())) {
      index++
    }
  }

  function skipNumber() {
    while (isNumber(getCharCode())) {
      index++
    }
  }

  function skipString() {
    let closed, quote = getCharCode()
    index++
    while (index < length) {
      index++
      if (getCharCode(index - 1) === quote) {
        closed = TRUE
        break
      }
    }
    if (!closed) {
      return throwError(content)
    }
  }

  function skipIdentifier() {
    // 第一个字符一定是经过 isIdentifierStart 判断的
    // 因此循环至少要执行一次
    do {
      index++
    }
    while (isIdentifierPart(getCharCode()))
  }

  function parseNumber() {

    let start = index

    skipNumber()
    if (getCharCode() === PERIOD) {
      index++
      skipNumber()
    }

    return createLiteral(
      parseFloat(
        content.substring(start, index)
      )
    )

  }

  function parseString() {

    let start = index

    skipString()

    return createLiteral(
      content.substring(start + 1, index - 1)
    )

  }

  function parseIdentifier() {

    let start = index
    skipIdentifier()

    value = content.substring(start, index)
    if (keywords[value]) {
      return createLiteral(keywords[value])
    }
    else if (value === 'this') {
      return createThis()
    }

    return value ? createIdentifier(value) : throwError(content)

  }

  function parseTuple(delimiter) {

    let args = [], closed

    while (index < length) {
      charCode = getCharCode()
      if (charCode === delimiter) {
        index++
        closed = TRUE
      }
      else if (charCode === COMMA) {
        index++
      }
      else {
        args.push(
          parseExpression()
        )
      }
    }

    return closed ? args : throwError(content)

  }

  function parseOperator(sortedOperatorList) {
    skipWhitespace()
    value = matchBestToken(content.slice(index), sortedOperatorList)
    if (value) {
      index += value.length
      return value
    }
  }

  function parseVariable() {

    value = parseIdentifier()

    while (index < length) {
      // a(x)
      charCode = getCharCode()
      if (charCode === OPAREN) {
        index++
        value = createCall(value, parseTuple(CPAREN))
        break
      }
      else {
        // a.x
        if (charCode === PERIOD) {
          index++
          value = createMember(value, createLiteral(parseIdentifier().name))
        }
        // a[x]
        else if (charCode === OBRACK) {
          index++
          value = createMember(value, parseSubexpression(CBRACK))
        }
        else {
          break
        }
      }
    }

    return value

  }

  function parseToken() {
    skipWhitespace()

    charCode = getCharCode()
    // 'xx' 或 "xx"
    if (charCode === SQUOTE || charCode === DQUOTE) {
      return parseString()
    }
    // 1.1 或 .1
    else if (isNumber(charCode) || charCode === PERIOD) {
      return parseNumber()
    }
    // [xx, xx]
    else if (charCode === OBRACK) {
      index++
      return createArray(parseTuple(CBRACK))
    }
    // (xx, xx)
    else if (charCode === OPAREN) {
      index++
      return parseSubexpression(CPAREN)
    }
    else if (isIdentifierStart(charCode)) {
      return parseVariable()
    }
    value = parseOperator(sortedUnaryOperatorList)
    return value ? parseUnary(value) : throwError(content)
  }

  function parseUnary(operator) {
    value = parseToken()
    if (!value) {
      return throwError(content)
    }
    return createUnary(operator, value)
  }

  function parseBinary() {

    let left = parseToken()
    let operator = parseOperator(sortedBinaryOperatorList)
    if (!operator) {
      return left
    }

    let right = parseToken()
    let stack = [left, operator, binaryOperatorMap[operator], right]

    while (operator = parseOperator(sortedBinaryOperatorList)) {

      // 处理左边
      if (stack.length > 3 && binaryOperatorMap[operator] < stack[stack.length - 2]) {
        stack.push(
          createBinary(
            stack.pop(),
            (stack.pop(), stack.pop()),
            stack.pop()
          )
        )
      }

      right = parseToken()
      if (!right) {
        return throwError(content)
      }
      stack.push(operator, binaryOperatorMap[operator], right)
    }

    // 处理右边
    // 右边只有等到所有 token 解析完成才能开始
    // 比如 a + b * c / d
    // 此时右边的优先级 >= 左边的优先级，因此可以脑残的直接逆序遍历

    right = stack.pop()
    while (stack.length > 1) {
      right = createBinary(
        right,
        (stack.pop(), stack.pop()),
        stack.pop()
      )
    }

    return right

  }

  // (xx) 和 [xx] 都可能是子表达式，因此
  function parseSubexpression(delimiter) {
    value = parseExpression()
    if (getCharCode() === delimiter) {
      index++
      return value
    }
    else {
      return throwError(content)
    }
  }

  function parseExpression() {

    // 主要是区分三元和二元表达式
    // 三元表达式可以认为是 3 个二元表达式组成的
    // test ? consequent : alternate

    let test = parseBinary()

    skipWhitespace()
    if (getCharCode() === QUMARK) {
      index++

      let consequent = parseBinary()

      skipWhitespace()
      if (getCharCode() === COLON) {
        index++

        let alternate = parseBinary()

        // 保证调用 parseExpression() 之后无需再次调用 skipWhitespace()
        skipWhitespace()
        return createConditional(test, consequent, alternate)
      }
      else {
        return throwError(content)
      }
    }

    return test

  }

  let { expressionParse } = cache
  if (!expressionParse[content]) {
    let node = parseExpression()
    node.$raw = content
    expressionParse[content] = node
  }

  return expressionParse[content]

}

/**
 * 创建一个可执行的函数来运行该代码
 *
 * @param {string|Object} ast
 * @return {Function}
 */
export function compile(ast) {

  let content

  if (isString(ast)) {
    content = ast
    ast = parse(content)
  }
  else if (ast) {
    content = ast.$raw
  }

  // 如果函数是 function () { return this }
  // 如果用 fn.call('')，返回的会是个 new String('')，不是字符串字面量
  // 这里要把 this 强制改掉

  let { expressionCompile } = cache

  if (!expressionCompile[content]) {
    let args = [ ]
    let hasThis

    traverse(
      ast,
      {
        enter: function (node) {
          if (node.type === IDENTIFIER) {
            args.push(node.name)
          }
          else if (node.type === THIS) {
            hasThis = TRUE
            args.push(THIS_ARG)
          }
        }
      }
    )

    if (hasThis) {
      content = content.replace(/\bthis\b/, THIS_ARG)
    }

    let fn = new Function(args.join(', '), `return ${content}`)
    fn.$arguments = args
    expressionCompile[content] = fn
  }

  return expressionCompile[content]

}

/**
 * 遍历抽象语法树
 *
 * @param {Object} ast
 * @param {Function?} options.enter
 * @param {Function?} options.leave
 */
export function traverse(ast, options = {}) {

  // enter 返回 false 可阻止继续遍历
  if (isFunction(options.enter) && options.enter(ast) === FALSE) {
    return
  }

  switch (ast.type) {

    case CONDITIONAL:
      traverse(ast.test, options)
      traverse(ast.consequent, options)
      traverse(ast.alternate, options)
      break

    case BINARY:
      traverse(ast.left, options)
      traverse(ast.right, options)
      break

    case UNARY:
      traverse(ast.argument, options)
      break

    case MEMBER:
      traverse(ast.object, options)
      traverse(ast.property, options)
      break

    case CALL:
      traverse(ast.callee, options)
      each(
        ast.arguments,
        function (arg) {
          traverse(arg, options)
        }
      )
      break

    case ARRAY:
      each(
        ast.elements,
        function (element) {
          traverse(element, options)
        }
      )
      break

  }

  if (isFunction(options.leave)) {
    options.leave(ast)
  }

}
