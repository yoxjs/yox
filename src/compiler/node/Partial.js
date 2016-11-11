
import Node from './Node'

import * as nodeType from '../nodeType'

/**
 * partial 节点
 *
 * @param {string} name
 */
export default class Partial extends Node {

  constructor(name) {
    super()
    this.type = nodeType.PARTIAL
    this.name = name
  }

}
