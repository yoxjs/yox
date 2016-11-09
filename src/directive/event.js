
import {
  on,
  off,
} from '../platform/web/helper'

import {
  NULL,
} from '../config/env'

import {
  each,
  toArray,
} from '../util/array'

import {
  stringify,
} from '../util/keypath'

import {
  testKeypath,
} from '../util/component'

import {
  CALL,
  MEMBER,
  LITERAL,
  IDENTIFIER,
  parse,
} from '../util/expression'

import * as syntax from '../config/syntax'

module.exports = {

  attach: function({ el, name, node, instance }) {

    let listener
    let value = node.getValue().trim()

    if (value.indexOf('(') > 0) {
      let ast = parse(value)
      if (ast.type === CALL) {
        listener = function (e) {
          let args = [
            ...ast.arguments,
          ]
          if (!args.length) {
            args.push(e)
          }
          else {
            args = args.map(
              function (item) {
                let { name, type } = item
                if (type === LITERAL) {
                  return item.value
                }
                if (type === IDENTIFIER) {
                  if (name === syntax.SPECIAL_EVENT) {
                    return e
                  }
                  else if (name === syntax.SPECIAL_KEYPATH) {
                    return node.keypath
                  }
                }
                else if (type === MEMBER) {
                  name = stringify(item)
                }

                let result = testKeypath(instance, node.keypath, name)
                if (result) {
                  return result.value
                }
              }
            )
          }
          instance[ast.callee.name].apply(instance, args)
        }
      }
    }
    else {
      listener = function () {
        let args = arguments
        instance.fire(value, args.length ? toArray(args) : NULL)
      }
    }

    if (listener) {
      let { $component } = el
      if ($component) {
        $component.on(name, listener)
      }
      else {
        on(el, name, listener)
      }
      el[`$${name}`] = listener
    }

  },

  detach: function ({ el, name, node }) {
    let listener = `$${name}`
    if (el[listener]) {
      let { $component } = el
      if ($component) {
        $component.off(name, el[listener])
      }
      else {
        off(el, name, el[listener])
      }
      el[listener] = NULL
    }
  }
}
