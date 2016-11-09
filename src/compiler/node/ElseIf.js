
import {
  ELSE_IF,
} from '../nodeType'

import Node from './Node'

/**
 * else if 节点
 *
 * @param {string} expr 判断条件
 */
module.exports = class ElseIf extends Node {

  constructor(expr) {
    super()
    this.type = ELSE_IF
    this.expr = expr
  }

  render(parent, context, keys, parseTemplate, prev) {
    if (prev) {
      if (this.execute(context)) {
        this.renderChildren(parent, context, keys, parseTemplate)
      }
      else {
        return prev
      }
    }
  }

}
