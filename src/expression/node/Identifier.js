
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'
import * as object from '../../util/object'

/**
 * Identifier 节点
 *
 * @param {string} name
 */
export default class Identifier extends Node {

  constructor(name) {
    super(nodeType.IDENTIFIER)
    this.name = name
  }

  stringify() {
    return this.name
  }

  run(data) {
    let { name } = this
    let result = object.get(data, name)
    return {
      value: result ? result.value : env.UNDEFINED,
      deps: [ name ]
    }
  }

}
