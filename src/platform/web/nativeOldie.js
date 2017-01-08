
import * as env from 'yox-common/util/env'
import * as object from 'yox-common/util/object'

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

function removeInputListener(element, listener) {
  element.detachEvent('onpropertychange', listener.$listener)
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
