import Yox from '../interface/Yox';
export default interface CustomEvent {
    type: string;
    phase: number;
    target?: Yox;
    originalEvent?: CustomEvent | Event;
    isPrevented?: true;
    isStoped?: true;
    listener?: Function;
    preventDefault(): CustomEvent;
    stopPropagation(): CustomEvent;
    prevent(): CustomEvent;
    stop(): CustomEvent;
}
//# sourceMappingURL=CustomEvent.d.ts.map