
import Node from './Node'
import * as nodeType from '../nodeType'

import * as keypathUtil from '../../util/keypath'

/**
 * 指令节点
 *
 * @param {string} name 指令名
 */
export default class Directive extends Node {

  constructor(name) {
    super(nodeType.DIRECTIVE, arguments.length === 1)
    this.name = name
    this.value = arguments[1]
  }

  render(data) {

    let { name } = this

    let value = this.renderTexts(
      this.renderChildren(data)
    )

    let node = new Directive(name, value)
    node.keypath = keypathUtil.stringify(data.keys)
    return [ node ]

  }

}
