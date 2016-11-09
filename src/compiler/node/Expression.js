
import {
  EXPRESSION,
} from '../nodeType'

import Node from './Node'
import Text from './Text'

import * as pattern from '../../config/pattern'

import {
  NULL,
  FALSE,
} from '../../config/env'

import {
  each,
} from '../../util/array'

import {
  isString,
  isFunction,
} from '../../util/is'

/**
 * 表达式节点
 *
 * @param {string} expr
 * @param {boolean} safe
 */
module.exports = class Expression extends Node {

  constructor(expr, safe) {
    super(FALSE)
    this.type = EXPRESSION
    this.expr = expr
    this.safe = safe
  }

  render(parent, context, keys, parseTemplate) {

    let content = this.execute(context)
    if (content == NULL) {
      content = ''
    }

    if (isFunction(content) && content.computed) {
      content = content()
    }

    // 处理需要不转义的
    if (!this.safe && isString(content) && pattern.tag.test(content)) {
      each(
        parseTemplate(content),
        function (node) {
          node.render(parent, context, keys, parseTemplate)
        }
      )
    }
    else {
      let node = new Text(content)
      node.render(parent, context, keys)
    }

  }

}
