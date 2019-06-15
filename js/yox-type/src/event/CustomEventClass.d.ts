import CustomEvent from './CustomEvent';
export default interface CustomEventClass {
    PHASE_CURRENT: number;
    PHASE_UPWARD: number;
    PHASE_DOWNWARD: number;
    new (type: string, originalEvent?: CustomEvent | Event): CustomEvent;
}
//# sourceMappingURL=CustomEventClass.d.ts.map