
import {
  ELEMENT,
} from '../nodeType'

import Node from './Node'

import {
  each,
} from '../../util/array'

/**
 * 元素节点
 *
 * @param {string} name
 */
module.exports = class Element extends Node {

  constructor(name, custom) {
    super()
    this.type = ELEMENT
    this.name = name
    this.custom = custom
    this.attrs = []
    this.directives = []
  }

  addAttr(node) {
    this.attrs.push(node)
  }

  addDirective(node) {
    this.directives.push(node)
  }

  getAttributes() {
    let result = { }
    each(
      this.attrs,
      function (node) {
        result[node.name] = node.getValue()
      }
    )
    return result
  }

  render(parent, context, keys, parseTemplate) {

    let instance = this
    let node = new Element(instance.name, instance.custom)
    node.keypath = keys.join('.')
    parent.addChild(node)

    instance.renderChildren(node, context, keys, parseTemplate, instance.attrs)
    instance.renderChildren(node, context, keys, parseTemplate, instance.directives)
    instance.renderChildren(node, context, keys, parseTemplate)

  }

}
