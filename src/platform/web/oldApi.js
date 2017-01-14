
import execute from 'yox-common/function/execute'

import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'

Object.keys = function (obj) {
  let result = [ ]
  for (let key in obj) {
    array.push(result, key)
  }
  return result
}

Object.freeze = function (obj) {
  return obj
}
Object.defineProperty = function (obj, key, descriptor) {
  obj[ key ] = descriptor.value
}
Object.create = function (proto) {
  function Class() { }
  Class.prototype = proto
  return new Class()
}
String.prototype.trim = function () {
  return this.replace(/^\s*|\s*$/g, '')
}

Array.prototype.indexOf = function (target) {
  let result = -1
  array.each(
    this,
    function (item, index) {
      if (item === target) {
        result = index
        return env.FALSE
      }
    }
  )
  return result
}

Array.prototype.map = function (fn) {
  let result = [ ]
  array.each(
    this,
    function (item, index) {
      result.push(fn(item, index))
    }
  )
  return result
}

Array.prototype.filter = function (fn) {
  let result = [ ]
  array.each(
    this,
    function (item, index) {
      if (fn(item, index)) {
        result.push(item)
      }
    }
  )
  return result
}

Function.prototype.bind = function (context) {
  let fn = this
  return function () {
    return execute(
      fn,
      context,
      array.toArray(arguments)
    )
  }
}

class IEEvent {

  constructor(event, element) {

    // object.extend(this, event)

    this.currentTarget = element
    this.target = event.srcElement || element
    this.originalEvent = event

  }

  preventDefault() {
    this.originalEvent.returnValue = env.FALSE
  }

  stopPropagation() {
    this.originalEvent.cancelBubble = env.TRUE
  }

}

function addInputListener(element, listener) {
  let oldValue = element.value
  listener.$listener = function (e) {
    if (e.originalEvent.originalEvent.propertyName === 'value') {
      let newValue = element.value
      if (newValue !== oldValue) {
        let result = listener.apply(this, arguments)
        oldValue = newValue
        return result
      }
    }
  }
  on(element, 'propertychange', listener.$listener)
}

function removeInputListener(element, listener) {
  off(element, 'propertychange', listener.$listener)
  delete listener.$listener
}

export function on(element, type, listener) {
  if (type === 'input') {
    addInputListener(element, listener)
  }
  else {
    element.attachEvent(`on${type}`, listener)
  }
}

export function off(element, type, listener) {
  if (type === 'input') {
    removeInputListener(element, listener)
  }
  else {
    element.detachEvent(`on${type}`, listener)
  }
}

export function createEvent(event, element) {
  return new IEEvent(event, element)
}
