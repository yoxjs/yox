
import Node from './Node'
import Literal from './Literal'
import * as nodeType from '../nodeType'

import around from '../../function/around'
import * as env from '../../config/env'
import * as array from '../../util/array'

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

  flatten() {
    let result = [ ]

    let current = this, next
    do {
      next = current.object
      if (current.type === nodeType.MEMBER) {
        result.unshift(current.property)
      }
      else {
        result.unshift(current)
      }
    }
    while (current = next)

    return result
  }

  stringify() {
    let list = this.flatten()
    return list.map(
      function (node, index) {
        if (node.type === nodeType.LITERAL) {
          return `.${node.value}`
        }
        else {
          node = node.stringify()
          return index > 0
            ? `[${node}]`
            : node
        }
      }
    ).join('')
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

  run(data) {
    let list = this.flatten()
    let firstNode = list.shift()

    let { value, deps } = firstNode.run(data)
    let currentValue = value, memberDeps = [ ], keypaths = [ deps[0] ]

    array.each(
      list,
      function (node) {
        if (node.type !== nodeType.LITERAL) {
          let { value, deps }= node.run(data)
          node = new Literal(value)
          memberDeps.push(deps)
        }
        keypaths.push(node.value)
        currentValue = currentValue[node.value]
      }
    )

    memberDeps.unshift([ keypaths.join('.') ])

    return {
      value: currentValue,
      deps: array.unique(
        execute(
          array.merge,
          env.NULL,
          memberDeps
        )
      ),
    }
  }

}
