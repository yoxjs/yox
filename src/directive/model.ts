import {
  lazyValue,
  VNode,
  Directive,
} from '../../../yox-type/src/type'

import {
  Watcher,
  Listener,
  YoxInterface,
} from '../../../yox-type/src/global'

import debounce from '../../../yox-common/src/function/debounce'
import execute from '../../../yox-common/src/function/execute'
import toString from '../../../yox-common/src/function/toString'

import * as is from '../../../yox-common/src/util/is'
import * as env from '../../../yox-common/src/util/env'
import * as array from '../../../yox-common/src/util/array'

import * as domApi from '../../../yox-dom/src/dom'

import * as config from '../../../yox-config/src/config'

interface NativeControl {

  set(node: HTMLElement, value: any): void

  sync(node: HTMLElement, keypath: string, context: YoxInterface): void

  name: string

}

function debounceIfNeeded(fn: Function, lazy: lazyValue | void): any {
  // 应用 lazy
  return lazy && lazy !== env.TRUE
    ? debounce(fn, lazy)
    : fn
}

const inputControl: NativeControl = {
  set(node: HTMLInputElement, value: any) {
    node.value = toString(value)
  },
  sync(node: HTMLInputElement, keypath: string, context: YoxInterface) {
    context.set(keypath, node.value)
  },
  name: env.RAW_VALUE
},

radioControl: NativeControl = {
  set(node: HTMLInputElement, value: any) {
    node.checked = node.value === toString(value)
  },
  sync(node: HTMLInputElement, keypath: string, context: YoxInterface) {
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
  sync(node: HTMLInputElement, keypath: string, context: YoxInterface) {
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
          option.selected = array.has(value, option.value, env.FALSE)
        }
        : function (option: HTMLOptionElement, index: number) {
          if (option.value == value) {
            node.selectedIndex = index
            return env.FALSE
          }
        }
    )
  },
  sync(node: HTMLSelectElement, keypath: string, context: YoxInterface) {
    const { options } = node
    if (node.multiple) {
      const values: string[] = []
      array.each(
        array.toArray(options),
        function (option: HTMLOptionElement) {
          if (option.selected) {
            array.push(
              values,
              option.value
            )
          }
        }
      )
      context.set(keypath, values)
    }
    else {
      context.set(
        keypath,
        options[node.selectedIndex].value
      )
    }
  },
  name: env.RAW_VALUE
},

inputTypes = {
  radio: radioControl,
  checkbox: checkboxControl,
}

export const once = env.TRUE

export function bind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {

  let { context, lazy, isComponent } = vnode,

  dataBinding = directive.binding as string,

  lazyValue = lazy && (lazy[config.DIRECTIVE_MODEL] || lazy[env.EMPTY_STRING]),

  set: Watcher<YoxInterface> | void,

  sync: Watcher<YoxInterface>,

  unbind: Function

  if (isComponent) {

    let component = node as YoxInterface,

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
      domApi.off(element, eventName, sync as Listener<any>)
    }

    domApi.on(element, eventName, sync as Listener<any>)

    control.set(element, directive.value)

  }

  // 监听数据，修改界面
  context.watch(dataBinding, set as Watcher<YoxInterface>)

  vnode.data[directive.key] = function () {
    context.unwatch(dataBinding, set as Watcher<YoxInterface>)
    set = env.UNDEFINED
    unbind()
  }

}

export function unbind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {
  execute(vnode.data[directive.key])
}
