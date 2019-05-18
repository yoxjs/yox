import isDef from '../../../yox-common/src/function/isDef'
import debounce from '../../../yox-common/src/function/debounce'
import execute from '../../../yox-common/src/function/execute'
import toString from '../../../yox-common/src/function/toString'

import * as is from '../../../yox-common/src/util/is'
import * as env from '../../../yox-common/src/util/env'
import * as array from '../../../yox-common/src/util/array'

import api from '../../../yox-dom/src/dom'

import * as config from '../../../yox-config/src/config'
import * as type from '../../../yox-type/src/type'

import Yox from '../../../yox-type/src/interface/Yox'
import VNode from '../../../yox-type/src/vnode/VNode'
import Directive from '../../../yox-type/src/vnode/Directive'
import DirectiveHooks from '../../../yox-type/src/hooks/Directive'

interface NativeControl {

  set(node: HTMLElement, value: any): void

  sync(node: HTMLElement, keypath: string, context: Yox): void

  name: string

}

function getOptionValue(option: HTMLOptionElement) {
  return isDef(option.value)
    ? option.value
    : option.text
}

function debounceIfNeeded(fn: Function, lazy: type.lazy | void): any {
  // 应用 lazy
  return lazy && lazy !== env.TRUE
    ? debounce(fn, lazy)
    : fn
}

const inputControl: NativeControl = {
  set(node: HTMLInputElement, value: any) {
    node.value = toString(value)
  },
  sync(node: HTMLInputElement, keypath: string, context: Yox) {
    context.set(keypath, node.value)
  },
  name: env.RAW_VALUE
},

radioControl: NativeControl = {
  set(node: HTMLInputElement, value: any) {
    node.checked = node.value === toString(value)
  },
  sync(node: HTMLInputElement, keypath: string, context: Yox) {
    if (node.checked) {
      context.set(keypath, node.value)
    }
  },
  name: 'checked'
},

checkboxControl: NativeControl = {
  set(node: HTMLInputElement, value: any) {
    node.checked = is.array(value)
      ? array.has(value, node.value, env.FALSE)
      : !!value
  },
  sync(node: HTMLInputElement, keypath: string, context: Yox) {
    const value = context.get(keypath)
    if (is.array(value)) {
      if (node.checked) {
        context.append(keypath, node.value)
      }
      else {
        context.removeAt(
          keypath,
          array.indexOf(value, node.value, env.FALSE)
        )
      }
    }
    else {
      context.set(keypath, node.checked)
    }
  },
  name: 'checked'
},

selectControl: NativeControl = {
  set(node: HTMLSelectElement, value: any) {
    array.each(
      array.toArray(node.options),
      node.multiple
        ? function (option: HTMLOptionElement) {
          option.selected = array.has(value, getOptionValue(option), env.FALSE)
        }
        : function (option: HTMLOptionElement, index: number) {
          if (getOptionValue(option) == value) {
            node.selectedIndex = index
            return env.FALSE
          }
        }
    )
  },
  sync(node: HTMLSelectElement, keypath: string, context: Yox) {
    const options = array.toArray(node.options)
    if (node.multiple) {
      const values: string[] = []
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
      context.set(keypath, values)
    }
    else {
      context.set(
        keypath,
        getOptionValue(
          options[node.selectedIndex]
        )
      )
    }
  },
  name: env.RAW_VALUE
},

inputTypes = {
  radio: radioControl,
  checkbox: checkboxControl,
},

directive: DirectiveHooks = {

  once: env.TRUE,

  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    let { context, lazy, isComponent } = vnode,

    dataBinding = directive.binding as string,

    lazyValue = lazy && (lazy[config.DIRECTIVE_MODEL] || lazy[env.EMPTY_STRING]),

    set: type.watcher | void,

    sync: type.watcher,

    unbind: Function

    if (isComponent) {

      let component = node as Yox,

      viewBinding = component.$model as string

      set = function (newValue: any) {
        if (set) {
          component.set(viewBinding, newValue)
        }
      }

      sync = debounceIfNeeded(
        function (newValue: any) {
          context.set(dataBinding, newValue)
        },
        lazyValue
      )

      unbind = function () {
        component.unwatch(viewBinding, sync)
      }

      component.watch(viewBinding, sync)

    }
    else {

      let element = node as HTMLElement,

      control = vnode.tag === 'select'
        ? selectControl
        : inputControl,

      // checkbox,radio,select 监听的是 change 事件
      eventName = env.EVENT_CHANGE

      if (control === inputControl) {
        const type = (node as HTMLInputElement).type
        if (inputTypes[type]) {
          control = inputTypes[type]
        }
        // 如果是输入框，则切换成 model 事件
        // model 事件是个 yox-dom 实现的特殊事件
        // 不会在输入法组合文字过程中得到触发事件
        else if (lazyValue !== env.TRUE) {
          eventName = env.EVENT_MODEL
        }
      }

      set = function (newValue: any) {
        if (set) {
          control.set(element, newValue)
        }
      }

      sync = debounceIfNeeded(
        function () {
          control.sync(element, dataBinding, context)
        },
        lazyValue
      )

      unbind = function () {
        api.off(element, eventName, sync as type.listener)
      }

      api.on(element, eventName, sync as type.listener)

      control.set(element, vnode.model)

    }

    // 监听数据，修改界面
    context.watch(dataBinding, set as type.watcher)

    vnode.data[directive.key] = function () {
      context.unwatch(dataBinding, set as type.watcher)
      set = env.UNDEFINED
      unbind()
    }

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {
    execute(vnode.data[directive.key])
  }
}

export default directive
