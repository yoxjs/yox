
import Node from './Node'
import Text from './Text'

import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as env from '../../config/env'
import * as array from '../../util/array'
import * as keypathUtil from '../../util/keypath'
import * as pattern from '../../config/pattern'

/**
 * 表达式节点
 *
 * @param {string} expr
 * @param {boolean} safe
 */
export default class Expression extends Node {

  constructor(expr, safe) {
    super(nodeType.EXPRESSION, env.FALSE)
    this.expr = expr
    this.safe = safe
  }

  render(data) {

    let { value } = this.renderExpression(data)
    if (value == env.NULL) {
      value = ''
    }
    else if (is.func(value) && value.$computed) {
      value = value()
    }

    let result = [ ], keypath = keypathUtil.stringify(data.keys)

    // 处理不转义的字符串模板
    if (!this.safe && is.string(value) && pattern.tag.test(value)) {
      array.each(
        data.parse(value),
        function (node) {
          node = node.render(data)
          if (node) {
            array.push(result, node)
          }
        }
      )
    }
    else {
      let node = new Text(value)
      node.keypath = keypath
      result.push(node)
    }

    return result

  }

}
