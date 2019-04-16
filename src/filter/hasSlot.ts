import * as config from 'yox-config'

import isDef from 'yox-common/function/isDef'

/**
 * 组件是否存在某个 slot
 *
 * @param name
 */
export default function (name: string): boolean {
  return isDef(this.get(config.SLOT_DATA_PREFIX + name))
}
