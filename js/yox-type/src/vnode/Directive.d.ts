import DirectiveHooks from '../hooks/Directive';
import * as type from '../type';
export default interface Directive {
    readonly ns: string;
    readonly name: string;
    readonly key: string;
    readonly value?: string | number | boolean;
    readonly hooks: DirectiveHooks;
    readonly getter?: type.getter | void;
    readonly handler?: type.listener | void;
    readonly binding?: string | void;
    readonly hint?: type.hint | void;
}
//# sourceMappingURL=Directive.d.ts.map