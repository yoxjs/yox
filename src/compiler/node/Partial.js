
import Node from './Node'

import * as nodeType from '../nodeType'

/**
 * partial 节点
 *
 * @param {string} name
 */
module.exports = class Partial extends Node {

  constructor(name) {
    super()
    this.type = nodeType.PARTIAL
    this.name = name
  }

}
