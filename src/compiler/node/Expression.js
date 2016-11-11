
import Node from './Node'
import Text from './Text'

import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as env from '../../config/env'
import * as array from '../../util/array'
import * as pattern from '../../config/pattern'

/**
 * 表达式节点
 *
 * @param {string} expr
 * @param {boolean} safe
 */
export default class Expression extends Node {

  constructor(expr, safe) {
    super(env.FALSE)
    this.type = nodeType.EXPRESSION
    this.expr = expr
    this.safe = safe
  }

  render(data) {

    let content = this.execute(data.context)
    if (content == env.NULL) {
      content = ''
    }

    if (is.func(content) && content.computed) {
      content = content()
    }

    // 处理需要不转义的
    if (!this.safe && is.string(content) && pattern.tag.test(content)) {
      array.each(
        data.parse(content),
        function (node) {
          node.render(data)
        }
      )
    }
    else {
      let node = new Text(content)
      node.render(data)
    }

  }

}
