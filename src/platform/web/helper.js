
import * as env from '../../config/env'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as object from '../../util/object'

import Event from '../../util/Event'
import Emitter from '../../util/Emitter'
import camelCase from '../../function/camelCase'

export function nativeAddEventListener(element, type, listener) {
  element.addEventListener(type, listener, env.FALSE)
}

export function nativeRemoveEventListener(element, type, listener) {
  element.removeEventListener(type, listener, env.FALSE)
}

export function createEvent(nativeEvent) {
  return nativeEvent
}

/**
 * 通过选择器查找元素
 *
 * @param {string} selector
 * @param {?HTMLElement} context
 * @return {?HTMLElement}
 */
export function find(selector, context) {
  if (!context) {
    context = env.doc
  }
  return context.querySelector(selector)
}

/**
 * 绑定事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 */
export function on(element, type, listener) {
  let $emitter = element.$emitter || (element.$emitter = new Emitter())
  if (!$emitter.has(type)) {
    let nativeListener = function (e) {
      e = new Event(createEvent(e, element))
      $emitter.fire(e.type, e)
    }
    $emitter[type] = nativeListener
    nativeAddEventListener(element, type, nativeListener)
  }
  $emitter.on(type, listener)
}

/**
 * 解绑事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 */
export function off(element, type, listener) {
  let { $emitter } = element
  let types = object.keys($emitter.listeners)
  // emitter 会根据 type 和 listener 参数进行适当的删除
  $emitter.off(type, listener)
  // 根据 emitter 的删除结果来操作这里的事件 listener
  array.each(
    types,
    function (type) {
      if ($emitter[type] && !$emitter.has(type)) {
        nativeRemoveEventListener(element, type, $emitter[type])
        delete $emitter[type]
      }
    }
  )
}

/**
 * 把 style-name: value 解析成对象的形式
 *
 * @param {string} str
 * @return {Object}
 */
export function parseStyle(str) {
  let result = { }

  if (is.string(str)) {
    let pairs, name, value

    array.each(
      str.split(';'),
      function (term) {
        if (term && term.trim()) {
          pairs = term.split(':')
          if (pairs.length === 2) {
            name = pairs[0].trim()
            value = pairs[1].trim()
            if (name) {
              result[camelCase(name)] = value
            }
          }
        }
      }
    )
  }

  return result
}
