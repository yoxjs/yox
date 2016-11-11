
import * as env from '../../config/env'
import * as array from '../../util/array'
import * as nodeType from '../nodeType'
import * as expression from '../../util/expression'

/**
 * 节点基类
 */
export default class Node {

  constructor(hasChildren) {
    if (hasChildren !== env.FALSE) {
      this.children = [ ]
    }
  }

  addChild(node) {
    let { children } = this
    if (node.type === nodeType.TEXT) {
      let lastChild = array.lastItem(children)
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

  execute(context) {
    let fn = expression.compile(this.expr)
    // 可能是任何类型的结果
    return fn.apply(
      env.NULL,
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

  renderChildren(data, children) {
    array.reduce(
      children || this.children,
      function (prev, current) {
        return current.render(data, prev)
      }
    )
  }

}
