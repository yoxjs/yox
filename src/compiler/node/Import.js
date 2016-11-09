
import {
  IMPORT,
} from '../nodeType'

import Node from './Node'

import {
  FALSE,
} from '../../config/env'


/**
 * import 节点
 *
 * @param {string} name
 */
module.exports = class Import extends Node {
  constructor(name) {
    super(FALSE)
    this.type = IMPORT
    this.name = name
  }
}
