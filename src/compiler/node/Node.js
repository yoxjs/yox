
import * as env from '../../config/env'
import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as keypath from '../../util/keypath'

import execute from '../../function/execute'

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

  addChild(node) {
    let { children } = this
    if (node.type === nodeType.TEXT) {
      let lastChild = array.last(children)
      if (lastChild && lastChild.type === nodeType.TEXT) {
        lastChild.content += node.content
        return
      }
    }
    children.push(node)
  }

  getValue() {
    let { children } = this
    return children[0] ? children[0].content : env.TRUE
  }

  execute(context, base) {
    let { value, deps } = this.expr.execute(context)
    // deps = deps.map(
    //   function (dep) {
    //     return keypath.join(base, dep)
    //   }
    // )
    return value
  }

  render() {
    // noop
  }

  renderChildren(data, children) {
    array.reduce(
      children || this.children,
      function (prev, current) {
        return current.render(data, prev)
      }
    )
  }

}
