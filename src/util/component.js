
import * as env from '../config/env'
import * as syntax from '../config/syntax'
import * as registry from '../config/registry'

import * as object from './object'
import * as logger from './logger'
import * as expression from './expression'

import Event from './Event'

import {
  stringify,
} from './keypath'

export function compileAttr(instance, keypath, value) {
  if (value.indexOf('(') > 0) {
    let ast = expression.parse(value)
    if (ast.type === expression.CALL) {
      return function (e) {
        let isEvent = e instanceof Event
        let args = object.copy(ast.arguments)
        if (!args.length) {
          if (isEvent) {
            args.push(e)
          }
        }
        else {
          args = args.map(
            function (item) {
              let { name, type } = item
              if (type === expression.LITERAL) {
                return item.value
              }
              if (type === expression.IDENTIFIER) {
                if (name === syntax.SPECIAL_EVENT) {
                  if (isEvent) {
                    return e
                  }
                }
                else if (name === syntax.SPECIAL_KEYPATH) {
                  return keypath
                }
              }
              else if (type === expression.MEMBER) {
                name = stringify(item)
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

export function get(instance, type, name, silent) {
  let prop = `$${type}s`
  if (instance[prop] && object.has(instance[prop], name)) {
    return instance[prop][name]
  }
  else {
    let value = registry[type].get(name)
    if (value) {
      return value
    }
    else if (!silent) {
      logger.error(`${name} ${type} is not found.`)
    }
  }
}

export function set(instance, type, name, value) {
  let prop = `$${type}s`
  if (!instance[prop]) {
    instance[prop] = { }
  }
  instance[prop][name] = value
}
