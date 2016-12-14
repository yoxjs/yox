
import Node from './Node'

import * as nodeType from '../nodeType'
import * as object from '../../util/object'

/**
 * 属性节点
 *
 * @param {string|Expression} name 属性名
 */
export default class Attribute extends Node {

  constructor(name) {
    super(nodeType.ATTRIBUTE)
    this.name = name
  }

  render(data) {

    let { name } = this
    let { keys, parent } = data

    if (name.type === nodeType.EXPRESSION) {
      let { value } = name.execute(data)
      name = value
    }

    let node = new Attribute(name)
    node.keypath = keys.join('.')
    parent.addAttr(node)

    this.renderChildren(
      object.extend({ }, data, { parent: node })
    )

  }

}
