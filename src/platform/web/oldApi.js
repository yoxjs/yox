
import execute from 'yox-common/function/execute'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'

import Event from 'yox-common/util/Event'

import * as event from '../../config/event'

if (!Object.keys) {
  Object.keys = function (obj) {
    let result = [ ]
    for (let key in obj) {
      array.push(result, key)
    }
    return result
  }
  Object.create = function (proto, descriptor) {
    function Class() { }
    Class.prototype = proto
    proto = new Class()
    let constructor = descriptor && descriptor.constructor
    if (constructor) {
      proto.constructor = constructor[ env.RAW_VALUE ]
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
  Array.isArray = function (value) {
    return is.is(value, 'array')
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
}

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
      e.type = event.INPUT
      listener.call(this, e)
    }
  }
  on(element, event.PROPERTY_CHANGE, listener.$listener)
}

function removeInputListener(element, listener) {
  off(element, event.PROPERTY_CHANGE, listener.$listener)
  delete listener.$listener
}

function addChangeListener(element, listener) {
  listener.$listener = function (e) {
    e = new Event(e)
    e.type = event.CHANGE
    listener.call(this, e)
  }
  on(element, event.CLICK, listener.$listener)
}

function removeChangeListener(element, listener) {
  off(element, event.CLICK, listener.$listener)
  delete listener.$listener
}

function isBox(element) {
  return element.tagName === 'INPUT'
    && (element.type === 'radio' || element.type === 'checkbox')
}

export function on(element, type, listener) {
  if (type === event.INPUT) {
    addInputListener(element, listener)
  }
  else if (type === event.CHANGE && isBox(element)) {
    addChangeListener(element, listener)
  }
  else {
    element.attachEvent(`on${type}`, listener)
  }
}

export function off(element, type, listener) {
  if (type === event.INPUT) {
    removeInputListener(element, listener)
  }
  else if (type === event.CHANGE && isBox(element)) {
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
    object.set(element, name, value)
  }
  catch (e) {
    if (element.tagName === 'STYLE' && (name === 'innerHTML' || name === 'innerText')) {
      element.setAttribute('type', 'text/css')
      element.styleSheet.cssText = value
    }
  }
}
