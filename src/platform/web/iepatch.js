
import {
  TRUE,
  FALSE,
} from '../../config/env'

import {
  extend,
} from '../../util/object'

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

export function nativeAddEventListener(element, type, listener) {
  if (type === 'input') {
    bindInput(element, listener)
  }
  else {
    element.attachEvent(`on${type}`, listener)
  }
}

export function nativeRemoveEventListener(element, type, listener) {
  if (type === 'input') {
    unbindInput(element, listener)
  }
  else {
    element.detachEvent(`on${type}`, listener)
  }
}

class IEEvent {

  constructor(event, element) {

    extend(this, event)

    this.currentTarget = element
    this.target = event.srcElement || element
    this.originalEvent = event

  }

  preventDefault() {
    this.originalEvent.returnValue = FALSE
  }

  stopPropagation() {
    this.originalEvent.cancelBubble = TRUE
  }

}

export function createEvent(nativeEvent, element) {
  return new IEEvent(nativeEvent, element)
}
