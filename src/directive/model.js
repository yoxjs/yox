
import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as logger from 'yox-common/util/logger'

import event from './event'

const inputControl = {
  set({ el, keypath, instance }) {
    let value = instance.get(keypath)
    // 如果输入框的值相同，赋值会导致光标变化，不符合用户体验
    if (value !== el.value) {
      el.value = value
    }
  },
  update({ el, keypath, instance }) {
    instance.set(keypath, el.value)
  }
}

const radioControl = {
  set({ el, keypath, instance }) {
    el.checked = el.value == instance.get(keypath)
  },
  update({ el, keypath, instance }) {
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
      : !!value
  },
  update({ el, keypath, instance }) {
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
    return logger.error(`The ${keypath} being used for two-way binding is ambiguous.`)
  }

  let type = 'change', control

  control = specialControls[el.type]
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

  instance.watch(
    keypath,
    set
  )

  return event({
    el,
    node,
    instance,
    directives,
    type,
    listener() {
      control.update(data)
    }
  })

}
