
import Node from './Node'
import * as nodeType from '../nodeType'

import around from '../../function/around'

/**
 * Unary 节点
 *
 * @param {string} operator
 * @param {Node} arg
 */
export default class Unary extends Node {

  constructor(operator, arg) {
    super(nodeType.UNARY)
    this.operator = operator
    this.arg = arg
  }

  stringify() {
    let { operator, arg } = this
    return `${operator}${arg.stringify()}`
  }

  traverse(enter, leave) {
    around(
      this,
      function (node) {
        let { arg } = node
        arg.traverse(enter, leave)
      },
      enter,
      leave
    )
  }

}
