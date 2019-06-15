import execute from './execute';
import * as env from '../util/env';
import * as array from '../util/array';
/**
 * 节流调用
 *
 * @param fn 需要节制调用的函数
 * @param delay 调用的时间间隔，单位毫秒
 * @param immediate 是否立即触发
 * @return 节流函数
 */
export default function (fn, delay, immediate) {
    let timer;
    return function () {
        if (!timer) {
            const args = array.toArray(arguments);
            if (immediate) {
                execute(fn, env.UNDEFINED, args);
            }
            timer = setTimeout(function () {
                timer = env.UNDEFINED;
                if (!immediate) {
                    execute(fn, env.UNDEFINED, args);
                }
            }, delay);
        }
    };
}
