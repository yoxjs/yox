import * as config from '../../../yox-config/src/config';
import isDef from '../../../yox-common/src/function/isDef';
// this type https://jkchao.github.io/typescript-book-chinese/typings/thisType.html
/**
 * 组件是否存在某个 slot
 *
 * @param name
 */
export default function (name) {
    return isDef(this.get(config.SLOT_DATA_PREFIX + name));
}
