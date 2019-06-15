import * as env from '../../yox-common/src/util/env';
import * as object from '../../yox-common/src/util/object';
import * as field from './field';
export function update(vnode, oldVnode) {
    const { data, directives } = vnode, oldDirectives = oldVnode && oldVnode.directives;
    if (directives || oldDirectives) {
        const node = data[field.COMPONENT] || vnode.node, isKeypathChange = oldVnode && vnode.keypath !== oldVnode.keypath, newValue = directives || env.EMPTY_OBJECT, oldValue = oldDirectives || env.EMPTY_OBJECT;
        object.each(newValue, function (directive, name) {
            const { once, bind, unbind } = directive.hooks;
            if (!oldValue[name]) {
                bind(node, directive, vnode);
            }
            else if (once
                || directive.value !== oldValue[name].value
                || isKeypathChange) {
                if (unbind) {
                    unbind(node, oldValue[name], oldVnode);
                }
                bind(node, directive, vnode);
            }
        });
        object.each(oldValue, function (directive, name) {
            if (!newValue[name]) {
                const { unbind } = directive.hooks;
                if (unbind) {
                    unbind(node, directive, oldVnode);
                }
            }
        });
    }
}
export function remove(vnode) {
    const { directives } = vnode;
    if (directives) {
        const node = vnode.data[field.COMPONENT] || vnode.node;
        object.each(directives, function (directive) {
            const { unbind } = directive.hooks;
            if (unbind) {
                unbind(node, directive, vnode);
            }
        });
    }
}
