
import * as env from '../../config/env'
import * as array from '../../util/array'
import around from '../../function/around'
import execute from '../../function/execute'

import * as nodeType from '../nodeType'

/**
 * 节点基类
 */
export default class Node {

  constructor(type) {
    this.type = type
  }

  traverse(enter, leave) {
    around(
      this,
      env.NULL,
      enter,
      leave
    )
  }

  getDeps() {
    let deps = [ ]
    this.traverse(
      function (node) {
        if (node.type === nodeType.IDENTIFIER) {
          deps.push(node.stringify())
        }
      }
    )
    return deps
  }

}
