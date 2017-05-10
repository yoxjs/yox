
import * as string from 'yox-common/util/string'
import api from '../platform/web/api'

export default function ({ el, node, instance, component }) {

  let { modifier, attr, value, context } = node

  let { keypath } = context.get(value)

  let set = function (value) {
    if (attr) {
      if (component) {
        if (component.set) {
          component.set(modifier, value)
        }
      }
      else {
        api.setAttr(el, modifier, value)
      }
    }
    else {
      api.setProp(el, modifier, value)
    }
  }

  instance.watch(keypath, set)

  return function () {
    instance.unwatch(keypath, set)
  }

}
