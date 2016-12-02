
import Node from './Node'
import * as nodeType from '../nodeType'

import around from '../../function/around'

/**
 * Binary 节点
 *
 * @param {Node} right
 * @param {string} operator
 * @param {Node} left
 */
export default class Binary extends Node {

  constructor(right, operator, left) {
    super(nodeType.BINARY)
    this.right = right
    this.operator = operator
    this.left = left
  }

  stringify() {
    let { right, operator, left } = this
    return `(${left.stringify()}) ${operator} (${right.stringify()})`
  }

  traverse(enter, leave) {
    around(
      this,
      function (node) {
        let { left, right } = node
        left.traverse(enter, leave)
        right.traverse(enter, leave)
      },
      enter,
      leave
    )
  }

}
