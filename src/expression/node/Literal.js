
import Node from './Node'
import * as nodeType from '../nodeType'

import * as is from '../../util/is'

/**
 * Literal 节点
 *
 * @param {string} value
 */
export default class Literal extends Node {

  constructor(value) {
    super(nodeType.LITERAL)
    this.value = value
  }

  stringify() {
    let { value } = this
    return is.string(value)
      ? `'${value}'`
      : value
  }

  execute() {
    return {
      value: this.value,
      deps: { },
    }
  }

}
