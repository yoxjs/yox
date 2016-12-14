
import * as env from '../../config/env'
import * as nodeType from '../nodeType'

import * as array from '../../util/array'
import * as object from '../../util/object'

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

  execute(data) {
    let { context, keys, addDeps } = data
    let { value, deps } = this.expr.execute(context)
    let newDeps = { }
    object.each(
      deps,
      function (value, keypath) {
        let base = object.copy(keys)
        array.each(
          keypath.split('/'),
          function (term) {
            if (term === '..') {
              base.pop()
            }
            else if (term && term !== '.') {
              base.push(term)
            }
          }
        )
        newDeps[base.join('.')] = value
      }
    )
    addDeps(newDeps)
    return {
      value,
      deps: newDeps,
    }
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
