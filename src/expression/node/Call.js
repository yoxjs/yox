
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'
import * as array from '../../util/array'
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

  execute(context) {
    let { callee, args } = this
    callee = callee.execute(context)
    let deps = [ callee.deps ]
    let value = execute(
      callee.value,
      env.NULL,
      args.map(
        function (arg) {
          let result = arg.execute(context)
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
