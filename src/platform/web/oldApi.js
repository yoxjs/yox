
import execute from 'yox-common/function/execute'

import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'

import Event from 'yox-common/util/Event'

if (!Object.keys) {
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
  Object.create = function (proto, descriptor) {
    function Class() { }
    Class.prototype = proto
    proto = new Class()
    let constructor = descriptor && descriptor.constructor
    if (constructor) {
      proto.constructor = constructor.value
    }
    return proto
  }
}
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, '')
  }
}
if (!Array.prototype.map) {
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
}
if (!Function.prototype.bind) {
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
}


const clickType = 'click'
const inputType = 'input'
const changeType = 'change'
const propertychangeType = 'propertychange'

class IEEvent {

  constructor(event, element) {

    object.extend(this, event)

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
  listener.$listener = function (e) {
    if (e.propertyName === 'value') {
      e = new Event(e)
      e.type = inputType
      listener.call(this, e)
    }
  }
  on(element, propertychangeType, listener.$listener)
}

function removeInputListener(element, listener) {
  off(element, propertychangeType, listener.$listener)
  delete listener.$listener
}

function addChangeListener(element, listener) {
  listener.$listener = function (e) {
    e = new Event(e)
    e.type = changeType
    listener.call(this, e)
  }
  on(element, clickType, listener.$listener)
}

function removeChangeListener(element, listener) {
  off(element, clickType, listener.$listener)
  delete listener.$listener
}

function isBox(element) {
  return element.tagName === 'INPUT'
    && (element.type === 'radio' || element.type === 'checkbox')
}

export function on(element, type, listener) {
  if (type === inputType) {
    addInputListener(element, listener)
  }
  else if (type === changeType && isBox(element)) {
    addChangeListener(element, listener)
  }
  else {
    element.attachEvent(`on${type}`, listener)
  }
}

export function off(element, type, listener) {
  if (type === inputType) {
    removeInputListener(element, listener)
  }
  else if (type === changeType && isBox(element)) {
    removeChangeListener(element, listener)
  }
  else {
    element.detachEvent(`on${type}`, listener)
  }
}

export function createEvent(event, element) {
  return new IEEvent(event, element)
}

export function find(selector, context) {
  context = context || env.doc
  return context.querySelector
    ? context.querySelector(selector)
    : context.getElementById(string.slice(selector, 1))
}

export function setProp(element, name, value) {
  try {
    element[ name ] = value
  }
  catch (e) {
    if (element.tagName === 'STYLE' && name === 'innerHTML') {
      element.setAttribute('type', 'text/css')
      element.styleSheet.cssText = value;
    }
  }
}
