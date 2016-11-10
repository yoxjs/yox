
import {
  on,
  off,
} from '../platform/web/helper'

import {
  NULL,
  FALSE,
} from '../config/env'

import * as logger from '../config/logger'

import {
  testKeypath,
} from '../util/component'

import {
  copy,
} from '../util/object'

import {
  hasItem,
  removeItem,
} from '../util/array'

import {
  isArray,
  isNumeric,
} from '../util/is'

import debounce from '../function/debounce'

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
      el.checked = isArray(value)
        ? hasItem(value, el.value, FALSE)
        : !!value
    },
    sync: function ({ el, keypath, instance }) {
      let array = instance.get(keypath)
      if (isArray(array)) {
        if (el.checked) {
          array.push(el.value)
        }
        else {
          removeItem(array, el.value, FALSE)
        }
        instance.set(keypath, copy(array))
      }
      else {
        instance.set(keypath, el.checked)
      }
    }
  }
}

function getEventInfo(el, lazyDirective) {

  let name = 'change', interval

  let { type, tagName } = el
  if (tagName === 'INPUT' && hasItem(supportInputTypes, type)
    || tagName === 'TEXTAREA'
  ) {
    if (lazyDirective) {
      let value = lazyDirective.node.getValue()
      if (isNumeric(value) && value >= 0) {
        name = 'input'
        interval = value
      }
    }
    else {
      name = 'input'
    }
  }

  return {
    name,
    interval,
    control: controlTypes[type] || controlTypes.normal,
  }
}

module.exports = {

  attach: function ({ el, node, instance, directives }) {

    let { name, interval, control } = getEventInfo(el, directives.lazy)
    let { keypath } = node

    let value = node.getValue()
    let result = testKeypath(instance, keypath, value)
    if (!result) {
      logger.error(`The ${keypath} being used for two-way binding is ambiguous.`)
    }

    keypath = result.keypath

    let data = {
      el,
      keypath,
      instance,
    }
    control.set(data)

    instance.watch(
      keypath,
      function () {
        control.set(data)
      }
    )

    let listener = function () {
      control.sync(data)
    }

    if (interval) {
      listener = debounce(listener, interval)
    }

    el.$model = function () {
      off(el, name, listener)
      el.$model = NULL
    }

    on(el, name, listener)

  },

  detach: function ({ el }) {
    el.$model()
  }

}
