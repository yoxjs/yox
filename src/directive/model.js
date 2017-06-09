
import toString from 'yox-common/function/toString'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as char from 'yox-common/util/char'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'
import * as logger from 'yox-common/util/logger'
import * as nextTask from 'yox-common/util/nextTask'

import bindEvent from './event'
import api from '../platform/web/api'
import * as event from '../config/event'

const inputControl = {
  set(el, keypath, instance) {
    let value = toString(instance.get(keypath))
    if (value !== el.value) {
      el.value = value
    }
  },
  sync(el, keypath, instance) {
    instance.set(keypath, el.value)
  },
  attr: 'value',
}

const selectControl = {
  set(el, keypath, instance) {
    let value = toString(instance.get(keypath))
    let { options, selectedIndex } = el
    if (value !== options[ selectedIndex ].value) {
      array.each(
        options,
        function (option, index) {
          if (option.value === value) {
            el.selectedIndex = index
            return env.FALSE
          }
        }
      )
    }
  },
  sync(el, keypath, instance) {
    let { value } = el.options[ el.selectedIndex ]
    instance.set(keypath, value)
  },
}

const radioControl = {
  set(el, keypath, instance) {
    el.checked = el.value === toString(instance.get(keypath))
  },
  sync(el, keypath, instance) {
    if (el.checked) {
      instance.set(keypath, el.value)
    }
  },
  attr: 'checked'
}

const checkboxControl = {
  set(el, keypath, instance) {
    let value = instance.get(keypath)
    el.checked = is.array(value)
      ? array.has(value, el.value, env.FALSE)
      : (is.boolean(value) ? value : !!value)
  },
  sync(el, keypath, instance) {
    let value = instance.get(keypath)
    if (is.array(value)) {
      if (el.checked) {
        instance.append(keypath, el.value)
      }
      else {
        instance.removeAt(
          keypath,
          array.indexOf(value, el.value, env.FALSE)
        )
      }
    }
    else {
      instance.set(keypath, el.checked)
    }
  },
  attr: 'checked'
}

const specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
  select: selectControl,
}

export default function ({ el, node, instance, directives, attrs }) {

  let { value, context } = node
  if (string.falsy(value)) {
    return
  }

  let { keypath } = context.get(value)

  let type = event.CHANGE, control = specialControls[ el.type ] || specialControls[ api.tag(el) ]
  if (!control) {
    control = inputControl
    if (object.exists(el, 'autofocus')) {
      type = event.INPUT
    }
  }

  let set = function () {
    control.set(el, keypath, instance)
  }

  if (!control.attr || !object.has(attrs, control.attr)) {
    set()
  }

  nextTask.prepend(
    function () {
      if (set) {
        instance.watch(keypath, set)
      }
    }
  )

  let unbind = bindEvent({
    el,
    node,
    instance,
    directives,
    type,
    listener() {
      control.sync(el, keypath, instance)
    }
  })

  return function () {
    instance.unwatch(keypath, set)
    unbind && unbind()
    set = env.NULL
  }

}
