import isDef from '../../../yox-common/src/function/isDef';
import * as array from '../../../yox-common/src/util/array';
import * as keypathUtil from '../../../yox-common/src/util/keypath';
import diffString from './diffString';
import diffArray from './diffArray';
import diffObject from './diffObject';
export default function diffRecursion(keypath, newValue, oldValue, watchFuzzyKeypaths, callback) {
    const diff = function (subKeypath, subNewValue, subOldValue) {
        if (subNewValue !== subOldValue) {
            const newKeypath = keypathUtil.join(keypath, subKeypath);
            array.each(watchFuzzyKeypaths, function (fuzzyKeypath) {
                if (isDef(keypathUtil.matchFuzzy(newKeypath, fuzzyKeypath))) {
                    callback(fuzzyKeypath, newKeypath, subNewValue, subOldValue);
                }
            });
            diffRecursion(newKeypath, subNewValue, subOldValue, watchFuzzyKeypaths, callback);
        }
    };
    diffString(newValue, oldValue, diff)
        || diffArray(newValue, oldValue, diff)
        || diffObject(newValue, oldValue, diff);
}
