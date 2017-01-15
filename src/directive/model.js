
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

const selectControl = {
  set({ el, keypath, instance }) {
    let value = toString(instance.get(keypath))
    let { options, selectedIndex } = el
    if (value !== options[ selectedIndex ].value) {
      array.each(
        options,
        function (option, index) {
          if (options.value === value) {
            el.selectedIndex = index
            return env.FALSE
          }
        }
      )
    }
  },
  sync({ el, keypath, instance }) {
    let { value } = el.options[ el.selectedIndex ]
    instance.set(keypath, value)
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
  SELECT: selectControl,
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

  let type = 'change', tagName = el.tagName, controlType = el.type
  let control = specialControls[ controlType ] || specialControls[ tagName ]
  if (!control) {
    control = inputControl
    if ('oninput' in el
      // 为了兼容 IE8
      || tagName === 'TEXTAREA'
      || controlType === 'text'
      || controlType === 'password'
    ) {
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
