
import Node from './Node'
import Attribute from './Attribute'

import * as nodeType from '../nodeType'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as object from 'yox-common/util/object'
import * as keypathUtil from 'yox-common/util/keypath'

/**
 * 延展操作 节点
 *
 * @param {Expression} expr
 */
export default class Spread extends Node {

  constructor(options) {
    super(nodeType.SPREAD, env.FALSE)
    object.extend(this, options)
  }

  render(data) {
    let { value } = this.renderExpression(data)
    if (is.object(value)) {
      let result = [ ], keypath = keypathUtil.stringify(data.keys)
      object.each(
        value,
        function (value, name) {
          result.push(
            new Attribute({
              name,
              value,
              keypath,
            })
          )
        }
      )
      return result
    }
  }

}
