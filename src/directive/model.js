
import isDef from 'yox-common/function/isDef'
import execute from 'yox-common/function/execute'
import toString from 'yox-common/function/toString'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as char from 'yox-common/util/char'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'
import * as logger from 'yox-common/util/logger'
import * as nextTask from 'yox-common/util/nextTask'
import * as keypathUtil from 'yox-common/util/keypath'

import bindEvent from './event'
import api from '../platform/web/api'
import * as event from '../config/event'

const VALUE = 'value'

function getOptionValue(option) {
  return isDef(option.value) ? option.value : option.text
}

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
  attr: VALUE,
}

const selectControl = {
  set(el, keypath, instance) {
    let value = toString(instance.get(keypath))
    let { options } = el
    if (options) {
      array.each(
        options,
        function (option, index) {
          if (getOptionValue(option) === value) {
            el.selectedIndex = index
            return env.FALSE
          }
        }
      )
    }
  },
  sync(el, keypath, instance) {
    instance.set(keypath, getOptionValue(el.options[ el.selectedIndex ]))
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

const componentControl = {
  set(component, keypath, instance) {
    component.set(
      component.$model,
      instance.get(keypath)
    )
  },
  sync(component, keypath, instance) {
    instance.set(
      keypath,
      component.get(component.$model)
    )
  },
}

const specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
  select: selectControl,
}

export default function ({ el, node, instance, directives, attrs, component }) {

  let keypath = node.value
  if (keypath) {

    let set = function () {
      if (control) {
        control.set(target, keypath, instance)
      }
    }
    let sync = function () {
      control.sync(target, keypath, instance)
    }

    let target, control, unbindTarget, unbindInstance
    if (component) {

      target = component
      control = componentControl

      let field = component.$model = component.$options.model || VALUE

      if (!object.has(attrs, field)) {
        instance.nextTick(set)
      }

      component.watch(field, sync)
      unbindTarget = function () {
        component.unwatch(field, sync)
        delete component.$model
      }

    }
    else {

      target = el
      control = specialControls[ el.type ] || specialControls[ api.tag(el) ]

      let type = event.CHANGE
      if (!control) {
        control = inputControl
        type = event.INPUT
      }

      if (!control.attr || !object.has(attrs, control.attr)) {
        set()
      }

      unbindTarget = bindEvent({
        el,
        node,
        instance,
        directives,
        type,
        listener: sync,
      })

    }

    nextTask.prepend(
      function () {
        if (set) {
          instance.watch(keypath, set)
          unbindInstance = function () {
            instance.unwatch(keypath, set)
          }
        }
      }
    )

    return function () {
      execute(unbindTarget)
      execute(unbindInstance)
      set = env.NULL
    }

  }

}
