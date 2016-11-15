
import * as env from '../../config/env'

export function addListener(element, type, listener) {
  element.addEventListener(type, listener, env.FALSE)
}

export function removeListener(element, type, listener) {
  element.removeEventListener(type, listener, env.FALSE)
}

export function createEvent(event) {
  return event
}

export function findElement(selector, context) {
  if (!context) {
    context = env.doc
  }
  return context.querySelector(selector)
}
