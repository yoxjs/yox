
import Node from './Node'
import Text from './Text'

import * as nodeType from '../nodeType'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as object from 'yox-common/util/object'
import * as keypathUtil from 'yox-common/util/keypath'

/**
 * 表达式节点
 *
 * @param {string} expr
 * @param {boolean} safe
 */
export default class Expression extends Node {

  constructor(options) {
    super(nodeType.EXPRESSION, env.FALSE)
    object.extend(this, options)
  }

  render(data) {

    let { value } = this.renderExpression(data)
    if (value == env.NULL) {
      value = ''
    }
    else if (is.func(value) && value.$computed) {
      value = value()
    }

    return new Text({
      content: value,
      safe: this.safe,
      keypath: keypathUtil.stringify(data.keys),
    })

  }

}
