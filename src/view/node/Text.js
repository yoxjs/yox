
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from 'yox-common/util/env'
import * as object from 'yox-common/util/object'
import * as keypathUtil from 'yox-common/util/keypath'

/**
 * 文本节点
 *
 * @param {*} content
 * @param {boolean} safe 是否安全渲染，即是否转义
 */
export default class Text extends Node {

  constructor(options) {
    super(nodeType.TEXT, env.FALSE)
    object.extend(this, options)
  }

  render(data) {
    return new Text({
      content: this.content,
      safe: this.safe,
      keypath: keypathUtil.stringify(data.keys),
    })
  }

}
