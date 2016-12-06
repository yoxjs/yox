
import Node from './Node'
import * as nodeType from '../nodeType'

import * as array from '../../util/array'

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
        deps: array.push(test.deps, consequent.deps),
      }
    }
    else {
      alternate = alternate.execute(context)
      return {
        value: alternate.value,
        deps: array.push(test.deps, alternate.deps),
      }
    }
  }

}
