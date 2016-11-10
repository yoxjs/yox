
import Node from './Node'

import * as env from '../../config/env'
import * as nodeType from '../nodeType'

/**
 * import 节点
 *
 * @param {string} name
 */
module.exports = class Import extends Node {

  constructor(name) {
    super(env.FALSE)
    this.type = nodeType.IMPORT
    this.name = name
  }

}
