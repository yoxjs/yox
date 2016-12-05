
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
    let keypath = data.keys.join('.')
    if (name.type === nodeType.EXPRESSION) {
      name = name.execute(data.context, keypath)
    }

    let node = new Attribute(name)
    node.keypath = keypath
    data.parent.addAttr(node)

    this.renderChildren(
      object.extend({ }, data, { parent: node })
    )

  }

}
