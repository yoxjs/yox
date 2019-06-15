import * as env from '../../../yox-common/src/util/env';
import * as object from '../../../yox-common/src/util/object';
export default function (source, keypath) {
    if (source == env.NULL || keypath === env.EMPTY_STRING) {
        return source;
    }
    const result = object.get(source, keypath);
    if (result) {
        return result.value;
    }
}
