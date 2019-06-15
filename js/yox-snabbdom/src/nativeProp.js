import * as env from '../../yox-common/src/util/env';
import * as object from '../../yox-common/src/util/object';
export function update(api, vnode, oldVnode) {
    const { node, nativeProps } = vnode, oldNativeProps = oldVnode && oldVnode.nativeProps;
    if (nativeProps || oldNativeProps) {
        const newValue = nativeProps || env.EMPTY_OBJECT, oldValue = oldNativeProps || env.EMPTY_OBJECT;
        object.each(newValue, function (prop, name) {
            if (!oldValue[name]
                || prop.value !== oldValue[name].value) {
                api.prop(node, name, prop.value);
            }
        });
        object.each(oldValue, function (prop, name) {
            if (!newValue[name]) {
                api.removeProp(node, name, prop.hint);
            }
        });
    }
}
