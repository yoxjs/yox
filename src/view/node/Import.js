
import Node from './Node'
import * as nodeType from '../nodeType'

import * as env from 'yox-common/util/env'
import * as object from 'yox-common/util/object'

/**
 * import 节点
 *
 * @param {string} name
 */
export default class Import extends Node {

  constructor(options) {
    super(nodeType.IMPORT, env.FALSE)
    object.extend(this, options)
  }

  render(data) {
    return data.partial(this.name).render(data)
  }

}
