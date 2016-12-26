
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from '../../config/env'
import * as keypathUtil from '../../util/keypath'

/**
 * 文本节点
 *
 * @param {*} content
 */
export default class Text extends Node {

  constructor(content, safe = env.TRUE) {
    super(nodeType.TEXT, env.FALSE)
    this.content = content
    this.safe = safe
  }

  render(data) {
    let node = new Text(this.content, this.safe)
    node.keypath = keypathUtil.stringify(data.keys)
    return [ node ]
  }

}
