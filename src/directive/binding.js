
import * as env from 'yox-common/util/env'
import * as nextTask from 'yox-common/util/nextTask'

import api from '../platform/web/api'

export default function ({ el, node, instance, component }) {

  let keypath = node[ env.RAW_VALUE ]

  // 比如写了个 <div>{{name}}</div>
  // 删了数据却忘了删模板，无视之
  if (keypath) {
    let set = function (value) {
      let name = node.modifier
      if (component) {
        component.set(name, value)
      }
      else {
        api[ node.prop ? 'setProp' : 'setAttr' ](el, name, value)
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

}
