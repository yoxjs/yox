
import Node from './Node'
import * as nodeType from '../nodeType'

import around from '../../function/around'

/**
 * Unary 节点
 *
 * @param {string} operator
 * @param {Node} arg
 */
export default class Unary extends Node {

  constructor(operator, arg) {
    super(nodeType.UNARY)
    this.operator = operator
    this.arg = arg
  }

  stringify() {
    let { operator, arg } = this
    return `${operator}${arg.stringify()}`
  }

  traverse(enter, leave) {
    around(
      this,
      function (node) {
        let { arg } = node
        arg.traverse(enter, leave)
      },
      enter,
      leave
    )
  }

  run(data) {
    let { operator, arg } = this
    let result = arg.run(data)
    switch (operator) {
      case Unary.PLUS:
        result.value = +result.value
        break
      case Unary.MINUS:
        result.value = -result.value
        break
      case Unary.BANG:
        result.value = !result.value
        break
      case Unary.WAVE:
        result.value = ~result.value
        break
    }
    return result
  }

}

Unary.PLUS = '+'
Unary.MINUS = '-'
Unary.BANG = '!'
Unary.WAVE = '~'
