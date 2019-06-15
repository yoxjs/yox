import * as is from '../util/is';
import toString from './toString';
export default function (target) {
    return is.func(target) && /native code/.test(toString(target));
}
