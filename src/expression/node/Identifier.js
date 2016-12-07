
import Node from './Node'
import * as nodeType from '../nodeType'

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

  execute(context) {
    let deps = { }
    let { value, keypath } = context.get(this.name)
    deps[keypath] = value
    return {
      value,
      deps,
    }
  }

}
