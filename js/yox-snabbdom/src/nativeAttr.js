import * as env from '../../yox-common/src/util/env';
import * as object from '../../yox-common/src/util/object';
export function update(api, vnode, oldVnode) {
    const { node, nativeAttrs } = vnode, oldNativeAttrs = oldVnode && oldVnode.nativeAttrs;
    if (nativeAttrs || oldNativeAttrs) {
        const newValue = nativeAttrs || env.EMPTY_OBJECT, oldValue = oldNativeAttrs || env.EMPTY_OBJECT;
        object.each(newValue, function (attr, name) {
            if (!oldValue[name]
                || attr.value !== oldValue[name].value) {
                api.attr(node, name, attr.value);
            }
        });
        object.each(oldValue, function (_, name) {
            if (!newValue[name]) {
                api.removeAttr(node, name);
            }
        });
    }
}
