
import * as config from 'yox-config'
import * as env from 'yox-common/util/env'

// 组件是否存在某个 slot
export default function (name) {
  return this.get(config.SLOT_DATA_PREFIX + name, env.UNDEFINED) !== env.UNDEFINED
}
