import * as is from '../../../yox-common/src/util/is';
import * as env from '../../../yox-common/src/util/env';
import * as object from '../../../yox-common/src/util/object';
/**
 * 对比新旧对象
 *
 * @param newValue
 * @param oldValue
 * @param callback
 */
export default function (newValue, oldValue, callback) {
    const newIsObject = is.object(newValue), oldIsObject = is.object(oldValue);
    if (newIsObject || oldIsObject) {
        newValue = newIsObject ? newValue : env.EMPTY_OBJECT;
        oldValue = oldIsObject ? oldValue : env.EMPTY_OBJECT;
        if (newIsObject) {
            object.each(newValue, function (value, key) {
                if (value !== oldValue[key]) {
                    callback(key, value, oldValue[key]);
                }
            });
        }
        if (oldIsObject) {
            object.each(oldValue, function (value, key) {
                if (value !== newValue[key]) {
                    callback(key, newValue[key], value);
                }
            });
        }
    }
}
