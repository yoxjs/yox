import isDef from '../../../yox-common/src/function/isDef';
import * as array from '../../../yox-common/src/util/array';
import * as object from '../../../yox-common/src/util/object';
import * as string from '../../../yox-common/src/util/string';
import * as keypathUtil from '../../../yox-common/src/util/keypath';
import readValue from './readValue';
import diffRecursion from './diffRecursion';
export default function (keypath, newValue, oldValue, watcher, isRecursive, callback) {
    let fuzzyKeypaths;
    // 遍历监听的 keypath，如果未被监听，则无需触发任何事件
    object.each(watcher, function (_, watchKeypath) {
        // 模糊监听，如 users.*.name
        if (keypathUtil.isFuzzy(watchKeypath)) {
            // 如果当前修改的是 users.0 整个对象
            // users.0 和 users.*.name 无法匹配
            // 此时要知道设置 users.0 到底会不会改变 users.*.name 需要靠递归了
            // 如果匹配，则无需递归
            if (isDef(keypathUtil.matchFuzzy(keypath, watchKeypath))) {
                callback(watchKeypath, keypath, newValue, oldValue);
            }
            else if (isRecursive) {
                if (fuzzyKeypaths) {
                    array.push(fuzzyKeypaths, watchKeypath);
                }
                else {
                    fuzzyKeypaths = [watchKeypath];
                }
            }
            return;
        }
        // 不是模糊匹配，直接靠前缀匹配
        // 比如监听的是 users.0.name，此时修改 users.0，则直接读出子属性值，判断是否相等
        const length = keypathUtil.match(watchKeypath, keypath);
        if (length >= 0) {
            const subKeypath = string.slice(watchKeypath, length), subNewValue = readValue(newValue, subKeypath), subOldValue = readValue(oldValue, subKeypath);
            if (subNewValue !== subOldValue) {
                callback(watchKeypath, watchKeypath, subNewValue, subOldValue);
            }
        }
    });
    // 存在模糊匹配的需求
    // 必须对数据进行递归
    // 性能确实会慢一些，但是很好用啊，几乎可以监听所有的数据
    if (fuzzyKeypaths) {
        diffRecursion(keypath, newValue, oldValue, fuzzyKeypaths, callback);
    }
}
