
import Node from './Node'
import * as nodeType from '../nodeType'

import * as array from '../../util/array'
import around from '../../function/around'

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

  traverse(enter, leave) {
    around(
      this,
      function (node) {
        let { elements } = node
        array.each(
          elements,
          function (element) {
            element.traverse(enter, leave)
          }
        )
      },
      enter,
      leave,
    )
  }

  run(data) {
    let values = [ ]
    return {
      value: values,
      deps: array.unique(
        execute(
          array.merge,
          env.NULL,
          this.elements.map(
            function (node) {
              let { deps, value } = node.run(data)
              values.push(value)
              return deps
            }
          )
        )
      )
    }
  }

}
