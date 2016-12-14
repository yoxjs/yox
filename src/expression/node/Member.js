
import Node from './Node'
import Literal from './Literal'
import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as object from '../../util/object'

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
    // deps 包含第一个 term 对应的数据，其实我们想要的是到最后一个 term 的数据
    let key = object.keys(deps)[0], keypaths = [ key ]
    delete deps[key]

    if (is.object(value)) {
      array.each(
        list,
        function (node) {
          if (node.type !== nodeType.LITERAL) {
            let result= node.execute(context)
            object.extend(deps, result.deps)
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

    deps[ keypaths.join('.') ] = value

    return {
      value,
      deps,
    }
  }

}
