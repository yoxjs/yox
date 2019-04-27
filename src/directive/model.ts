import isDef from 'yox-common/src/function/isDef'
import debounce from 'yox-common/src/function/debounce'
import execute from 'yox-common/src/function/execute'
import toString from 'yox-common/src/function/toString'

import * as is from 'yox-common/src/util/is'
import * as env from 'yox-common/src/util/env'
import * as array from 'yox-common/src/util/array'
import * as object from 'yox-common/src/util/object'

import * as config from 'yox-config/index'
import api from 'yox-dom/index'

import Yox from 'yox-type/src/Yox'
import VNode from 'yox-type/src/vnode/VNode'
import Directive from 'yox-type/src/vnode/Directive'
import DirectiveHooks from 'yox-type/src/hooks/Directive'

function getOptionValue(option: HTMLOptionElement) {
  return isDef(option.value)
    ? option.value
    : option.text
}

interface Control {

  set(node: HTMLElement | Yox, keypath: string, context: Yox): void

  sync(node: HTMLElement | Yox, keypath: string, context: Yox): void

  name: string

}

const inputControl: Control = {
  set(input: HTMLInputElement, keypath: string, context: Yox) {
    input.value = toString(context.get(keypath))
  },
  sync(input: HTMLInputElement, keypath: string, context: Yox) {
    context.set(keypath, input.value)
  },
  name: env.RAW_VALUE
},

selectControl: Control = {
  set(select: HTMLSelectElement, keypath: string, context: Yox) {
    const value = context.get(keypath)
    array.each(
      array.toArray(select.options),
      select.multiple
        ? function (option: HTMLOptionElement) {
          option.selected = array.has(value, getOptionValue(option), env.FALSE)
        }
        : function (option: HTMLOptionElement, index: number) {
          if (getOptionValue(option) == value) {
            select.selectedIndex = index
            return env.FALSE
          }
        }
    )
  },
  sync(select: HTMLSelectElement, keypath: string, context: Yox) {
    const options = array.toArray(select.options)
    if (select.multiple) {
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
          options[select.selectedIndex]
        )
      )
    }
  },
  name: env.RAW_VALUE
},

radioControl: Control = {
  set(radio: HTMLInputElement, keypath: string, context: Yox) {
    radio.checked = radio.value === toString(context.get(keypath))
  },
  sync(radio: HTMLInputElement, keypath: string, context: Yox) {
    if (radio.checked) {
      context.set(keypath, radio.value)
    }
  },
  name: 'checked'
},

checkboxControl: Control = {
  set(checkbox: HTMLInputElement, keypath: string, context: Yox) {
    const value = context.get(keypath)
    checkbox.checked = is.array(value)
      ? array.has(value, checkbox.value, env.FALSE)
      : (is.boolean(value) ? value : !!value)
  },
  sync(checkbox: HTMLInputElement, keypath: string, context: Yox) {
    const value = context.get(keypath)
    if (is.array(value)) {
      if (checkbox.checked) {
        context.append(keypath, checkbox.value)
      }
      else {
        context.removeAt(
          keypath,
          array.indexOf(value, checkbox.value, env.FALSE)
        )
      }
    }
    else {
      context.set(keypath, checkbox.checked)
    }
  },
  name: 'checked'
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
  name: env.RAW_VALUE
},

specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
  select: selectControl,
},

directive: DirectiveHooks = {
  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    let { binding } = directive,

    { context, nativeProps } = vnode,

    lazy = vnode.lazy[config.DIRECTIVE_MODEL] || vnode.lazy[env.EMPTY_STRING],

    set = function () {
      if (!isSyncing) {
        control.set(component || element, binding as string, context)
      }
    },

    sync = function () {
      isSyncing = env.TRUE
      control.sync(component || element, binding as string, context)
      isSyncing = env.FALSE
    },

    isSyncing = env.FALSE,

    component: Yox,

    element: HTMLElement,

    control: Control,

    type: string

    if (lazy && lazy !== env.TRUE) {
      sync = debounce(sync, lazy)
    }

    if (vnode.isComponent) {

      component = node as Yox
      control = componentControl

      // 监听交互，修改数据
      component.watch(component.$model, sync)

    }
    else {

      element = node as HTMLElement
      control = specialControls[element[env.RAW_TYPE]] || specialControls[api.tag(element) as string]

      // checkbox,radio,select 监听的是 change 事件
      type = env.EVENT_CHANGE

      // 如果是输入框，则切换成 input 事件
      if (!control) {
        control = inputControl
        if (lazy !== env.TRUE) {
          type = env.EVENT_INPUT
        }
      }

      // 如果模板里没写对应的属性，则这里先设值
      if (!nativeProps || !object.has(nativeProps, control.name)) {
        set()
      }

      // 监听交互，修改数据
      api.on(element, type, sync)

    }

    // 监听数据，修改界面
    // 这里使用同步监听，这样才能使 isSyncing 生效
    context.watch(
      binding as string,
      {
        watcher: set,
        sync: env.TRUE
      }
    )

    vnode.data[directive.key] = function () {
      if (vnode.isComponent) {
        component.unwatch(component.$model, sync)
      }
      else {
        api.off(element, type, sync)
      }
      context.unwatch(binding as string, set)
    }

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {
    execute(vnode.data[directive.key])
  }
}

export default directive
