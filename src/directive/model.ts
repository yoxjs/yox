import isDef from 'yox-common/src/function/isDef'
import execute from 'yox-common/src/function/execute'
import toString from 'yox-common/src/function/toString'

import * as is from 'yox-common/src/util/is'
import * as env from 'yox-common/src/util/env'
import * as array from 'yox-common/src/util/array'
import * as object from 'yox-common/src/util/object'
import * as string from 'yox-common/src/util/string'
import * as logger from 'yox-common/src/util/logger'
import * as nextTask from 'yox-common/src/util/nextTask'

import api from 'yox-dom/index'

import * as event from '../config/event'

import Yox from 'yox-type/src/Yox'
import VNode from 'yox-type/src/vnode/VNode'
import Directive from 'yox-type/src/vnode/Directive'
import DirectiveHooks from 'yox-type/src/hooks/Directive'

function getOptionValue(option: HTMLOptionElement) {
  return isDef(option[ env.RAW_VALUE ])
    ? option[ env.RAW_VALUE ]
    : option[ env.RAW_TEXT ]
}

interface Control {

  set(el: HTMLElement | Yox, keypath: string, context: Yox): void

  sync(el: HTMLElement | Yox, keypath: string, context: Yox): void

  attr?: string

}

const RAW_CHECKED = 'checked',

inputControl: Control = {
  set(el: HTMLInputElement, keypath: string, context: Yox) {
    const value = toString(context.get(keypath))
    if (value !== el[ env.RAW_VALUE ]) {
      el[ env.RAW_VALUE ] = value
    }
  },
  sync(el: HTMLInputElement, keypath: string, context: Yox) {
    context.set(keypath, el[ env.RAW_VALUE ])
  },
  attr: env.RAW_VALUE,
},

selectControl: Control = {
  set(el: HTMLSelectElement, keypath: string, context: Yox) {
    const value = context.get(keypath)
    array.each(
      array.toArray(el.options),
      el.multiple
        ? function (option: HTMLOptionElement) {
          option.selected = array.has(value, getOptionValue(option), env.FALSE)
        }
        : function (option: HTMLOptionElement, index: number) {
          if (getOptionValue(option) == value) {
            el.selectedIndex = index
            return env.FALSE
          }
        }
    )
  },
  sync(el: HTMLSelectElement, keypath: string, context: Yox) {
    const options = array.toArray(el.options)
    if (el.multiple) {
      const values = []
      array.each(
        options,
        function (option: HTMLOptionElement) {
          if (option.selected) {
            array.push(
              values,
              getOptionValue(option)
            )
          }
        }
      )
      // 如果新旧值都是 []，set 没有意义
      if (!array.falsy(values) || !array.falsy(context.get(keypath))) {
        context.set(keypath, values)
      }
    }
    else {
      context.set(
        keypath,
        getOptionValue(
          options[el.selectedIndex]
        )
      )
    }
  },
},

radioControl: Control = {
  set(el: HTMLInputElement, keypath: string, context: Yox) {
    el[ RAW_CHECKED ] = el[ env.RAW_VALUE ] === toString(context.get(keypath))
  },
  sync(el: HTMLInputElement, keypath: string, context: Yox) {
    if (el[ RAW_CHECKED ]) {
      context.set(keypath, el[ env.RAW_VALUE ])
    }
  },
  attr: RAW_CHECKED
},

checkboxControl: Control = {
  set(el: HTMLInputElement, keypath: string, context: Yox) {
    const value = context.get(keypath)
    el[ RAW_CHECKED ] = is.array(value)
      ? array.has(value, el[ env.RAW_VALUE ], env.FALSE)
      : (is.boolean(value) ? value : !!value)
  },
  sync(el: HTMLInputElement, keypath: string, context: Yox) {
    const value = context.get(keypath)
    if (is.array(value)) {
      if (el[ RAW_CHECKED ]) {
        context.append(keypath, el[ env.RAW_VALUE ])
      }
      else {
        context.removeAt(
          keypath,
          array.indexOf(value, el[ env.RAW_VALUE ], env.FALSE)
        )
      }
    }
    else {
      context.set(keypath, el[ RAW_CHECKED ])
    }
  },
  attr: RAW_CHECKED
},

componentControl: Control = {
  set(component: Yox, keypath: string, context: Yox) {
    component.set(
      component.$model,
      context.get(keypath)
    )
  },
  sync(component: Yox, keypath: string, context: Yox) {
    context.set(
      keypath,
      component.get(component.$model)
    )
  },
},

specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
  select: selectControl,
},

directive: DirectiveHooks = {
  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    let { binding } = directive,

    { context } = vnode,

    set = function () {
      control.set(target, binding as string, context)
    },

    sync = function () {
      control.sync(target, binding as string, context)
    },

    target: HTMLElement | Yox,

    control: Control,

    name: string

    if (vnode.isComponent) {

      target = node as Yox
      control = componentControl

      name = target.$model

      target.watch(name, sync)

    }
    else {

      target = node as HTMLElement
      control = specialControls[target[env.RAW_TYPE]] || specialControls[api.tag(target) as string]

      let type = event.CHANGE
      if (!control) {
        control = inputControl
        type = event.INPUT
      }

      name = control.attr || env.RAW_VALUE

      if (!object.has(vnode.nativeAttrs, name)) {
        set()
      }


    }

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

  }
}

export default directive
