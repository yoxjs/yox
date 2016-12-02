
import Node from './Node'
import * as nodeType from '../nodeType'

import around from '../../function/around'

/**
 * Conditional 节点
 *
 * @param {Node} test
 * @param {Node} consequent
 * @param {Node} alternate
 */
export default class Conditional extends Node {

  constructor(test, consequent, alternate) {
    super(nodeType.CONDITIONAL)
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
  }

  stringify() {
    let { test, consequent, alternate } = this
    return `(${test.stringify()}) ? (${consequent.stringify()}) : (${alternate.stringify()})`
  }

  traverse(enter, leave) {
    around(
      this,
      function (node) {
        let { test, consequent, alternate } = node
        test.traverse(enter, leave)
        consequent.traverse(enter, leave)
        alternate.traverse(enter, leave)
      },
      enter,
      leave
    )
  }

}
