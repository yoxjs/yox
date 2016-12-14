
import * as env from '../../config/env'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as object from '../../util/object'

import Event from '../../util/Event'
import Emitter from '../../util/Emitter'

import * as native from './nativeModern'

export let find = native.findElement

export function create(parent, tagName) {
  parent.innerHTML = `<${tagName}></${tagName}>`
  return parent.firstChild
}

export function getContent(selector) {
  return find(selector).innerHTML
}

export function isElement(node) {
  return node.nodeType === 1
}

/**
 * 绑定事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 * @param {?*} context
 */
export function on(element, type, listener, context) {
  let $emitter = element.$emitter || (element.$emitter = new Emitter())
  if (!$emitter.has(type)) {
    let nativeListener = function (e) {
      e = new Event(native.createEvent(e, element))
      $emitter.fire(e.type, e, context)
    }
    $emitter[type] = nativeListener
    native.addListener(element, type, nativeListener)
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
        native.removeListener(element, type, $emitter[type])
        delete $emitter[type]
      }
    }
  )
}
