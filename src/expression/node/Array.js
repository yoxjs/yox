
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'
import * as array from '../../util/array'
import execute from '../../function/execute'

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
    let values = [ ]
    return {
      value: values,
      deps: array.unique(
        execute(
          array.merge,
          env.NULL,
          this.elements.map(
            function (node) {
              let { deps, value } = node.execute(context)
              values.push(value)
              return deps
            }
          )
        )
      )
    }
  }

}
