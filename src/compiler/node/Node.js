
import {
  TRUE,
  NULL,
} from '../../config/env'

import {
  reduce,
  lastItem,
} from '../../util/array'

import {
  compile,
  execute,
} from '../../util/expression'

import {
  TEXT,
} from '../nodeType'

/**
 * 节点基类
 */
module.exports = class Node {

  constructor(hasChildren = TRUE) {
    if (hasChildren) {
      this.children = []
    }
  }

  addChild(node) {
    let { children } = this
    if (node.type === TEXT) {
      let lastChild = lastItem(children)
      if (lastChild && lastChild.type === TEXT) {
        lastChild.content += node.content
        return
      }
    }
    children.push(node)
  }

  getValue() {
    let { children } = this
    return children[0] ? children[0].content : TRUE
  }

  execute(context) {
    let fn = compile(this.expr)
    // 可能是任何类型的结果
    return fn.apply(
      NULL,
      fn.$arguments.map(
        function (name) {
          return context.get(name)
        }
      )
    )
  }

  render() {
    // noop
  }

  renderChildren(parent, context, keys, parseTemplate, children) {
    reduce(
      children || this.children,
      function (prev, current) {
        return current.render(parent, context, keys, parseTemplate, prev)
      }
    )
  }

}
