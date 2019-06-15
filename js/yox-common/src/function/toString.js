import * as env from '../util/env';
import isDef from './isDef';
export default function (target, defaultValue) {
    return target != env.NULL && target.toString
        ? target.toString()
        : isDef(defaultValue)
            ? defaultValue
            : env.EMPTY_STRING;
}
