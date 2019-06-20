import { nativeListener, EmitterOptions, EmitterInterface } from '../../../yox-type/src/type';
export default class Emitter implements EmitterInterface {
    /**
     * 是否开启命名空间
     */
    ns: boolean;
    /**
     * 已注册的事件监听
     */
    listeners: Record<string, EmitterOptions[]>;
    /**
     * 原生事件监听，一个事件对应一个 listener
     */
    nativeListeners?: Record<string, nativeListener>;
    constructor(ns?: boolean);
    /**
     * 发射事件
     *
     * @param bullet 事件或事件名称
     * @param data 事件数据
     */
    fire(type: string, args: any[] | void, filter?: (type: string, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
    /**
     * 注册监听
     *
     * @param type
     * @param listener
     */
    on(type: string, listener?: Function | EmitterOptions): void;
    /**
     * 取消监听
     *
     * @param type
     * @param listener
     */
    off(type?: string, listener?: Function): void;
    /**
     * 是否已监听某个事件
     *
     * @param type
     * @param listener
     */
    has(type: string, listener?: Function): boolean;
}
//# sourceMappingURL=Emitter.d.ts.map