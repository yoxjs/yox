
import Node from './Node'
import * as nodeType from '../nodeType'

import * as object from 'yox-common/util/object'

/**
 * if 节点
 *
 * @param {Expression} expr 判断条件
 */
export default class If extends Node {

  constructor(options) {
    super(nodeType.IF)
    object.extend(this, options)
  }

  render(data) {
    return this.renderCondition(data)
  }

}
