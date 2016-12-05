
import Node from './Node'
import Literal from './Literal'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'
import * as array from '../../util/array'
import execute from '../../function/execute'

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

    let { value, deps } = firstNode.execute(context)
    let currentValue = value, memberDeps = [ ], keypaths = [ deps[0] ]

    array.each(
      list,
      function (node) {
        if (node.type !== nodeType.LITERAL) {
          let { value, deps }= node.execute(context)
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
