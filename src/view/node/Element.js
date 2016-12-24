
import Node from './Node'
import * as nodeType from '../nodeType'

import * as keypathUtil from '../../util/keypath'

/**
 * 元素节点
 *
 * @param {string} name
 * @param {string} component
 */
export default class Element extends Node {

  constructor(name, component) {
    super(nodeType.ELEMENT)
    this.name = name
    this.component = component
    this.attrs = [ ]
    this.directives = [ ]
  }

  addChild(child) {
    let children
    if (child.type === nodeType.ATTRIBUTE) {
      children = this.attrs
    }
    else if (child.type === nodeType.DIRECTIVE) {
      children = this.directives
    }
    else {
      children = this.children
    }
    children.push(child)
  }

  render(data) {

    let instance = this

    let node = new Element(instance.name, instance.component)
    node.keypath = keypathUtil.stringify(data.keys)
    node.attrs = instance.renderChildren(data, instance.attrs)
    node.directives = instance.renderChildren(data, instance.directives)
    node.children = instance.renderChildren(data)

    return [ node ]

  }

}
