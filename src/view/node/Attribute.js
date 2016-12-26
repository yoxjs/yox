
import Node from './Node'
import * as nodeType from '../nodeType'

import * as object from 'yox-common/util/object'
import * as keypathUtil from 'yox-common/util/keypath'

/**
 * 属性节点
 *
 * @param {string|Expression} name 属性名
 * @param {?*} value 属性值
 */
export default class Attribute extends Node {

  constructor(options) {
    super(nodeType.ATTRIBUTE, !object.has(options, 'value'))
    object.extend(this, options)
  }

  render(data) {

    let { name } = this
    if (name.type === nodeType.EXPRESSION) {
      let { value } = name.renderExpression(data)
      name = value
    }

    return new Attribute({
      name,
      value: this.renderTexts(data),
      keypath: keypathUtil.stringify(data.keys),
    })

  }

}
