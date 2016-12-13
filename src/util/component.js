
import * as env from '../config/env'
import * as syntax from '../config/syntax'
import * as registry from '../config/registry'

import * as is from './is'
import * as object from './object'
import * as logger from './logger'

import * as expression from '../expression/index'
import * as expressionNodeType from '../expression/nodeType'

import Event from './Event'

export function compileValue(instance, keypath, value) {
  if (value.indexOf('(') > 0) {
    let ast = expression.parse(value)
    if (ast.type === expressionNodeType.CALL) {
      return function (e) {
        let isEvent = e instanceof Event
        let args = object.copy(ast.args)
        if (!args.length) {
          if (isEvent) {
            args.push(e)
          }
        }
        else {
          args = args.map(
            function (item) {
              let { name, type } = item
              if (type === expressionNodeType.LITERAL) {
                return item.value
              }
              if (type === expressionNodeType.IDENTIFIER) {
                if (name === syntax.SPECIAL_EVENT) {
                  if (isEvent) {
                    return e
                  }
                }
                else if (name === syntax.SPECIAL_KEYPATH) {
                  return keypath
                }
              }
              else if (type === expressionNodeType.MEMBER) {
                name = item.stringify()
              }

              let result = testKeypath(instance, keypath, name)
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
    return function (event) {
      instance.fire(value, event)
    }
  }
}

export function testKeypath(instance, keypath, name) {

  let terms = keypath ? keypath.split('.') : [ ]
  if (!name) {
    name = terms.pop()
  }

  let data = instance.$data, result

  do {
    terms.push(name)
    keypath = terms.join('.')
    result = object.get(data, keypath)
    if (result) {
      return {
        keypath,
        value: result.value,
      }
    }
    terms.splice(-2)
  }
  while (terms.length || keypath.indexOf('.') > 0)

}
