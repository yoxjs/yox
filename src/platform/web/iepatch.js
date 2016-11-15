
import * as env from '../../config/env'
import * as object from '../../util/object'

function bindInput(element, listener) {
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
  element.attachEvent('onpropertychange', listener.$listener)
}

function unbindInput(element, listener) {
  element.detachEvent('onpropertychange', listener.$listener)
  delete listener.$listener
}

export function addListener(element, type, listener) {
  if (type === 'input') {
    bindInput(element, listener)
  }
  else {
    element.attachEvent(`on${type}`, listener)
  }
}

export function removeListener(element, type, listener) {
  if (type === 'input') {
    unbindInput(element, listener)
  }
  else {
    element.detachEvent(`on${type}`, listener)
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

export function createEvent(nativeEvent, element) {
  return new IEEvent(nativeEvent, element)
}

export function findElement(selector, context) {
  if (!context) {
    context = env.doc
  }
  return context.querySelector(selector)
}
