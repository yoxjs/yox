
import * as env from '../config/env'

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import * as logger from '../util/logger'
import * as component from '../util/component'

import event from './event'


// 支持 input 事件的控件
const supportInputTypes = [ 'text', 'number', 'tel', 'url', 'email', 'search' ]

// 特殊的双向绑定逻辑
const controlTypes = {
  normal: {
    set: function ({ el, keypath, instance }) {
      el.value = instance.get(keypath)
    },
    sync: function ({ el, keypath, instance }) {
      instance.set(keypath, el.value)
    }
  },
  radio: {
    set: function ({ el, keypath, instance }) {
      el.checked = el.value == instance.get(keypath)
    },
    sync: function ({ el, keypath, instance }) {
      if (el.checked) {
        instance.set(keypath, el.value)
      }
    }
  },
  checkbox: {
    set: function ({ el, keypath, instance }) {
      let value = instance.get(keypath)
      el.checked = is.array(value)
        ? array.has(value, el.value, env.FALSE)
        : !!value
    },
    sync: function ({ el, keypath, instance }) {
      let value = instance.get(keypath)
      if (is.array(value)) {
        if (el.checked) {
          value.push(el.value)
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
}

export default {

  attach: function ({ el, node, instance, directives }) {

    let name = 'change'

    let { type, tagName } = el
    if (tagName === 'INPUT' && array.has(supportInputTypes, type)
      || tagName === 'TEXTAREA'
    ) {
      name = 'input'
    }

    let { keypath } = node

    let value = node.getValue()
    let result = component.testKeypath(instance, keypath, value)
    if (!result) {
      logger.error(`The ${keypath} being used for two-way binding is ambiguous.`)
    }

    keypath = result.keypath

    let data = {
      el,
      keypath,
      instance,
    }

    let control = controlTypes[type] || controlTypes.normal
    control.set(data)

    instance.watch(
      keypath,
      function () {
        control.set(data)
      }
    )

    event.attach({
      el,
      node,
      name,
      instance,
      directives,
      listener: function () {
        control.sync(data)
      }
    })

  },

  detach: function ({ el }) {
    event.detach({ el })
  }

}
