
import Node from './Node'

import * as nodeType from '../nodeType'
import * as array from '../../util/array'
import * as object from '../../util/object'
import * as keypath from '../../util/keypath'

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

  addAttr(node) {
    this.attrs.push(node)
  }

  addDirective(node) {
    this.directives.push(node)
  }

  render(data) {

    let instance = this
    let { name, component, attrs, directives } = instance
    let node = new Element(name, component)
    node.keypath = keypath.stringify(data.keys)
    data.parent.addChild(node)

    data = object.extend({ }, data, { parent: node })
    instance.renderChildren(data, attrs)
    instance.renderChildren(data, directives)
    instance.renderChildren(data)

  }

}
