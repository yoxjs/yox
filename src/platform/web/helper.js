
import {
  doc,
  FALSE,
} from '../../config/env'

import {
  Event,
  Emitter,
} from '../../util/event'

import {
  each,
} from '../../util/array'

import {
  keys,
} from '../../util/object'

import {
  isString,
} from '../../util/is'

import camelCase from '../../function/camelCase'

export function nativeAddEventListener(element, type, listener) {
  element.addEventListener(type, listener, FALSE)
}

export function nativeRemoveEventListener(element, type, listener) {
  element.removeEventListener(type, listener, FALSE)
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
export function find(selector, context = doc) {
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
      let event = new Event(createEvent(e, element))
      $emitter.fire(event.type, event)
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
  let types = keys($emitter.listeners)
  // emitter 会根据 type 和 listener 参数进行适当的删除
  $emitter.off(type, listener)
  // 根据 emitter 的删除结果来操作这里的事件 listener
  each(
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

  if (isString(str)) {
    let pairs, name, value

    each(
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
