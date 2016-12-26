
import Node from './Node'
import * as nodeType from '../nodeType'

import * as object from 'yox-common/util/object'

/**
 * Conditional 节点
 *
 * @param {Node} test
 * @param {Node} consequent
 * @param {Node} alternate
 */
export default class Conditional extends Node {

  constructor(test, consequent, alternate) {
    super(nodeType.CONDITIONAL)
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
  }

  stringify() {
    let { test, consequent, alternate } = this
    return `(${test.stringify()}) ? (${consequent.stringify()}) : (${alternate.stringify()})`
  }

  execute(context) {
    let { test, consequent, alternate } = this
    test = test.execute(context)
    if (test.value) {
      consequent = consequent.execute(context)
      return {
        value: consequent.value,
        deps: object.extend(test.deps, consequent.deps),
      }
    }
    else {
      alternate = alternate.execute(context)
      return {
        value: alternate.value,
        deps: object.extend(test.deps, alternate.deps),
      }
    }
  }

}
