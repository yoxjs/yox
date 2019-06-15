import * as config from '../../yox-config/src/config';
import * as object from '../../yox-common/src/util/object';
import * as field from './field';
export function update(vnode, oldVnode) {
    let { data, ref, props, slots, directives, context } = vnode, node;
    if (vnode.isComponent) {
        node = data[field.COMPONENT];
        // 更新时才要 set
        // 因为初始化时，所有这些都经过构造函数完成了
        if (oldVnode) {
            const model = directives && directives[config.DIRECTIVE_MODEL];
            if (model) {
                if (!props) {
                    props = {};
                }
                props[node.$model] = model.value;
            }
            if (props) {
                node.checkProps(props);
            }
            const result = object.merge(props, slots);
            if (result) {
                node.forceUpdate(result);
            }
        }
    }
    else {
        node = vnode.node;
    }
    if (ref) {
        const refs = context.$refs;
        if (refs) {
            refs[ref] = node;
        }
    }
}
