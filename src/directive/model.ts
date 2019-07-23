import {
  Watcher,
  LazyValue,
} from 'yox-type/src/type'

import {
  VNode,
  Directive,
} from 'yox-type/src/vnode'

import {
  YoxInterface,
} from 'yox-type/src/yox'

import {
  DIRECTIVE_MODEL,
} from 'yox-config/src/config'

import debounce from 'yox-common/src/function/debounce'
import execute from 'yox-common/src/function/execute'
import toString from 'yox-common/src/function/toString'

import * as is from 'yox-common/src/util/is'
import * as array from 'yox-common/src/util/array'
import * as constant from 'yox-common/src/util/constant'

import * as domApi from 'yox-dom/src/dom'


interface NativeControl {

  set(node: HTMLElement, value: any): void

  sync(node: HTMLElement, keypath: string, context: YoxInterface): void

  name: string

}

function debounceIfNeeded<T extends Function>(fn: T, lazy: LazyValue | void): T {
  // 应用 lazy
  return lazy && lazy !== constant.TRUE
    ? debounce(fn as Function, lazy) as any
    : fn
}

const inputControl: NativeControl = {
  set(node: HTMLInputElement, value: any) {
    node.value = toString(value)
  },
  sync(node: HTMLInputElement, keypath: string, context: YoxInterface) {
    context.set(keypath, node.value)
  },
  name: constant.RAW_VALUE
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
      ? array.has(value, node.value, constant.FALSE)
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
          array.indexOf(value, node.value, constant.FALSE)
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
        ? function (option) {
          option.selected = array.has(value, option.value, constant.FALSE)
        }
        : function (option, index) {
          if (option.value == value) {
            node.selectedIndex = index
            return constant.FALSE
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
        function (option) {
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
  name: constant.RAW_VALUE
}

export const once = constant.TRUE

export function bind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {

  let { context, lazy, isComponent } = vnode,

  dataBinding = directive.modifier as string,

  lazyValue = lazy && (lazy[DIRECTIVE_MODEL] || lazy[constant.EMPTY_STRING]),

  set: Watcher | void,

  unbind: Function

  if (isComponent) {

    let component = node as YoxInterface,

    viewBinding = component.$model as string,

    viewSyncing = debounceIfNeeded(
      function (newValue: any) {
        context.set(dataBinding, newValue)
      },
      lazyValue
    )

    set = function (newValue: any) {
      if (set) {
        component.set(viewBinding, newValue)
      }
    }

    unbind = function () {
      component.unwatch(viewBinding, viewSyncing)
    }

    component.watch(viewBinding, viewSyncing)

  }
  else {

    let element = node as HTMLElement,

    control = vnode.tag === 'select'
      ? selectControl
      : inputControl,

    // checkbox,radio,select 监听的是 change 事件
    eventName = constant.EVENT_CHANGE

    if (control === inputControl) {
      const type = (node as HTMLInputElement).type
      if (type === 'radio') {
        control = radioControl
      }
      else if (type === 'checkbox') {
        control = checkboxControl
      }
      // 如果是输入框，则切换成 model 事件
      // model 事件是个 yox-dom 实现的特殊事件
      // 不会在输入法组合文字过程中得到触发事件
      else if (lazyValue !== constant.TRUE) {
        eventName = constant.EVENT_MODEL
      }
    }

    set = function (newValue: any) {
      if (set) {
        control.set(element, newValue)
      }
    }

    const sync = debounceIfNeeded(
      function () {
        control.sync(element, dataBinding, context)
      },
      lazyValue
    )

    unbind = function () {
      domApi.off(element, eventName, sync)
    }

    domApi.on(element, eventName, sync)

    control.set(element, directive.value)

  }

  // 监听数据，修改界面
  context.watch(dataBinding, set as Watcher)

  vnode.data[directive.key] = function () {
    context.unwatch(dataBinding, set as Watcher)
    set = constant.UNDEFINED
    unbind()
  }

}

export function unbind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {
  execute(vnode.data[directive.key])
}
