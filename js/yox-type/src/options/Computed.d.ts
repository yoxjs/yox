import * as type from '../type';
export default interface ComputedOptions {
    get: type.getter;
    set?: type.setter;
    cache?: boolean;
    sync?: boolean;
    deps?: string[];
}
//# sourceMappingURL=Computed.d.ts.map