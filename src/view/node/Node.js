
import * as env from '../../config/env'
import * as nodeType from '../nodeType'

import * as array from '../../util/array'
import * as object from '../../util/object'
import * as keypathUtil from '../../util/keypath'

/**
 * 节点基类
 */
export default class Node {

  constructor(type, hasChildren) {
    this.type = type
    if (hasChildren !== env.FALSE) {
      this.children = [ ]
    }
  }

  addChild(child) {
    this.children.push(child)
  }

  renderExpression(data) {
    let { context, keys, addDeps } = data
    let { value, deps } = this.expr.execute(context)
    let newDeps = { }
    object.each(
      deps,
      function (value, key) {
        newDeps[
          keypathUtil.resolve(
            keypathUtil.stringify(keys),
            key
          )
        ] = value
      }
    )
    addDeps(newDeps)
    return {
      value,
      deps: newDeps,
    }
  }

  renderChildren(data, children) {
    if (!children) {
      children = this.children
    }
    let i = 0, node, next
    let list = [ ], item
    while (node = children[i]) {
      item = node.render(data)
      if (item) {
        array.push(list, item)
        if (node.type === nodeType.IF
          || node.type === nodeType.ELSE_IF
        ) {
          // 跳过后面紧跟着的 elseif else
          while (next = children[i + 1]) {
            if (next.type === nodeType.ELSE_IF || next.type === nodeType.ELSE) {
              i++
            }
            else {
              break
            }
          }
        }
      }
      i++
    }
    return list
  }

  renderTexts(nodes) {
    let { length } = nodes
    if (length === 1) {
      return nodes[0].content
    }
    else if (length > 1) {
      return nodes
      .map(
        function (node) {
          return node.content
        }
      )
      .join('')
    }
  }

}
