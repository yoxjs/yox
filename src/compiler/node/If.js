
import {
  TRUE,
} from '../../config/env'

import {
  IF,
} from '../nodeType'

import Node from './Node'

/**
 * if 节点
 *
 * @param {string} expr 判断条件
 */
module.exports = class If extends Node {

  constructor(expr) {
    super()
    this.type = IF
    this.expr = expr
  }

  render(parent, context, keys, parseTemplate) {

    // if 是第一个条件判断
    // 当它不满足条件，表示需要跟进后续的条件分支
    // 这里用到 reduce 的机制非常合适
    // 即如果前一个分支不满足，返回 true，告知后续的要执行
    if (this.execute(context)) {
      this.renderChildren(parent, context, keys, parseTemplate)
    }
    else {
      return TRUE
    }

  }

}
