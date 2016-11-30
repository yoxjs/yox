
import * as env from '../config/env'

import * as is from './is'
import * as array from './array'
import * as object from './object'

import Event from './Event'

export default class Emitter {

  constructor() {
    this.listeners = { }
  }

  on(type, listener) {

    let { listeners } = this
    let addListener = function (listener, type) {
      if (is.func(listener)) {
        let list = listeners[type] || (listeners[type] = [ ])
        list.push(listener)
      }
    }

    if (is.object(type)) {
      object.each(type, addListener)
    }
    else if (is.string(type)) {
      addListener(listener, type)
    }

  }

  once(type, listener) {

    let instance = this
    let addOnce = function (listener, type) {
      if (is.func(listener)) {
        listener.$once = function () {
          instance.off(type, listener)
          delete listener.$once
        }
      }
    }

    if (is.object(type)) {
      object.each(type, addOnce)
    }
    else if (is.string(type)) {
      addOnce(listener, type)
    }

    instance.on(type, listener)

  }

  off(type, listener) {
    let { listeners } = this
    if (type == env.NULL) {
      object.each(
        listeners,
        function (list, type) {
          if (is.array(listeners[type])) {
            listeners[type].length = 0
          }
        }
      )
    }
    else {
      let list = listeners[type]
      if (is.array(list)) {
        if (listener == env.NULL) {
          list.length = 0
        }
        else {
          array.remove(list, listener)
        }
      }
    }
  }

  fire(type, data, context) {

    if (arguments.length === 2) {
      context = env.NULL
    }

    let list = this.listeners[type], isStoped

    if (is.array(list)) {
      array.each(
        list,
        function (listener) {
          let result
          if (is.array(data)) {
            result = listener.apply(context, data)
          }
          else {
            result = data != env.NULL
              ? listener.call(context, data)
              : listener.call(context)
          }
          let { $once } = listener
          if (is.func($once)) {
            $once()
          }

          // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
          if (data instanceof Event) {
            if (result === env.FALSE) {
              data.prevent()
              data.stop()
            }
            else if (data.isStoped) {
              result = env.FALSE
            }
          }

          if (result === env.FALSE) {
            isStoped = env.TRUE
            return result
          }
        }
      )
    }

    return isStoped ? env.FALSE : env.TRUE

  }

  has(type, listener) {
    let list = this.listeners[type]
    if (listener == env.NULL) {
      // 是否注册过 type 事件
      return is.array(list) && list.length > 0
    }
    return is.array(list)
      ? array.has(list, listener)
      : env.FALSE
  }
}
