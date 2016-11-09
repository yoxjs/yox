
import {
  PARTIAL,
} from '../nodeType'

import Node from './Node'

/**
 * partial 节点
 *
 * @param {string} name
 */
module.exports = class Partial extends Node {
  constructor(name) {
    super()
    this.type = PARTIAL
    this.name = name
  }
}
