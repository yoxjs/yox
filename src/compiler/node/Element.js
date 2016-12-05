
import Node from './Node'

import * as nodeType from '../nodeType'
import * as array from '../../util/array'
import * as object from '../../util/object'

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

  getAttributes() {
    let result = { }
    array.each(
      this.attrs,
      function (node) {
        result[node.name] = node.getValue()
      }
    )
    return result
  }

  render(data) {

    let instance = this
    let node = new Element(instance.name, instance.component)
    node.keypath = data.keys.join('.')
    data.parent.addChild(node)

    data = object.extend({ }, data, { parent: node })
    instance.renderChildren(data, instance.attrs)
    instance.renderChildren(data, instance.directives)
    instance.renderChildren(data)

  }

}
