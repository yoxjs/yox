
import * as env from '../config/env'
import * as syntax from '../config/syntax'
import * as registry from '../config/registry'

import * as is from './is'
import * as object from './object'
import * as logger from './logger'
import * as expression from './expression'

import Event from './Event'

import {
  stringify,
} from './keypath'

export function compileValue(instance, keypath, value) {
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

/**
 * 获取组件实例上的对象
 *
 * 如果实例上没有，再从全局注册找
 */
export function get(instance, type, name, silent) {
  let result = object.get(instance, `$${type}s.${name}`)
  if (result) {
    return result.value
  }
  else {
    let globalRegistry = registry[type]
    let value = globalRegistry && globalRegistry.get(name)
    if (value) {
      return value
    }
    else if (!silent) {
      logger.error(`${name} ${type} is not found.`)
    }
  }
}

/**
 * 挂在组件实例上的属性，格式如 this.$refs.name = value
 */
export function set(instance, type, name, value) {
  if (is.object(name)) {
    object.set(instance, `$${type}s`, name)
  }
  else if (is.string(name)) {
    object.set(instance, `$${type}s.${name}`, value)
  }
}
