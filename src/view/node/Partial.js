
import Node from './Node'
import * as nodeType from '../nodeType'

import * as object from 'yox-common/util/object'

/**
 * partial 节点
 *
 * @param {string} name
 */
export default class Partial extends Node {

  constructor(options) {
    super(nodeType.PARTIAL)
    object.extend(this, options)
  }

  render(data) {
    data.partial(this.name, this.children[0])
    return this.renderChildren(data)
  }

}
