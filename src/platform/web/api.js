
import * as domApi from 'yox-snabbdom/htmldomapi'

import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'

import Event from 'yox-common/util/Event'
import Emitter from 'yox-common/util/Emitter'

let api = object.copy(domApi)

import * as oldApi from './oldApi'

if (!env.doc.addEventListener) {
  object.extend(api, oldApi)
}

let { on, off } = api

let specials = {
  input(el, listener) {
    let locked = env.FALSE
    on(el, 'compositionstart', function () {
      locked = env.TRUE
    })
    on(el, 'compositionend', function (e) {
      locked = env.FALSE
      listener(e, 'input')
    })
    on(el, 'input', function (e) {
      if (!locked) {
        listener(e)
      }
    })
  }
}

/**
 * 绑定事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 * @param {?*} context
 */
api.on =  function (element, type, listener, context) {
  let $emitter = element.$emitter || (element.$emitter = new Emitter())
  if (!$emitter.has(type)) {
    let nativeListener = function (e, type) {
      if (!Event.is(e)) {
        e = new Event(api.createEvent(e, element))
      }
      if (type) {
        e.type = type
      }
      $emitter.fire(e.type, e, context)
    }
    $emitter[ type ] = nativeListener
    if (specials[ type ]) {
      specials[ type ](element, nativeListener)
    }
    else {
      on(element, type, nativeListener)
    }
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
api.off =  function (element, type, listener) {
  let { $emitter } = element
  let types = object.keys($emitter.listeners)
  // emitter 会根据 type 和 listener 参数进行适当的删除
  $emitter.off(type, listener)
  // 根据 emitter 的删除结果来操作这里的事件 listener
  array.each(
    types,
    function (type) {
      if ($emitter[ type ] && !$emitter.has(type)) {
        off(element, type, $emitter[ type ])
        delete $emitter[ type ]
      }
    }
  )
}

export default api
