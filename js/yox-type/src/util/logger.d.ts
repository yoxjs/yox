export default interface loggerUtil {
    DEBUG: number;
    INFO: number;
    WARN: number;
    ERROR: number;
    FATAL: number;
    debug(msg: string, tag?: string): void;
    info(msg: string, tag?: string): void;
    warn(msg: string, tag?: string): void;
    error(msg: string, tag?: string): void;
    fatal(msg: string, tag?: string): void;
}
//# sourceMappingURL=logger.d.ts.map