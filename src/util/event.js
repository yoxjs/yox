
import {
  TRUE,
  FALSE,
  NULL,
} from '../config/env'

import {
  isArray,
  isString,
  isFunction,
} from './is'

import {
  each,
  hasItem,
  removeItem,
} from './array'

import {
  each as objectEach
} from './object'

export class Event {

  constructor(event) {
    if (event.type) {
      this.type = event.type
      this.originalEvent = event
    }
    else {
      this.type = event
    }
  }

  prevent() {
    if (!this.isPrevented) {
      let { originalEvent } = this
      if (originalEvent && isFunction(originalEvent.preventDefault)) {
        originalEvent.preventDefault()
      }
      this.isPrevented = TRUE
    }
  }

  stop() {
    if (!this.isStoped) {
      let { originalEvent } = this
      if (originalEvent && isFunction(originalEvent.stopPropagation)) {
        originalEvent.stopPropagation()
      }
      this.isStoped = TRUE
    }
  }

}

export class Emitter {

  constructor() {
    this.listeners = { }
  }

  on(type, listener) {
    let { listeners } = this
    let list = listeners[type] || (listeners[type] = [])
    list.push(listener)
  }

  once(type, listener) {
    let instance = this
    listener.$once = function () {
      instance.off(type, listener)
      delete listener.$once
    }
    instance.on(type, listener)
  }

  off(type, listener) {
    let { listeners } = this
    if (type == NULL) {
      objectEach(
        listeners,
        function (list, type) {
          if (isArray(listeners[type])) {
            listeners[type].length = 0
          }
        }
      )
    }
    else {
      let list = listeners[type]
      if (isArray(list)) {
        if (listener == NULL) {
          list.length = 0
        }
        else {
          removeItem(list, listener)
        }
      }
    }
  }

  fire(type, data, context = NULL) {

    let list = this.listeners[type], isStoped

    if (isArray(list)) {
      each(
        list,
        function (listener) {
          let result
          if (isArray(data)) {
            result = listener.apply(context, data)
          }
          else {
            result = data != NULL
              ? listener.call(context, data)
              : listener.call(context)
          }
          let { $once } = listener
          if (isFunction($once)) {
            $once()
          }

          // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
          let event = data && data[0]
          if (event && event instanceof Event) {
            if (result === FALSE) {
              event.prevent()
              event.stop()
            }
            else if (event.isStoped) {
              result = FALSE
            }
          }

          if (result === FALSE) {
            isStoped = TRUE
            return result
          }
        }
      )
    }

    return isStoped

  }

  has(type, listener) {
    let list = this.listeners[type]
    if (listener == NULL) {
      // 是否注册过 type 事件
      return isArray(list) && list.length > 0
    }
    return isArray(list)
      ? hasItem(list, listener)
      : FALSE
  }
}
