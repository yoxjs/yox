
import Node from './Node'

import * as env from '../../config/env'
import * as nodeType from '../nodeType'
import * as array from '../../util/array'
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

    let deps
    if (name.type === nodeType.EXPRESSION) {
      let result = name.execute(data)
      name = result.value
      deps = result.deps
    }

    let node = new Attribute(name)
    node.keypath = keys.join('.')
    parent.addAttr(node)

    this.renderChildren(
      object.extend({ }, data, { parent: node })
    )

  }

}
