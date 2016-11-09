
import {
  ELSE,
} from '../nodeType'

import Node from './Node'

/**
 * else 节点
 */
module.exports = class Else extends Node {

  constructor() {
    super()
    this.type = ELSE
  }

  render(parent, context, keys, parseTemplate, prev) {
    if (prev) {
      this.renderChildren(parent, context, keys, parseTemplate)
    }
  }

}
