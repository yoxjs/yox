
import * as env from '../config/env'

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import * as logger from '../util/logger'
import * as component from '../util/component'

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

  attach: function ({ el, node, instance, directives, attrs }) {

    let { keypath } = node

    let result = component.testKeypath(instance, keypath, node.getValue())
    if (result) {
      keypath = result.keypath
    }
    else {
      logger.error(`The ${keypath} being used for two-way binding is ambiguous.`)
    }

    let name = 'change', control

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
    }

    let data = {
      el,
      keypath,
      instance,
    }

    let set = function () {
      control.set(data)
    }

    instance.watch(
      keypath,
      set
    )

    if (control !== componentControl
      && !object.has(attrs, 'value')
    ) {
      set()
    }

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
