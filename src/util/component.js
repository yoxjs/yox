
import {
  NULL,
} from '../config/env'

import * as logger from '../config/logger'
import * as syntax from '../config/syntax'

import {
  get as objectGet,
  has,
  copy,
} from './object'

import {
  CALL,
  MEMBER,
  LITERAL,
  IDENTIFIER,
  parse,
} from './expression'

import {
  Event,
} from './event'

import {
  stringify,
} from './keypath'

import * as registry from '../config/registry'

export function compileAttr(instance, keypath, value) {
  if (value.indexOf('(') > 0) {
    let ast = parse(value)
    if (ast.type === CALL) {
      return function (event) {
        let isEvent = event instanceof Event
        let args = copy(ast.arguments)
        if (!args.length) {
          if (isEvent) {
            args.push(event)
          }
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
                  if (isEvent) {
                    return event
                  }
                }
                else if (name === syntax.SPECIAL_KEYPATH) {
                  return keypath
                }
              }
              else if (type === MEMBER) {
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
    return function () {
      instance.fire(value, arguments)
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
    result = objectGet(data, keypath)
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

export function get(instance, type, name) {
  let prop = `$${type}s`
  if (instance[prop] && has(instance[prop], name)) {
    return instance[prop][name]
  }
  else {
    let value = registry[type].get(name)
    if (value) {
      return value
    }
    else {
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
