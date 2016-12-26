
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from 'yox-common/util/env'
import * as object from 'yox-common/util/object'
import execute from 'yox-common/function/execute'

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
    let { value, deps } = callee.execute(context)

    value = execute(
      value,
      env.NULL,
      args.map(
        function (arg) {
          let result = arg.execute(context)
          object.extend(deps, result.deps)
          return result.value
        }
      )
    )

    return {
      value,
      deps,
    }
  }

}
