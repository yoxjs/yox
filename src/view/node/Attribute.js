
import Node from './Node'
import * as nodeType from '../nodeType'

import * as keypathUtil from '../../util/keypath'

/**
 * 属性节点
 *
 * @param {string|Expression} name 属性名
 */
export default class Attribute extends Node {

  constructor(name) {
    super(nodeType.ATTRIBUTE, arguments.length === 1)
    this.name = name
    this.value = arguments[1]
  }

  render(data) {

    let { name } = this

    if (name.type === nodeType.EXPRESSION) {
      let { value } = name.renderExpression(data)
      name = value
    }

    let value = this.renderTexts(
      this.renderChildren(data)
    )

    let node = new Attribute(name, value)
    node.keypath = keypathUtil.stringify(data.keys)
    return [ node ]

  }

}
