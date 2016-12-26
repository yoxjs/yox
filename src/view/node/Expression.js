
import Node from './Node'
import Text from './Text'

import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as env from '../../config/env'
import * as keypathUtil from '../../util/keypath'

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

    let node = new Text(value, this.safe)
    node.keypath = keypathUtil.stringify(data.keys)
    return [ node ]

  }

}
