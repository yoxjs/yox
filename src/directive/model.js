
import * as env from '../config/env'

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import * as logger from '../util/logger'
import * as component from '../util/component'

import event from './event'

const supportInputControls = [ 'text', 'number', 'password', 'tel', 'url', 'email', 'search' ]

const normalControl = {
  set: function ({ el, keypath, instance }) {
    el.value = instance.get(keypath)
  },
  update: function ({ el, keypath, instance }) {
    instance.set(keypath, el.value)
  }
}

const radioControl = {
  set: function ({ el, keypath, instance }) {
    el.checked = el.value == instance.get(keypath)
  },
  update: function ({ el, keypath, instance }) {
    if (el.checked) {
      instance.set(keypath, el.value)
    }
  }
}

const checkboxControl = {
  set: function ({ el, keypath, instance }) {
    let value = instance.get(keypath)
    el.checked = is.array(value)
      ? array.has(value, el.value, env.FALSE)
      : !!value
  },
  update: function ({ el, keypath, instance }) {
    let value = instance.get(keypath)
    if (is.array(value)) {
      if (el.checked) {
        value.push(el.value)
      }
      else {
        array.remove(value, el.value, env.FALSE)
      }
      instance.set(keypath, object.copy(value))
    }
    else {
      instance.set(keypath, el.checked)
    }
  }
}

const specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
}

export default {

  attach: function ({ el, node, instance, directives }) {

    let name = 'change'

    let { type, tagName } = el
    if (tagName === 'INPUT' && array.has(supportInputControls, type)
      || tagName === 'TEXTAREA'
    ) {
      name = 'input'
    }

    let { keypath } = node

    let value = node.getValue()
    let result = component.testKeypath(instance, keypath, value)
    if (!result) {
      logger.error(`The ${keypath} being used for two-way binding is ambiguous.`)
    }

    keypath = result.keypath

    let data = {
      el,
      keypath,
      instance,
    }

    let control = specialControls[type] || normalControl
    let set = function () {
      control.set(data)
    }
    let listener = function () {
      control.update(data)
    }


    set()

    instance.watch(
      keypath,
      set
    )

    event.attach({
      el,
      node,
      name,
      instance,
      directives,
      listener,
    })

  },

  detach: function ({ el }) {
    event.detach({ el })
  }

}
