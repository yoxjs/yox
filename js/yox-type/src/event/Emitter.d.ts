import * as type from '../type';
import EmitterOptions from '../options/Emitter';
export default interface Emitter {
    ns: boolean;
    listeners: Record<string, EmitterOptions[]>;
    nativeListeners?: Record<string, type.nativeListener>;
    fire(type: string, args: any[] | void, filter?: (type: string, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
    on(type: string, listener?: Function | EmitterOptions): void;
    off(type?: string, listener?: Function): void;
    has(type: string, listener?: Function): boolean;
}
//# sourceMappingURL=Emitter.d.ts.map