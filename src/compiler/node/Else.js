
import Node from './Node'

import * as nodeType from '../nodeType'

/**
 * else 节点
 */
module.exports = class Else extends Node {

  constructor() {
    super()
    this.type = nodeType.ELSE
  }

  render(data, prev) {
    if (prev) {
      this.renderChildren(data)
    }
  }

}
