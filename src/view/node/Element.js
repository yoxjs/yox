
import Node from './Node'
import * as nodeType from '../nodeType'

import * as object from 'yox-common/util/object'
import * as keypathUtil from 'yox-common/util/keypath'

/**
 * 元素节点
 *
 * @param {string} name
 * @param {string} component
 */
export default class Element extends Node {

  constructor(options) {
    super(nodeType.ELEMENT)
    object.extend(this, options)
  }

  addChild(child) {
    let children
    if (child.type === nodeType.ATTRIBUTE) {
      children = this.attrs || (this.attrs = [ ])
    }
    else if (child.type === nodeType.DIRECTIVE) {
      children = this.directives || (this.directives = [ ])
    }
    else {
      children = this.children
    }
    children.push(child)
  }

  render(data) {
    let options = {
      name: this.name,
      component: this.component,
      children: this.renderChildren(data),
    }
    let { attrs, directives } = this
    if (attrs) {
      options.attrs = this.renderChildren(data, attrs)
    }
    if (directives) {
      options.directives = this.renderChildren(data, directives)
    }
    return new Element(options)
  }

}
