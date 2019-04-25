import * as config from 'yox-config/index'
import * as logger from 'yox-common/src/util/logger'

import isDef from 'yox-common/src/function/isDef'

/**
 * 组件是否存在某个 slot
 *
 * @param name
 */
export default function (name: string): boolean {
  if (process.env.NODE_ENV === 'dev') {
    logger.warn('hasSlot 过滤器已不建议使用')
  }
  return isDef(this.get(config.SLOT_DATA_PREFIX + name))
}
