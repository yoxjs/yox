
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'

import Event from 'yox-common/util/Event'
import Emitter from 'yox-common/util/Emitter'

import api from './api'

export const find = api.find
export const isElement = api.isElement

export function create(tagName, parentNode) {
  if (parentNode) {
    api.html(parentNode, `<${tagName}></${tagName}>`)
    return api.children(parentNode)[ 0 ]
  }
  return api.createElement(tagName)
}

export function getContent(selector) {
  return api.find(selector).innerHTML
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
      if (!(e instanceof Event)) {
        e = new Event(api.createEvent(e, element))
      }
      $emitter.fire(e.type, e, context)
    }
    $emitter[ type ] = nativeListener
    api.on(element, type, nativeListener)
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
      if ($emitter[ type ] && !$emitter.has(type)) {
        api.off(element, type, $emitter[ type ])
        delete $emitter[ type ]
      }
    }
  )
}
