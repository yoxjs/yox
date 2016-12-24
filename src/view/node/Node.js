
import * as env from '../../config/env'
import * as nodeType from '../nodeType'

import * as array from '../../util/array'
import * as object from '../../util/object'
import * as keypath from '../../util/keypath'

import execute from '../../function/execute'
import toString from '../../function/toString'

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
        lastChild.content += toString(node.content)
        return
      }
    }
    children.push(node)
  }

  execute(data) {
    let { context, keys, addDeps } = data
    let { value, deps } = this.expr.execute(context)
    let newDeps = { }
    object.each(
      deps,
      function (value, key) {
        newDeps[
          keypath.resolve(
            keypath.stringify(keys),
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
