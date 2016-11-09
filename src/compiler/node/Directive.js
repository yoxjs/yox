
import {
  DIRECTIVE,
} from '../nodeType'

import Node from './Node'

/**
 * 指令节点
 *
 * on-click="submit()"
 *
 * @param {string} name 指令名
 */
module.exports = class Directive extends Node {

  constructor(name) {
    super()
    this.type = DIRECTIVE
    this.name = name
  }

  render(parent, context, keys, parseTemplate) {

    let node = new Directive(this.name)
    node.keypath = keys.join('.')
    parent.addDirective(node)

    this.renderChildren(node, context, keys, parseTemplate)

  }

}
