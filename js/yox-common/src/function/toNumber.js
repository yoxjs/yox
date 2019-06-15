import * as is from '../util/is';
import isDef from './isDef';
export default function (target, defaultValue) {
    return is.numeric(target)
        ? +target
        : isDef(defaultValue)
            ? defaultValue
            : 0;
}
