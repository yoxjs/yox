
import * as string from 'yox-common/util/string'
import api from '../platform/web/api'

export default function ({ el, node, instance, component }) {

  let { keypath } = node.context.get(node.value)

  let set = function (value) {
    let name = node.modifier
    if (node.prop) {
      api.setProp(el, name, value)
    }
    else {
      if (component) {
        if (component.set) {
          component.set(name, value)
        }
      }
      else {
        api.setAttr(el, name, value)
      }
    }
  }

  instance.watch(keypath, set)

  return function () {
    instance.unwatch(keypath, set)
  }

}
