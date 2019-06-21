import { CustomEventInterface } from '../../../yox-type/src/type';
import { YoxInterface } from '../../../yox-type/src/global';
export default class CustomEvent implements CustomEventInterface {
    static PHASE_CURRENT: number;
    static PHASE_UPWARD: number;
    static PHASE_DOWNWARD: number;
    type: string;
    phase: number;
    target?: YoxInterface;
    originalEvent?: CustomEventInterface | Event;
    isPrevented?: true;
    isStoped?: true;
    listener?: Function;
    /**
     * 构造函数
     *
     * 可以传事件名称，也可以传原生事件对象
     */
    constructor(type: string, originalEvent?: CustomEventInterface | Event);
    /**
     * 阻止事件的默认行为
     */
    preventDefault(): CustomEventInterface;
    /**
     * 停止事件广播
     */
    stopPropagation(): CustomEventInterface;
    prevent(): CustomEventInterface;
    stop(): CustomEventInterface;
}
//# sourceMappingURL=CustomEvent.d.ts.map