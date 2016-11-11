
import Node from './Node'

import * as env from '../../config/env'
import * as nodeType from '../nodeType'

/**
 * if 节点
 *
 * @param {Expression} expr 判断条件
 */
export default class If extends Node {

  constructor(expr) {
    super()
    this.type = nodeType.IF
    this.expr = expr
  }

  render(data) {

    // if 是第一个判断
    // 当它为假时，需要跟进后续的条件分支
    // 这里用到 reduce 的机制非常合适
    // 即如果前一个分支不满足，返回 true，告知后续的要执行
    if (this.execute(data.context)) {
      this.renderChildren(data)
    }
    else {
      return env.TRUE
    }

  }

}
