import Node from './node/Node';
import Identifier from './node/Identifier';
import Literal from './node/Literal';
export declare function compile(content: string): Node | void;
export declare class Parser {
    end: number;
    code: number;
    index: number;
    content: string;
    constructor(content: string);
    /**
     * 移动一个字符
     */
    go(step?: number): void;
    /**
     * 跳过空白符
     */
    skip(step?: number): void;
    /**
     * 判断当前字符
     */
    is(code: number): boolean;
    /**
     * 截取一段字符串
     *
     * @param startIndex
     */
    pick(startIndex: number, endIndex?: number): string;
    /**
     * 尝试解析下一个 token
     */
    scanToken(): Node | void;
    /**
     * 扫描数字
     *
     * 支持整数和小数
     *
     * @param startIndex
     * @return
     */
    scanNumber(startIndex: number): Literal | void;
    /**
     * 扫描字符串
     *
     * 支持反斜线转义引号
     *
     * @param startIndex
     * @param endCode
     */
    scanString(startIndex: number, endCode: number): Literal;
    /**
     * 扫描对象字面量
     *
     * @param startIndex
     */
    scanObject(startIndex: number): Node;
    /**
     * 扫描元组，即 `a, b, c` 这种格式，可以是参数列表，也可以是数组
     *
     * @param startIndex
     * @param endCode 元组的结束字符编码
     */
    scanTuple(startIndex: number, endCode: number): Node[];
    /**
     * 扫描路径，如 `./` 和 `../`
     *
     * 路径必须位于开头，如 ./../ 或 ，不存在 a/../b/../c 这样的情况，因为路径是用来切换或指定 context 的
     *
     * @param startIndex
     * @param prevNode
     */
    scanPath(startIndex: number): Node | void;
    /**
     * 扫描变量
     */
    scanTail(startIndex: number, nodes: Node[]): Node | never;
    /**
     * 扫描标识符
     *
     * @param startIndex
     * @param isProp 是否是对象的属性
     * @return
     */
    scanIdentifier(startIndex: number, isProp?: boolean): Identifier | Literal;
    /**
     * 扫描运算符
     *
     * @param startIndex
     */
    scanOperator(startIndex: number): string | void;
    /**
     * 扫描二元运算
     */
    scanBinary(startIndex: number): Node | void;
    /**
     * 扫描三元运算
     *
     * @param endCode
     */
    scanTernary(endCode?: number): Node | void;
    fatal(start: number, message: string): void;
}
//# sourceMappingURL=compiler.d.ts.map