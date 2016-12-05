
import * as env from '../../config/env'
import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as array from '../../util/array'

import around from '../../function/around'
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

  execute(context, keypath) {
    let { expr } = this
    let result = expr.execute(context)
    // console.log('expr', keypath, expr.stringify(), result)
    // 可能是任何类型的结果
    return result.value
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

  traverse(enter, leave) {
    return around(
      this,
      function (node) {
        if (is.array(node.children)) {
          let children = [ ]
          array.each(
            node.children,
            function (item) {
              item = item.traverse(enter, leave)
              if (item != env.NULL) {
                children.push(item)
              }
            }
          )
          return children
        }
      },
      enter,
      leave
    )
  }

}
