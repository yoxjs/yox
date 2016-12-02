
import Node from './Node'
import * as nodeType from '../nodeType'

import * as array from '../../util/array'
import around from '../../function/around'

/**
 * Call 节点
 *
 * @param {Node} callee
 * @param {Array.<Node>} args
 */
export default class Call extends Node {

  constructor(callee, args) {
    super(nodeType.CALL)
    this.callee = callee
    this.args = args
  }

  stringify() {
    let { callee, args } = this
    args = args.map(
      function (arg) {
        return arg.stringify()
      }
    )
    return `${callee.stringify()}(${args.join(', ')})`
  }

  traverse(enter, leave) {
    around(
      this,
      function (node) {
        let { callee, args } = node
        callee.traverse(enter, leave)
        array.each(
          args,
          function (arg) {
            arg.traverse(enter, leave)
          }
        )
      },
      enter,
      leave
    )
  }

}
