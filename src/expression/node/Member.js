
import Node from './Node'
import * as nodeType from '../nodeType'

import around from '../../function/around'

/**
 * Member 节点
 *
 * @param {Identifier} object
 * @param {Node} property
 */
export default class Member extends Node {

  constructor(object, property) {
    super(nodeType.MEMBER)
    this.object = object
    this.property = property
  }

  stringify() {
    let result = [ ]

    let push = function (node) {
      if (node.type === nodeType.LITERAL) {
        result.push(`.${node.value}`)
      }
      else {
        node = node.stringify()
        result.push(
          next ? `[${node}]` : node
        )
      }
    }

    let current = this, next
    do {
      next = current.object
      if (current.type === nodeType.MEMBER) {
        push(current.property, next)
      }
      else {
        push(current, next)
      }
    }
    while (current = next)

    return result.reverse().join('')
  }

  traverse(enter, leave) {
    around(
      this,
      function (node) {
        let { object, property } = node
        property.traverse(enter, leave)
        object.traverse(enter, leave)
      },
      enter,
      leave
    )
  }

}
