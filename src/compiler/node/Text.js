
import Node from './Node'

import * as env from '../../config/env'
import * as nodeType from '../nodeType'

/**
 * 文本节点
 *
 * @param {*} content
 */
export default class Text extends Node {

  constructor(content) {
    super(nodeType.TEXT, env.FALSE)
    this.content = content
  }

  render(data) {
    let node = new Text(this.content)
    node.keypath = data.keys.join('.')
    data.parent.addChild(node)
  }

}
