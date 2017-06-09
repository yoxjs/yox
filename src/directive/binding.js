
import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as nextTask from 'yox-common/util/nextTask'

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

  // 同批次的修改
  // 不应该响应 watch
  // 因为模板已经全量更新
  nextTask.prepend(
    function () {
      if (set) {
        instance.watch(keypath, set)
      }
    }
  )

  if (is.array(component)) {
    array.push(
      component,
      function (target) {
        component = target
      }
    )
  }

  return function () {
    instance.unwatch(keypath, set)
    set = env.NULL
  }

}
