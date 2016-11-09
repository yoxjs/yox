
import {
  ATTRIBUTE,
  EXPRESSION,
} from '../nodeType'

import Node from './Node'

/**
 * 属性节点
 *
 * @param {string} name 属性名
 */
module.exports = class Attribute extends Node {

  constructor(name) {
    super()
    this.type = ATTRIBUTE
    this.name = name
  }

  render(parent, context, keys, parseTemplate) {

    let { name } = this
    if (name.type === EXPRESSION) {
      name = name.execute(context)
    }

    let node = new Attribute(name)
    node.keypath = keys.join('.')
    parent.addAttr(node)

    this.renderChildren(node, context, keys, parseTemplate)

  }

}
