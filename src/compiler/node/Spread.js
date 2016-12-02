
import Node from './Node'
import Attribute from './Attribute'
import Text from './Text'

import * as env from '../../config/env'
import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as object from '../../util/object'

/**
 * 延展操作 节点
 *
 * @param {Expression} expr
 */
export default class Spread extends Node {

  constructor(expr) {
    super(nodeType.SPREAD, env.FALSE)
    this.expr = expr
  }

  render(data) {
    let { context, parent } = data
    let target = this.execute(context)
    if (!is.object(target)) {
      return
    }

    let node

    object.each(
      target,
      function (value, key) {
        node = new Attribute(key)
        node.addChild(new Text(value))
        parent.addAttr(node)
      }
    )
  }

}
