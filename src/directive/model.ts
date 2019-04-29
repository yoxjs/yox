import isDef from 'yox-common/src/function/isDef'
import debounce from 'yox-common/src/function/debounce'
import execute from 'yox-common/src/function/execute'
import toString from 'yox-common/src/function/toString'

import * as is from 'yox-common/src/util/is'
import * as env from 'yox-common/src/util/env'
import * as array from 'yox-common/src/util/array'

import * as config from 'yox-config/index'
import api from 'yox-dom/index'

import * as signature from 'yox-type/index'
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
  set(input: HTMLInputElement, value: any) {
    input.value = toString(value)
  },
  sync(input: HTMLInputElement, keypath: string, context: Yox) {
    context.set(keypath, input.value)
  },
  name: env.RAW_VALUE
},

selectControl: Control = {
  set(select: HTMLSelectElement, value: any) {
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
  set(radio: HTMLInputElement, value: any) {
    radio.checked = radio.value === toString(value)
  },
  sync(radio: HTMLInputElement, keypath: string, context: Yox) {
    if (radio.checked) {
      context.set(keypath, radio.value)
    }
  },
  name: 'checked'
},

checkboxControl: Control = {
  set(checkbox: HTMLInputElement, value: any) {
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

specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
  select: selectControl,
},

directive: DirectiveHooks = {
  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    let { context, model } = vnode,

    dataBinding = directive.binding as string,

    viewBinding: string,

    eventName: string,

    lazy = vnode.lazy[config.DIRECTIVE_MODEL] || vnode.lazy[env.EMPTY_STRING],

    set: signature.watcher,

    sync: signature.watcher,

    component: Yox,

    element: HTMLElement

    if (vnode.isComponent) {

      component = node as Yox

      viewBinding = component.$options.model || env.RAW_VALUE

      set = function (newValue: any) {
        component.set(viewBinding, newValue)
      }

      sync = function (newValue: any) {
        context.set(dataBinding, newValue)
      }

      // 不管模板是否设值，统一用数据中的值
      component.set(viewBinding, model)

    }
    else {

      element = node as HTMLElement

      let control = specialControls[element[env.RAW_TYPE]] || specialControls[api.tag(element) as string]

      // checkbox,radio,select 监听的是 change 事件
      eventName = env.EVENT_CHANGE

      // 如果是输入框，则切换成 model 事件
      // model 事件是个 yox-dom 实现的特殊事件
      // 不会在输入法组合文字过程中得到触发事件
      if (!control) {
        control = inputControl
        if (lazy !== env.TRUE) {
          eventName = env.EVENT_MODEL
        }
      }

      set = function (newValue: any) {
        control.set(element, newValue)
      }

      sync = function () {
        control.sync(element, dataBinding, context)
      }

      // 不管模板是否设值，统一用数据中的值
      control.set(element, model)

    }

    // 应用 lazy
    if (lazy && lazy !== env.TRUE) {
      sync = debounce(sync, lazy)
    }

    // 监听交互，修改数据
    if (component) {
      component.watch(viewBinding, sync)
    }
    else {
      api.on(element, eventName, sync as signature.nativeEventListener)
    }

    // 监听数据，修改界面
    context.watch(dataBinding, set)

    vnode.data[directive.key] = function () {
      if (component) {
        component.unwatch(viewBinding, sync)
      }
      else {
        api.off(element, eventName, sync as signature.nativeEventListener)
      }
      context.unwatch(dataBinding, set)
    }

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {
    execute(vnode.data[directive.key])
  }
}

export default directive
