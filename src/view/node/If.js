
import Node from './Node'
import * as nodeType from '../nodeType'

/**
 * if 节点
 *
 * @param {Expression} expr 判断条件
 */
export default class If extends Node {

  constructor(expr) {
    super(nodeType.IF)
    this.expr = expr
  }

  render(data) {
    let { value } = this.renderExpression(data)
    if (value) {
      return this.renderChildren(data)
    }
  }

}
