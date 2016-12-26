
import Node from './Node'
import * as nodeType from '../nodeType'

import * as is from 'yox-common/util/is'

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
    if (is.string(value)) {
      return value.indexOf('"') >= 0
        ? `'${value}'`
        : `"${value}"`
    }
    return value
  }

  execute() {
    return {
      value: this.value,
      deps: { },
    }
  }

}
