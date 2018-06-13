
import * as config from 'yox-config'

import isDef from 'yox-common/function/isDef'

// 组件是否存在某个 slot
export default function (name) {
  return isDef(this.get(config.SLOT_DATA_PREFIX + name))
}
