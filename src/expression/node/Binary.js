
import Node from './Node'
import * as nodeType from '../nodeType'

import * as object from '../../util/object'

/**
 * Binary 节点
 *
 * @param {Node} right
 * @param {string} operator
 * @param {Node} left
 */
export default class Binary extends Node {

  constructor(right, operator, left) {
    super(nodeType.BINARY)
    this.right = right
    this.operator = operator
    this.left = left
  }

  stringify() {
    let { right, operator, left } = this
    return `(${left.stringify()}) ${operator} (${right.stringify()})`
  }

  execute(context) {
    let { right, operator, left } = this
    left = left.execute(context)
    right = right.execute(context)

    let value
    switch (operator) {
      case Binary.OR:
        value = left.value || right.value
        break
      case Binary.AND:
        value = left.value && right.value
        break
      case Binary.SE:
        value = left.value === right.value
        break
      case Binary.SNE:
        value = left.value !== right.value
        break
      case Binary.LE:
        value = left.value == right.value
        break
      case Binary.LNE:
        value = left.value != right.value
        break
      case Binary.GT:
        value = left.value > right.value
        break
      case Binary.LT:
        value = left.value < right.value
        break
      case Binary.GTE:
        value = left.value >= right.value
        break
      case Binary.LTE:
        value = left.value <= right.value
        break
      case Binary.PLUS:
        value = left.value + right.value
        break
      case Binary.MINUS:
        value = left.value - right.value
        break
      case Binary.MULTIPLY:
        value = left.value * right.value
        break
      case Binary.DIVIDE:
        value = left.value / right.value
        break
      case Binary.MODULO:
        value = left.value % right.value
        break
    }

    return {
      value,
      deps: object.extend(left.deps, right.deps),
    }
  }

}

Binary.OR = '||'
Binary.AND = '&&'
// Strict equality
Binary.SE = '==='
// Strict not equality
Binary.SNE = '!=='
// Loose equality
Binary.LE = '=='
// Loose not equality
Binary.LNE = '!='
Binary.GT = '>'
Binary.LT = '<'
Binary.GTE = '>='
Binary.LTE = '<='
Binary.PLUS = '+'
Binary.MINUS = '-'
Binary.MULTIPLY = '*'
Binary.DIVIDE = '/'
Binary.MODULO = '%'
