import * as is from '../../../yox-common/src/util/is';
import * as env from '../../../yox-common/src/util/env';
/**
 * 对比新旧数组
 *
 * @param newValue
 * @param oldValue
 * @param callback
 */
export default function (newValue, oldValue, callback) {
    const newIsString = is.string(newValue), oldIsString = is.string(oldValue);
    if (newIsString || oldIsString) {
        callback(env.RAW_LENGTH, newIsString ? newValue.length : env.UNDEFINED, oldIsString ? oldValue.length : env.UNDEFINED);
        return env.TRUE;
    }
}
