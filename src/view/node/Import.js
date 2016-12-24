
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'

/**
 * import 节点
 *
 * @param {string} name
 */
export default class Import extends Node {

  constructor(name) {
    super(nodeType.IMPORT, env.FALSE)
    this.name = name
  }

}
