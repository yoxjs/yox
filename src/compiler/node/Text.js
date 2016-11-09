
import {
  TEXT,
} from '../nodeType'

import Node from './Node'

import {
  FALSE,
} from '../../config/env'


/**
 * 文本节点
 *
 * @param {string} content
 */
module.exports = class Text extends Node {

  constructor(content) {
    super(FALSE)
    this.type = TEXT
    this.content = content
  }

  render(parent, context, keys) {
    let node = new Text(this.content)
    node.keypath = keys.join('.')
    parent.addChild(node)
  }

}
