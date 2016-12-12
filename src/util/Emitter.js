
import * as env from '../config/env'

import execute from '../function/execute'

import * as is from './is'
import * as array from './array'
import * as object from './object'

import Event from './Event'

export default class Emitter {

  constructor(options) {
    object.extend(this, options)
    this.listeners = { }
  }

  on(type, listener) {

    let { listeners, onAdd } = this
    let added = [ ]

    let addListener = function (listener, type) {
      if (is.func(listener)) {
        let list = listeners[type] || (listeners[type] = [ ])
        if (!list.length) {
          added.push(type)
        }
        list.push(listener)
      }
    }

    if (is.object(type)) {
      object.each(type, addListener)
    }
    else if (is.string(type)) {
      addListener(listener, type)
    }

    if (added.length && is.func(onAdd)) {
      onAdd(added)
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

    let { listeners, onRemove } = this
    let removed = [ ]

    if (type == env.NULL) {
      object.each(
        listeners,
        function (list, type) {
          if (is.array(listeners[type])) {
            listeners[type].length = 0
            removed.push(type)
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
        if (!list.length) {
          removed.push(type)
        }
      }
    }

    if (removed.length && is.func(onRemove)) {
      onRemove(removed)
    }

  }

  fire(type, data, context) {

    if (arguments.length === 2) {
      context = env.NULL
    }

    let done = env.TRUE
    let handle = function (list, data) {
      if (is.array(list)) {
        array.each(
          list,
          function (listener) {
            let result = execute(listener, context, data)

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
              return done = env.FALSE
            }
          }
        )
      }
    }

    let { listeners } = this
    handle(listeners[type], data)

    // user.* 能响应 user.name
    // *.* 能响应 user.name
    // * 能响应 user.name
    if (done) {
      object.each(
        listeners,
        function (list, key) {
          if (key !== type || key.indexOf('*') >= 0) {
            key = [
              '^',
              key.replace(/\*\*?/g, '(\\w+)').replace(/\./g, '\\.'),
              key.endsWith('**') ? '' : '$'
            ]
            let match = type.match(
              new RegExp(key.join(''))
            )
            if (match) {
              handle(
                list,
                array.merge(data, array.toArray(match).slice(1))
              )
            }
            return done
          }
        }
      )
    }

    return done

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
