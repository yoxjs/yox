
import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as nextTask from 'yox-common/util/nextTask'
import * as keypathUtil from 'yox-common/util/keypath'

import api from '../platform/web/api'

export default function ({ el, node, instance, component }) {

  let keypath = instance.lookup(node.value, node.keypathStack)
  // 比如写了个 <div>{{name}}</div>
  // 删了数据却忘了删模板，无视之
  if (!keypath) {
    return
  }

  let set = function (value) {
    let name = node.modifier
    if (node.prop) {
      api.setProp(el, name, value)
    }
    else {
      if (component) {
        component.set(name, value)
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

  return function () {
    instance.unwatch(keypath, set)
    set = env.NULL
  }

}
