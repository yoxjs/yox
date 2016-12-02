
import * as env from '../../config/env'
import around from '../../function/around'

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

}
