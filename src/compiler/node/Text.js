
import Node from './Node'

import * as env from '../../config/env'
import * as nodeType from '../nodeType'

/**
 * 文本节点
 *
 * @param {*} content
 */
module.exports = class Text extends Node {

  constructor(content) {
    super(env.FALSE)
    this.type = nodeType.TEXT
    this.content = content
  }

  render(data) {
    let node = new Text(this.content)
    node.keypath = data.keys.join('.')
    data.parent.addChild(node)
  }

}
