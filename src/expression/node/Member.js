
import Node from './Node'
import Literal from './Literal'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'

import * as is from '../../util/is'
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

  execute(context) {
    let list = this.flatten()
    let firstNode = list.shift()

    let result = firstNode.execute(context)
    let value = result.value, deps = [ ], keypaths = [ result.deps[0] ]

    if (is.object(value)) {
      array.each(
        list,
        function (node) {
          if (node.type !== nodeType.LITERAL) {
            let result= node.execute(context)
            array.push(deps, result.deps)
            node = new Literal(result.value)
          }
          keypaths.push(node.value)
          value = value[node.value]
        }
      )
    }

    keypaths = keypaths.filter(
      function (keypath) {
        return keypath !== '.'
      }
    )

    array.push(deps, [ keypaths.join('.') ])

    return {
      value,
      deps,
    }
  }

}
