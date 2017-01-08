
import toString from 'yox-common/function/toString'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as logger from 'yox-common/util/logger'

import event from './event'

const inputControl = {
  set({ el, keypath, instance }) {
    let value = toString(instance.get(keypath))
    if (value !== el.value) {
      el.value = value
    }
  },
  sync({ el, keypath, instance }) {
    instance.set(keypath, el.value)
  }
}

const radioControl = {
  set({ el, keypath, instance }) {
    el.checked = el.value === toString(instance.get(keypath))
  },
  sync({ el, keypath, instance }) {
    if (el.checked) {
      instance.set(keypath, el.value)
    }
  }
}

const checkboxControl = {
  set({ el, keypath, instance }) {
    let value = instance.get(keypath)
    el.checked = is.array(value)
      ? array.has(value, el.value, env.FALSE)
      : (is.boolean(value) ? value : !!value)
  },
  sync({ el, keypath, instance }) {
    let value = instance.get(keypath)
    if (is.array(value)) {
      if (el.checked) {
        array.push(value, el.value)
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

export default function ({ el, node, instance, directives, attributes }) {

  let { value, keypath } = node

  let result = instance.get(value, keypath)
  if (result) {
    keypath = result.keypath
  }
  else {
    logger.error(`The ${keypath} being used for two-way binding is ambiguous.`)
    return
  }

  let type = 'change'
  let control = specialControls[ el.type ]
  if (!control) {
    control = inputControl
    if ('oninput' in el) {
      type = 'input'
    }
  }

  let data = {
    el,
    keypath,
    instance,
  }

  let set = function () {
    control.set(data)
  }

  if (!object.has(attributes, 'value')) {
    set()
  }

  instance.watch(keypath, set)

  return event({
    el,
    node,
    instance,
    directives,
    type,
    listener() {
      control.sync(data)
    }
  })

}
