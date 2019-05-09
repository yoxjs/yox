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
  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    let { context, model, lazy, isComponent } = vnode,

    dataBinding = directive.binding as string,

    viewBinding: string | void,

    eventName: string | void,

    set: type.watcher,

    sync: type.watcher,

    lazyValue: type.lazy | void

    if (lazy) {
      lazyValue = lazy[config.DIRECTIVE_MODEL] || lazy[env.EMPTY_STRING]
    }

    if (isComponent) {

      viewBinding = (node as Yox).$options.model || env.RAW_VALUE

      set = function (newValue: any) {
        (node as Yox).set(viewBinding as string, newValue)
      }

      sync = function (newValue: any) {
        context.set(dataBinding, newValue)
      }

    }
    else {

      let control = api.tag(node as HTMLElement) === 'select'
        ? selectControl
        : inputControl

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
        control.set(node as HTMLElement, newValue)
      }

      sync = function () {
        control.sync(node as HTMLElement, dataBinding, context)
      }

    }

    // 不管模板是否设值，统一用数据中的值
    set(model, env.UNDEFINED, env.EMPTY_STRING)

    // 应用 lazy
    if (lazyValue && lazyValue !== env.TRUE) {
      sync = debounce(sync, lazyValue)
    }

    // 监听交互，修改数据
    if (isComponent) {
      (node as Yox).watch(viewBinding as string, sync)
    }
    else {
      api.on(node as HTMLElement, eventName as string, sync as type.listener)
    }

    // 监听数据，修改界面
    context.watch(dataBinding, set)

    vnode.data[directive.key] = function () {
      if (isComponent) {
        (node as Yox).unwatch(viewBinding as string, sync)
      }
      else {
        api.off(node as HTMLElement, eventName as string, sync as type.listener)
      }
      context.unwatch(dataBinding, set)
    }

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {
    execute(vnode.data[directive.key])
  }
}

export default directive
