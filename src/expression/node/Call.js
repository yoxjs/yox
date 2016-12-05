
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'
import * as array from '../../util/array'
import around from '../../function/around'
import execute from '../../function/execute'

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

  run(data, func) {
    let { callee, args } = this
    let deps = [ ]

    if (!func) {
      callee = callee.run(data)
      func = callee.value
      deps.push(callee.deps)
    }

    let value = execute(
      func,
      env.NULL,
      args.map(
        function (arg) {
          let result = arg.run(data)
          deps.push(result.deps)
          return result.value
        }
      )
    )
    return {
      value,
      deps: array.unique(
        execute(
          array.merge,
          env.NULL,
          deps
        )
      )
    }
  }

}
