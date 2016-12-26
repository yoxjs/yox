
import Node from './Node'
import * as nodeType from '../nodeType'

import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'

/**
 * Array 节点
 *
 * @param {Array.<Node>} elements
 */
export default class Array extends Node {

  constructor(elements) {
    super(nodeType.ARRAY)
    this.elements = elements
  }

  stringify() {
    let { elements } = this
    elements = elements.map(
      function (element) {
        return element.stringify()
      }
    )
    return `[${elements.join(', ')}]`
  }

  execute(context) {
    let value = [ ], deps = { }
    array.each(
      this.elements,
      function (node) {
        let result = node.execute(context)
        value.push(result.value)
        object.extend(deps, result.deps)
      }
    )
    return {
      value,
      deps,
    }
  }

}
