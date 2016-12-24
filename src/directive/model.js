
import * as env from '../config/env'

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import * as logger from '../util/logger'

import event from './event'

const componentControl = {
  set: function ({ el, keypath, instance }) {
    let { $component } = el
    $component.set('value', instance.get(keypath))
  },
  update: function ({ el, keypath, instance }) {
    let { $component } = el
    instance.set(keypath, $component.get('value'))
  }
}

const inputControl = {
  set: function ({ el, keypath, instance }) {
    let value = instance.get(keypath)
    // 如果输入框的值相同，赋值会导致光标变化，不符合用户体验
    if (value !== el.value) {
      el.value = value
    }
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

  attach: function ({ el, node, instance, directives, attrs }) {

    let { value, keypath } = node

    let result = instance.get(value, keypath)
    if (result) {
      keypath = result.keypath
    }
    else {
      logger.error(`The ${keypath} being used for two-way binding is ambiguous.`)
    }

    let name = 'change', control, needSet

    let { type, $component } = el
    if ($component) {
      control = componentControl
    }
    else {
      control = specialControls[type]
      if (!control) {
        control = inputControl
        if ('oninput' in el) {
          name = 'input'
        }
      }
      if (!object.has(attrs, 'value')) {
        needSet = env.TRUE
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

    if (needSet) {
      set()
    }

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
      listener: function () {
        control.update(data)
      }
    })

  },

  detach: function ({ el }) {
    event.detach({ el })
  }

}
