
import Node from './Node'

import * as nodeType from '../nodeType'

/**
 * else if 节点
 *
 * @param {Expression} expr 判断条件
 */
export default class ElseIf extends Node {

  constructor(expr) {
    super(nodeType.ELSE_IF)
    this.expr = expr
  }

  render(data) {
    let { value } = this.renderExpression(data)
    if (value) {
      return this.renderChildren(data)
    }
  }

}
