import * as config from '../../yox-config/src/config';
import toNumber from '../../yox-common/src/function/toNumber';
import * as is from '../../yox-common/src/util/is';
import * as env from '../../yox-common/src/util/env';
import * as array from '../../yox-common/src/util/array';
import * as string from '../../yox-common/src/util/string';
import * as logger from '../../yox-common/src/util/logger';
import * as exprNodeType from '../../yox-expression-compiler/src/nodeType';
import * as exprCompiler from '../../yox-expression-compiler/src/compiler';
import * as helper from './helper';
import * as creator from './creator';
import * as nodeType from './nodeType';
// 当前不位于 block 之间
const BLOCK_MODE_NONE = 1, 
// {{ x }}
BLOCK_MODE_SAFE = 2, 
// {{{ x }}}
BLOCK_MODE_UNSAFE = 3, 
// 缓存编译正则
patternCache = {}, 
// 指令分隔符，如 on-click 和 lazy-click
directiveSeparator = '-', 
// 没有命名空间的事件
eventPattern = /^[_$a-z]([\w]+)?$/i, 
// 有命名空间的事件
eventNamespacePattern = /^[_$a-z]([\w]+)?\.[_$a-z]([\w]+)?$/i, 
// 换行符
// 比较神奇是，有时候你明明看不到换行符，却真的存在一个，那就是 \r
breaklinePattern = /^\s*[\n\r]\s*|\s*[\n\r]\s*$/g, 
// 区间遍历
rangePattern = /\s*(=>|->)\s*/, 
// 标签
tagPattern = /<(\/)?([$a-z][-a-z0-9]*)/i, 
// 注释
commentPattern = /<!--[\s\S]*?-->/g, 
// 开始注释
openCommentPattern = /^([\s\S]*?)<!--/, 
// 结束注释
closeCommentPattern = /-->([\s\S]*?)$/, 
// 属性的 name
// 支持 on-click.namespace="" 或 on-get-out="" 或 xml:xx=""
attributePattern = /^\s*([-.:\w]+)(['"])?(?:=(['"]))?/, 
// 首字母大写，或中间包含 -
componentNamePattern = /^[$A-Z]|-/, 
// 自闭合标签
selfClosingTagPattern = /^\s*(\/)?>/, 
// 常见的自闭合标签
selfClosingTagNames = 'area,base,embed,track,source,param,input,col,img,br,hr'.split(','), 
// 常见的 svg 标签
svgTagNames = 'svg,g,defs,desc,metadata,symbol,use,image,path,rect,circle,line,ellipse,polyline,polygon,text,tspan,tref,textpath,marker,pattern,clippath,mask,filter,cursor,view,animate,font,font-face,glyph,missing-glyph,foreignObject'.split(','), 
// 常见的字符串类型的属性
// 注意：autocomplete,autocapitalize 不是布尔类型
stringProperyNames = 'id,class,name,value,for,accesskey,title,style,src,type,href,target,alt,placeholder,preload,poster,wrap,accept,pattern,dir,autocomplete,autocapitalize'.split(','), 
// 常见的数字类型的属性
numberProperyNames = 'min,minlength,max,maxlength,step,width,height,size,rows,cols,tabindex'.split(','), 
// 常见的布尔类型的属性
booleanProperyNames = 'disabled,checked,required,multiple,readonly,autofocus,autoplay,controls,loop,muted,novalidate,draggable,hidden,spellcheck'.split(','), 
// 某些属性 attribute name 和 property name 不同
attr2Prop = {};
// 列举几个常见的
attr2Prop['for'] = 'htmlFor';
attr2Prop['class'] = 'className';
attr2Prop['accesskey'] = 'accessKey';
attr2Prop['style'] = 'style.cssText';
attr2Prop['novalidate'] = 'noValidate';
attr2Prop['readonly'] = 'readOnly';
attr2Prop['tabindex'] = 'tabIndex';
attr2Prop['minlength'] = 'minLength';
attr2Prop['maxlength'] = 'maxLength';
/**
 * 截取前缀之后的字符串
 */
function slicePrefix(str, prefix) {
    return string.trim(string.slice(str, prefix.length));
}
export function compile(content) {
    let nodeList = [], nodeStack = [], 
    // 持有 if/elseif/else 节点
    ifStack = [], currentElement, currentAttribute, length = content.length, 
    // 当前处理的位置
    index = 0, 
    // 下一段开始的位置
    nextIndex = 0, 
    // 开始定界符的位置，表示的是 {{ 的右侧位置
    openBlockIndex = 0, 
    // 结束定界符的位置，表示的是 }} 的左侧位置
    closeBlockIndex = 0, 
    // 当前正在处理或即将处理的 block 类型
    blockMode = BLOCK_MODE_NONE, 
    // mustache 注释可能出现嵌套插值的情况
    blockStack = [], indexList = [], code, startQuote, fatal = function (msg) {
        if (process.env.NODE_ENV === 'development') {
            logger.fatal(`Error compiling ${env.RAW_TEMPLATE}:\n${content}\n- ${msg}`);
        }
    }, 
    /**
     * 常见的两种情况：
     *
     * <div>
     *    <input>1
     * </div>
     *
     * <div>
     *    <input>
     * </div>
     */
    popSelfClosingElementIfNeeded = function (popingTagName) {
        const lastNode = array.last(nodeStack);
        if (lastNode && lastNode.type === nodeType.ELEMENT) {
            const element = lastNode;
            if (element.tag !== popingTagName
                && array.has(selfClosingTagNames, element.tag)) {
                popStack(element.type, element.tag);
            }
        }
    }, popStack = function (type, tagName) {
        const node = array.pop(nodeStack);
        if (node && node.type === type) {
            const { children } = node, 
            // 优化单个子节点
            child = children && children.length === 1 && children[0], isElement = type === nodeType.ELEMENT, isAttribute = type === nodeType.ATTRIBUTE, isProperty = type === nodeType.PROPERTY, isDirective = type === nodeType.DIRECTIVE;
            const currentBranch = array.last(nodeStack);
            if (currentBranch) {
                if (currentBranch.isStatic && !node.isStatic) {
                    currentBranch.isStatic = env.FALSE;
                }
                if (!currentBranch.isComplex) {
                    if (node.isComplex || isElement) {
                        currentBranch.isComplex = env.TRUE;
                    }
                    // <div {{#if xx}} xx{{/if}}>
                    else if (currentElement
                        && currentElement !== currentBranch
                        && (isAttribute || isProperty || isDirective)) {
                        currentBranch.isComplex = env.TRUE;
                    }
                }
            }
            if (process.env.NODE_ENV === 'development') {
                if (isElement) {
                    const element = node;
                    if (tagName && element.tag !== tagName) {
                        fatal(`结束标签是${tagName}，开始标签却是${element.tag}`);
                    }
                }
            }
            // 除了 helper.specialAttrs 里指定的特殊属性，attrs 里的任何节点都不能单独拎出来赋给 element
            // 因为 attrs 可能存在 if，所以每个 attr 最终都不一定会存在
            if (child) {
                switch (child.type) {
                    case nodeType.TEXT:
                        // 属性的值如果是纯文本，直接获取文本值
                        // 减少渲染时的遍历
                        if (isElement) {
                            processElementSingleText(node, child);
                        }
                        else if (isAttribute) {
                            processAttributeSingleText(node, child);
                        }
                        else if (isProperty) {
                            processPropertySingleText(node, child);
                        }
                        else if (isDirective) {
                            processDirectiveSingleText(node, child);
                        }
                        break;
                    case nodeType.EXPRESSION:
                        if (isElement) {
                            processElementSingleExpression(node, child);
                        }
                        else if (isAttribute) {
                            processAttributeSingleExpression(node, child);
                        }
                        else if (isProperty) {
                            processPropertySingleExpression(node, child);
                        }
                        else if (isDirective) {
                            processDirectiveSingleExpression(node, child);
                        }
                        break;
                }
            }
            // 大于 1 个子节点，即有插值或 if 写法
            else if (children) {
                if (isDirective) {
                    processDirectiveMultiChildren();
                }
                // 元素层级
                else if (!currentElement) {
                    removeComment(children);
                    if (!children.length) {
                        node.children = env.UNDEFINED;
                    }
                }
            }
            // 0 个子节点
            else if (currentElement) {
                if (isAttribute) {
                    processAttributeEmptyChildren(currentElement, node);
                }
                else if (isProperty) {
                    processPropertyEmptyChildren(currentElement, node);
                }
                else if (isDirective) {
                    processDirectiveEmptyChildren(currentElement, node);
                }
            }
            if (type === nodeType.EACH) {
                checkEach(node);
            }
            else if (type === nodeType.PARTIAL) {
                checkPartial(node);
            }
            else if (isElement) {
                checkElement(node);
            }
            else if (currentElement) {
                if (isAttribute) {
                    if (isSpecialAttr(currentElement, node)) {
                        bindSpecialAttr(currentElement, node);
                    }
                }
                else if (isDirective) {
                    checkDirective(currentElement, node);
                }
            }
            return node;
        }
        if (process.env.NODE_ENV === 'development') {
            fatal(`出栈节点类型不匹配`);
        }
    }, removeComment = function (children) {
        // 类似 <!-- xx {{name}} yy {{age}} zz --> 这样的注释里包含插值
        // 按照目前的解析逻辑，是根据定界符进行模板分拆
        // 一旦出现插值，children 长度必然大于 1
        let openIndex = env.RAW_MINUS_ONE, openText = env.EMPTY_STRING, closeIndex = env.RAW_MINUS_ONE, closeText = env.EMPTY_STRING;
        array.each(children, function (child, index) {
            if (child.type === nodeType.TEXT) {
                if (closeIndex >= 0) {
                    openText = child.text;
                    // 处理 <!-- <!-- 这样有多个的情况
                    while (openCommentPattern.test(openText)) {
                        openText = RegExp.$1;
                        openIndex = index;
                    }
                    if (openIndex >= 0) {
                        // openIndex 肯定小于 closeIndex，因为完整的注释在解析过程中会被干掉
                        // 只有包含插值的注释才会走进这里
                        // 现在要确定开始和结束的文本节点，是否包含正常文本
                        if (openText) {
                            children[openIndex].text = openText;
                            openIndex++;
                        }
                        if (closeText) {
                            children[closeIndex].text = closeText;
                            closeIndex--;
                        }
                        children.splice(openIndex, closeIndex - openIndex + 1);
                        openIndex = closeIndex = env.RAW_MINUS_ONE;
                    }
                }
                else {
                    closeText = child.text;
                    // 处理 --> --> 这样有多个的情况
                    while (closeCommentPattern.test(closeText)) {
                        closeText = RegExp.$1;
                        closeIndex = index;
                    }
                }
            }
        }, env.TRUE);
    }, processDirectiveMultiChildren = function () {
        // 不支持 on-click="1{{xx}}2" 或是 on-click="1{{#if x}}x{{else}}y{{/if}}2"
        // 1. 很难做性能优化
        // 2. 全局搜索不到事件名，不利于代码维护
        // 3. 不利于编译成静态函数
        if (process.env.NODE_ENV === 'development') {
            fatal(`指令的值不能用插值或 if 语法`);
        }
    }, processElementSingleText = function (element, child) {
        // processElementSingleText 和 processElementSingleExpression
        // 不把元素子节点智能转换为 textContent property
        // 因为子节点还有 <div>1{{a}}{{b}}</div> 这样的情况
        // 还是在序列化的时候统一处理比较好
    }, processElementSingleExpression = function (element, child) {
        if (!element.isComponent && !element.slot && !child.safe) {
            element.html = child.expr;
            element.children = env.UNDEFINED;
        }
    }, processPropertyEmptyChildren = function (element, prop) {
        if (prop.hint === config.HINT_BOOLEAN) {
            prop.value = env.TRUE;
        }
        else {
            // string 或 number 类型的属性，如果不写值，直接忽略
            replaceChild(prop);
        }
    }, processPropertySingleText = function (prop, child) {
        const { text } = child;
        if (prop.hint === config.HINT_NUMBER) {
            prop.value = toNumber(text);
        }
        else if (prop.hint === config.HINT_BOOLEAN) {
            prop.value = text === env.RAW_TRUE || text === prop.name;
        }
        else {
            prop.value = text;
        }
        prop.children = env.UNDEFINED;
    }, processPropertySingleExpression = function (prop, child) {
        const { expr } = child;
        prop.expr = expr;
        prop.children = env.UNDEFINED;
        // 对于有静态路径的表达式，可转为单向绑定指令，可实现精确更新视图，如下
        // <div class="{{className}}">
        if (expr.type === exprNodeType.IDENTIFIER) {
            prop.binding = env.TRUE;
        }
    }, processAttributeEmptyChildren = function (element, attr) {
        const { name } = attr;
        if (isSpecialAttr(element, attr)) {
            if (process.env.NODE_ENV === 'development') {
                fatal(`${name} 忘了写值吧？`);
            }
        }
        // 比如 <Dog isLive>
        else if (element.isComponent) {
            attr.value = env.TRUE;
        }
        // <div data-name checked>
        else {
            attr.value = string.startsWith(name, 'data-')
                ? env.EMPTY_STRING
                : name;
        }
    }, processAttributeSingleText = function (attr, child) {
        attr.value = child.text;
        attr.children = env.UNDEFINED;
    }, processAttributeSingleExpression = function (attr, child) {
        const { expr } = child;
        attr.expr = expr;
        attr.children = env.UNDEFINED;
        // 对于有静态路径的表达式，可转为单向绑定指令，可实现精确更新视图，如下
        // <div class="{{className}}">
        if (expr.type === exprNodeType.IDENTIFIER) {
            attr.binding = env.TRUE;
        }
    }, processDirectiveEmptyChildren = function (element, directive) {
        directive.value = env.TRUE;
    }, processDirectiveSingleText = function (directive, child) {
        let { text } = child, 
        // model="xx" model="this.x" 值只能是标识符或 Member
        isModel = directive.ns === config.DIRECTIVE_MODEL, 
        // lazy 的值必须是大于 0 的数字
        isLazy = directive.ns === config.DIRECTIVE_LAZY, 
        // 校验事件名称
        isEvent = directive.ns === config.DIRECTIVE_EVENT, 
        // 自定义指令运行不合法的表达式
        isCustom = directive.ns === config.DIRECTIVE_CUSTOM, 
        // 指令的值是纯文本，可以预编译表达式，提升性能
        expr;
        try {
            expr = exprCompiler.compile(text);
        }
        catch (e) { }
        if (expr) {
            if (process.env.NODE_ENV === 'development') {
                const { raw } = expr;
                if (isLazy) {
                    if (expr.type !== exprNodeType.LITERAL
                        || !is.number(expr.value)
                        || expr.value <= 0) {
                        fatal(`lazy 指令的值 [${raw}] 必须是大于 0 的数字`);
                    }
                }
                // 如果指令表达式是函数调用，则只能调用方法（难道还有别的可以调用的吗？）
                else if (expr.type === exprNodeType.CALL) {
                    if (expr.name.type !== exprNodeType.IDENTIFIER) {
                        fatal('指令表达式的类型如果是函数调用，则只能调用方法');
                    }
                }
                // 上面检测过方法调用，接下来事件指令只需要判断是否以下两种格式：
                // on-click="name" 或 on-click="name.namespace"
                else if (isEvent) {
                    if (!eventPattern.test(raw) && !eventNamespacePattern.test(raw)) {
                        fatal('事件转换名称只能是 [name] 或 [name.namespace] 格式');
                    }
                    else if (currentElement
                        && currentElement.isComponent
                        && directive.name === raw) {
                        fatal('转换组件事件的名称不能相同');
                    }
                }
                if (isModel && expr.type !== exprNodeType.IDENTIFIER) {
                    fatal(`model 指令的值格式错误: [${raw}]`);
                }
            }
            directive.expr = expr;
            directive.value = expr.type === exprNodeType.LITERAL
                ? expr.value
                : text;
        }
        else {
            if (process.env.NODE_ENV === 'development') {
                if (!isCustom) {
                    fatal(`${directive.ns} 指令的表达式错误: [${text}]`);
                }
            }
            directive.value = text;
        }
        directive.children = env.UNDEFINED;
    }, processDirectiveSingleExpression = function (directive, child) {
        if (process.env.NODE_ENV === 'development') {
            fatal(`指令的表达式不能用插值语法`);
        }
    }, checkCondition = function (condition) {
        let currentNode = condition, prevNode, hasChildren, hasNext;
        while (env.TRUE) {
            if (currentNode.children) {
                if (!hasNext) {
                    if (currentNode.next) {
                        delete currentNode.next;
                    }
                }
                hasChildren = hasNext = env.TRUE;
            }
            prevNode = currentNode.prev;
            if (prevNode) {
                // prev 仅仅用在 checkCondition 函数中
                // 用完就可以删掉了
                delete currentNode.prev;
                currentNode = prevNode;
            }
            else {
                break;
            }
        }
        // 每个条件都是空内容，则删掉整个 if
        if (!hasChildren) {
            replaceChild(currentNode);
        }
    }, checkEach = function (each) {
        // 没内容就干掉
        if (!each.children) {
            replaceChild(each);
        }
    }, checkPartial = function (partial) {
        // 没内容就干掉
        if (!partial.children) {
            replaceChild(partial);
        }
    }, checkElement = function (element) {
        const { tag, attrs, slot, children } = element, isTemplate = tag === env.RAW_TEMPLATE;
        if (process.env.NODE_ENV === 'development') {
            if (isTemplate) {
                if (element.key) {
                    fatal(`<template> 不支持 key`);
                }
                else if (element.ref) {
                    fatal(`<template> 不支持 ref`);
                }
                else if (attrs) {
                    fatal(`<template> 不支持属性或指令`);
                }
                else if (!slot) {
                    fatal(`<template> 不写 slot 属性是几个意思？`);
                }
            }
        }
        // 没有子节点，则意味着这个插槽没任何意义
        if (isTemplate && slot && !children) {
            replaceChild(element);
        }
        // <slot /> 如果没写 name，自动加上默认名称
        else if (tag === env.RAW_SLOT && !element.name) {
            element.name = config.SLOT_NAME_DEFAULT;
        }
        // 补全 style 标签的 type
        // style 如果没有 type 则加一个 type="text/css"
        // 因为低版本 IE 没这个属性，没法正常渲染样式
        else {
            let hasType = env.FALSE, hasValue = env.FALSE;
            if (attrs) {
                array.each(attrs, function (attr) {
                    const name = attr.type === nodeType.PROPERTY
                        ? attr.name
                        : env.UNDEFINED;
                    if (name === 'type') {
                        hasType = env.TRUE;
                    }
                    else if (name === env.RAW_VALUE) {
                        hasValue = env.TRUE;
                    }
                });
            }
            if (element.isStyle && !hasType) {
                array.push(element.attrs || (element.attrs = []), creator.createProperty('type', config.HINT_STRING, 'text/css'));
            }
            // 低版本 IE 需要给 option 标签强制加 value
            else if (tag === 'option' && !hasValue) {
                element.isOption = env.TRUE;
            }
        }
    }, checkDirective = function (element, directive) {
        if (process.env.NODE_ENV === 'development') {
            // model 不能写在 if 里，影响节点的静态结构
            if (directive.ns === config.DIRECTIVE_MODEL) {
                if (array.last(nodeStack) !== element) {
                    fatal(`model 不能写在 if 内`);
                }
            }
        }
    }, bindSpecialAttr = function (element, attr) {
        const { name, value } = attr, 
        // 这三个属性值要求是字符串
        isStringValueRequired = name === env.RAW_NAME || name === env.RAW_SLOT;
        if (process.env.NODE_ENV === 'development') {
            // 因为要拎出来给 element，所以不能用 if
            if (array.last(nodeStack) !== element) {
                fatal(`${name} 不能写在 if 内`);
            }
            // 对于所有特殊属性来说，空字符串是肯定不行的，没有任何意义
            if (value === env.EMPTY_STRING) {
                fatal(`${name} 的值不能是空字符串`);
            }
            else if (isStringValueRequired && string.falsy(value)) {
                fatal(`${name} 的值只能是字符串字面量`);
            }
        }
        element[name] = isStringValueRequired ? value : attr;
        replaceChild(attr);
    }, isSpecialAttr = function (element, attr) {
        return helper.specialAttrs[attr.name]
            || element.tag === env.RAW_SLOT && attr.name === env.RAW_NAME;
    }, replaceChild = function (oldNode, newNode) {
        let currentBranch = array.last(nodeStack), isAttr, list, index;
        if (currentBranch) {
            isAttr = currentElement && currentElement === currentBranch;
            list = isAttr
                ? currentBranch.attrs
                : currentBranch.children;
        }
        else {
            list = nodeList;
        }
        if (list) {
            index = array.indexOf(list, oldNode);
            if (index >= 0) {
                if (newNode) {
                    list[index] = newNode;
                }
                else {
                    list.splice(index, 1);
                    if (currentBranch && !list.length) {
                        if (isAttr) {
                            delete currentBranch.attrs;
                        }
                        else {
                            currentBranch.children = env.UNDEFINED;
                        }
                    }
                }
            }
        }
    }, addChild = function (node) {
        /**
         * <div>
         *    <input>
         *    <div></div>
         * </div>
         *
         * <div>
         *    <input>xxx
         * </div>
         */
        if (!currentElement) {
            popSelfClosingElementIfNeeded();
        }
        const type = node.type, currentBranch = array.last(nodeStack);
        // else 系列只是 if 的递进节点，不需要加入 nodeList
        if (type === nodeType.ELSE || type === nodeType.ELSE_IF) {
            const lastNode = array.pop(ifStack);
            if (lastNode) {
                // 方便 checkCondition 逆向遍历
                node.prev = lastNode;
                // lastNode 只能是 if 或 else if 节点
                if (lastNode.type === nodeType.ELSE_IF || lastNode.type === nodeType.IF) {
                    lastNode.next = node;
                    popStack(lastNode.type);
                    array.push(ifStack, node);
                }
                else if (type === nodeType.ELSE_IF) {
                    if (process.env.NODE_ENV === 'development') {
                        fatal('else 后面不能跟 else if 啊');
                    }
                }
                else if (process.env.NODE_ENV === 'development') {
                    fatal('只能写一个 else 啊');
                }
            }
            else if (process.env.NODE_ENV === 'development') {
                fatal('不写 if 是几个意思');
            }
        }
        else {
            if (currentBranch) {
                array.push(
                // 这里不能写 currentElement && !currentAttribute，举个例子
                //
                // <div id="x" {{#if}} name="xx" alt="xx" {{/if}}
                //
                // 当 name 属性结束后，条件满足，但此时已不是元素属性层级了
                currentElement && currentBranch.type === nodeType.ELEMENT
                    ? currentElement.attrs || (currentElement.attrs = [])
                    : currentBranch.children || (currentBranch.children = []), node);
            }
            else {
                array.push(nodeList, node);
            }
            if (type === nodeType.IF) {
                // 只要是 if 节点，并且和 element 同级，就加上 stub
                // 方便 virtual dom 进行对比
                // 这个跟 virtual dom 的实现原理密切相关，不加 stub 会有问题
                if (!currentElement) {
                    node.stub = env.TRUE;
                }
                array.push(ifStack, node);
            }
        }
        if (node.isLeaf) {
            // 当前树枝节点如果是静态的，一旦加入了一个非静态子节点，改变当前树枝节点的 isStatic
            // 这里不处理树枝节点的进栈，因为当树枝节点出栈时，还有一次处理机会，那时它的 isStatic 已确定下来，不会再变
            if (currentBranch) {
                if (currentBranch.isStatic && !node.isStatic) {
                    currentBranch.isStatic = env.FALSE;
                }
                // 当前树枝节点是简单节点，一旦加入了一个复杂子节点，当前树枝节点变为复杂节点
                if (!currentBranch.isComplex && node.isComplex) {
                    currentBranch.isComplex = env.TRUE;
                }
            }
        }
        else {
            array.push(nodeStack, node);
        }
    }, addTextChild = function (text) {
        // [注意]
        // 这里不能随便删掉
        // 因为收集组件的子节点会受影响，举个例子：
        // <Component>
        //
        // </Component>
        // 按现在的逻辑，这样的组件是没有子节点的，因为在这里过滤掉了，因此该组件没有 slot
        // 如果这里放开了，组件就会有一个 slot
        // trim 文本开始和结束位置的换行符
        text = text.replace(breaklinePattern, env.EMPTY_STRING);
        if (text) {
            addChild(creator.createText(text));
        }
    }, htmlParsers = [
        function (content) {
            if (!currentElement) {
                const match = content.match(tagPattern);
                // 必须以 <tag 开头才能继续
                // 如果 <tag 前面有别的字符，会走进第四个 parser
                if (match && match.index === 0) {
                    const tag = match[2];
                    if (match[1] === '/') {
                        /**
                         * 处理可能存在的自闭合元素，如下
                         *
                         * <div>
                         *    <input>
                         * </div>
                         */
                        popSelfClosingElementIfNeeded(tag);
                        popStack(nodeType.ELEMENT, tag);
                    }
                    else {
                        /**
                         * template 只能写在组件的第一级，如下：
                         *
                         * <Component>
                         *   <template slot="xx">
                         *     111
                         *   </template>
                         * </Component>
                         */
                        if (process.env.NODE_ENV === 'development') {
                            if (tag === env.RAW_TEMPLATE) {
                                const lastNode = array.last(nodeStack);
                                if (!lastNode || !lastNode.isComponent) {
                                    fatal('<template> 只能写在组件标签内');
                                }
                            }
                        }
                        const node = creator.createElement(tag, array.has(svgTagNames, tag), componentNamePattern.test(tag));
                        addChild(node);
                        currentElement = node;
                    }
                    return match[0];
                }
            }
        },
        // 处理标签的 > 或 />，不论开始还是结束标签
        function (content) {
            const match = content.match(selfClosingTagPattern);
            if (match) {
                // 处理开始标签的 > 或 />
                if (currentElement && !currentAttribute) {
                    // 自闭合标签
                    if (match[1] === '/') {
                        popStack(currentElement.type, currentElement.tag);
                    }
                    currentElement = env.UNDEFINED;
                }
                // 处理结束标签的 >
                return match[0];
            }
        },
        // 处理 attribute directive 的 name 部分
        function (content) {
            // 当前在 element 层级
            if (currentElement && !currentAttribute) {
                const match = content.match(attributePattern);
                if (match) {
                    // <div class="11 name="xxx"></div>
                    // 这里会匹配上 xxx"，match[2] 就是那个引号
                    if (process.env.NODE_ENV === 'development') {
                        if (match[2]) {
                            fatal(`上一个属性似乎没有正常结束`);
                        }
                    }
                    let node, name = match[1];
                    if (name === config.DIRECTIVE_MODEL || name === env.RAW_TRANSITION) {
                        node = creator.createDirective(string.camelize(name), env.EMPTY_STRING);
                    }
                    // 这里要用 on- 判断前缀，否则 on 太容易重名了
                    else if (string.startsWith(name, config.DIRECTIVE_ON + directiveSeparator)) {
                        const event = slicePrefix(name, config.DIRECTIVE_ON + directiveSeparator);
                        if (process.env.NODE_ENV === 'development') {
                            if (!event) {
                                fatal('缺少事件名称');
                            }
                        }
                        node = creator.createDirective(config.DIRECTIVE_EVENT, string.camelize(event));
                    }
                    // 当一个元素绑定了多个事件时，可分别指定每个事件的 lazy
                    // 当只有一个事件时，可简写成 lazy
                    // <div on-click="xx" lazy-click
                    else if (string.startsWith(name, config.DIRECTIVE_LAZY)) {
                        let lazy = slicePrefix(name, config.DIRECTIVE_LAZY);
                        if (string.startsWith(lazy, directiveSeparator)) {
                            lazy = slicePrefix(lazy, directiveSeparator);
                        }
                        node = creator.createDirective(config.DIRECTIVE_LAZY, lazy ? string.camelize(lazy) : env.EMPTY_STRING);
                    }
                    // 这里要用 o- 判断前缀，否则 o 太容易重名了
                    else if (string.startsWith(name, config.DIRECTIVE_CUSTOM + directiveSeparator)) {
                        const custom = slicePrefix(name, config.DIRECTIVE_CUSTOM + directiveSeparator);
                        if (process.env.NODE_ENV === 'development') {
                            if (!custom) {
                                fatal('缺少自定义指令名称');
                            }
                        }
                        node = creator.createDirective(config.DIRECTIVE_CUSTOM, string.camelize(custom));
                    }
                    else {
                        // 组件用驼峰格式
                        if (currentElement.isComponent) {
                            node = creator.createAttribute(string.camelize(name));
                        }
                        // 原生 dom 属性
                        else {
                            // 把 attr 优化成 prop
                            const lowerName = string.lower(name);
                            // <slot> 、<template> 或 svg 中的属性不用识别为 property
                            if (helper.specialTags[currentElement.tag] || currentElement.isSvg) {
                                node = creator.createAttribute(name);
                            }
                            // 尝试识别成 property
                            else if (array.has(stringProperyNames, lowerName)) {
                                node = creator.createProperty(attr2Prop[lowerName] || lowerName, config.HINT_STRING);
                            }
                            else if (array.has(numberProperyNames, lowerName)) {
                                node = creator.createProperty(attr2Prop[lowerName] || lowerName, config.HINT_NUMBER);
                            }
                            else if (array.has(booleanProperyNames, lowerName)) {
                                node = creator.createProperty(attr2Prop[lowerName] || lowerName, config.HINT_BOOLEAN);
                            }
                            // 没辙，还是个 attribute
                            else {
                                node = creator.createAttribute(name);
                            }
                        }
                    }
                    addChild(node);
                    // 这里先记下，下一个 handler 要匹配结束引号
                    startQuote = match[3];
                    // 有属性值才需要设置 currentAttribute，便于后续收集属性值
                    if (startQuote) {
                        currentAttribute = node;
                    }
                    else {
                        popStack(node.type);
                    }
                    return match[0];
                }
            }
        },
        function (content) {
            let text, match;
            // 处理 attribute directive 的 value 部分
            if (currentAttribute && startQuote) {
                match = content.match(patternCache[startQuote] || (patternCache[startQuote] = new RegExp(startQuote)));
                // 有结束引号
                if (match) {
                    text = string.slice(content, 0, match.index);
                    addTextChild(text);
                    text += startQuote;
                    // attribute directive 结束了
                    // 此时如果一个值都没收集到，需设置一个空字符串
                    // 否则无法区分 <div a b=""> 中的 a 和 b
                    if (!currentAttribute.children) {
                        addChild(creator.createText(env.EMPTY_STRING));
                    }
                    popStack(currentAttribute.type);
                    currentAttribute = env.UNDEFINED;
                }
                // 没有结束引号，整段匹配
                // 如 id="1{{x}}2" 中的 1
                else if (blockMode !== BLOCK_MODE_NONE) {
                    text = content;
                    addTextChild(text);
                }
                else if (process.env.NODE_ENV === 'development') {
                    fatal(`${currentAttribute.name} 没有找到结束引号`);
                }
            }
            // 如果不加判断，类似 <div {{...obj}}> 这样写，会把空格当做一个属性
            // 收集文本只有两处：属性值、元素内容
            // 属性值通过上面的 if 处理过了，这里只需要处理元素内容
            else if (!currentElement) {
                // 获取 <tag 前面的字符
                match = content.match(tagPattern);
                // 元素层级的注释都要删掉
                if (match) {
                    text = string.slice(content, 0, match.index);
                    if (text) {
                        addTextChild(text.replace(commentPattern, env.EMPTY_STRING));
                    }
                }
                else {
                    text = content;
                    addTextChild(text.replace(commentPattern, env.EMPTY_STRING));
                }
            }
            else {
                if (process.env.NODE_ENV === 'development') {
                    if (string.trim(content)) {
                        fatal(`<${currentElement.tag}> 属性里不要写乱七八糟的字符`);
                    }
                }
                text = content;
            }
            return text;
        },
    ], blockParsers = [
        // {{#each xx:index}}
        function (source) {
            if (string.startsWith(source, config.SYNTAX_EACH)) {
                if (process.env.NODE_ENV === 'development') {
                    if (currentElement) {
                        fatal(currentAttribute
                            ? `each 不能写在属性的值里`
                            : `each 不能写在属性层级`);
                    }
                }
                source = slicePrefix(source, config.SYNTAX_EACH);
                const terms = source.replace(/\s+/g, env.EMPTY_STRING).split(':');
                if (terms[0]) {
                    const literal = string.trim(terms[0]), index = string.trim(terms[1]), match = literal.match(rangePattern);
                    if (match) {
                        const parts = literal.split(rangePattern), from = exprCompiler.compile(parts[0]), to = exprCompiler.compile(parts[2]);
                        if (from && to) {
                            return creator.createEach(from, to, string.trim(match[1]) === '=>', index);
                        }
                    }
                    else {
                        const expr = exprCompiler.compile(literal);
                        if (expr) {
                            return creator.createEach(expr, env.UNDEFINED, env.FALSE, index);
                        }
                    }
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`无效的 each`);
                }
            }
        },
        // {{#import name}}
        function (source) {
            if (string.startsWith(source, config.SYNTAX_IMPORT)) {
                source = slicePrefix(source, config.SYNTAX_IMPORT);
                if (source) {
                    if (!currentElement) {
                        return creator.createImport(source);
                    }
                    else if (process.env.NODE_ENV === 'development') {
                        fatal(currentAttribute
                            ? `import 不能写在属性的值里`
                            : `import 不能写在属性层级`);
                    }
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`无效的 import`);
                }
            }
        },
        // {{#partial name}}
        function (source) {
            if (string.startsWith(source, config.SYNTAX_PARTIAL)) {
                source = slicePrefix(source, config.SYNTAX_PARTIAL);
                if (source) {
                    if (!currentElement) {
                        return creator.createPartial(source);
                    }
                    else if (process.env.NODE_ENV === 'development') {
                        fatal(currentAttribute
                            ? `partial 不能写在属性的值里`
                            : `partial 不能写在属性层级`);
                    }
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`无效的 partial`);
                }
            }
        },
        // {{#if expr}}
        function (source) {
            if (string.startsWith(source, config.SYNTAX_IF)) {
                source = slicePrefix(source, config.SYNTAX_IF);
                const expr = exprCompiler.compile(source);
                if (expr) {
                    return creator.createIf(expr);
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`无效的 if`);
                }
            }
        },
        // {{else if expr}}
        function (source) {
            if (string.startsWith(source, config.SYNTAX_ELSE_IF)) {
                source = slicePrefix(source, config.SYNTAX_ELSE_IF);
                const expr = exprCompiler.compile(source);
                if (expr) {
                    return creator.createElseIf(expr);
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`无效的 else if`);
                }
            }
        },
        // {{else}}
        function (source) {
            if (string.startsWith(source, config.SYNTAX_ELSE)) {
                source = slicePrefix(source, config.SYNTAX_ELSE);
                if (!string.trim(source)) {
                    return creator.createElse();
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`else 后面不要写乱七八糟的东西`);
                }
            }
        },
        // {{...obj}}
        function (source) {
            if (string.startsWith(source, config.SYNTAX_SPREAD)) {
                source = slicePrefix(source, config.SYNTAX_SPREAD);
                const expr = exprCompiler.compile(source);
                if (expr) {
                    if (currentElement && currentElement.isComponent) {
                        return creator.createSpread(expr, expr.type === exprNodeType.IDENTIFIER);
                    }
                    else if (process.env.NODE_ENV === 'development') {
                        fatal(`延展属性只能用于组件属性`);
                    }
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`无效的 spread`);
                }
            }
        },
        // {{expr}}
        function (source) {
            if (!config.SYNTAX_COMMENT.test(source)) {
                source = string.trim(source);
                const expr = exprCompiler.compile(source);
                if (expr) {
                    return creator.createExpression(expr, blockMode === BLOCK_MODE_SAFE);
                }
                if (process.env.NODE_ENV === 'development') {
                    fatal(`无效的 expression`);
                }
            }
        },
    ], parseHtml = function (code) {
        while (code) {
            array.each(htmlParsers, function (parse) {
                const match = parse(code);
                if (match) {
                    code = string.slice(code, match.length);
                    return env.FALSE;
                }
            });
        }
    }, parseBlock = function (code) {
        if (string.charAt(code) === '/') {
            /**
             * 处理可能存在的自闭合元素，如下
             *
             * {{#if xx}}
             *    <input>
             * {{/if}}
             */
            popSelfClosingElementIfNeeded();
            const name = string.slice(code, 1);
            let type = helper.name2Type[name], isCondition = env.FALSE;
            if (type === nodeType.IF) {
                const node = array.pop(ifStack);
                if (node) {
                    type = node.type;
                    isCondition = env.TRUE;
                }
                else if (process.env.NODE_ENV === 'development') {
                    fatal(`if 还没开始就结束了？`);
                }
            }
            const node = popStack(type);
            if (node && isCondition) {
                checkCondition(node);
            }
        }
        else {
            // 开始下一个 block 或表达式
            array.each(blockParsers, function (parse) {
                const node = parse(code);
                if (node) {
                    addChild(node);
                    return env.FALSE;
                }
            });
        }
    }, closeBlock = function () {
        // 确定开始和结束定界符能否配对成功，即 {{ 对 }}，{{{ 对 }}}
        // 这里不能动 openBlockIndex 和 closeBlockIndex，因为等下要用他俩 slice
        index = closeBlockIndex + 2;
        // 这里要用 <=，因为很可能到头了
        if (index <= length) {
            if (index < length && string.charAt(content, index) === '}') {
                if (blockMode === BLOCK_MODE_UNSAFE) {
                    nextIndex = index + 1;
                }
                else {
                    fatal(`{{ 和 }}} 无法配对`);
                }
            }
            else {
                if (blockMode === BLOCK_MODE_SAFE) {
                    nextIndex = index;
                }
                else {
                    fatal(`{{{ 和 }} 无法配对`);
                }
            }
            array.pop(blockStack);
            // }} 左侧的位置
            addIndex(closeBlockIndex);
            openBlockIndex = string.indexOf(content, '{{', nextIndex);
            closeBlockIndex = string.indexOf(content, '}}', nextIndex);
            // 如果碰到连续的结束定界符，继续 close
            if (closeBlockIndex >= nextIndex
                && (openBlockIndex < 0 || closeBlockIndex < openBlockIndex)) {
                return closeBlock();
            }
        }
        else {
            // 到头了
            return env.TRUE;
        }
    }, addIndex = function (index) {
        if (!blockStack.length) {
            array.push(indexList, index);
        }
    };
    // 因为存在 mustache 注释内包含插值的情况
    // 这里把流程设计为先标记切片的位置，标记过程中丢弃无效的 block
    // 最后处理有效的 block
    while (env.TRUE) {
        addIndex(nextIndex);
        openBlockIndex = string.indexOf(content, '{{', nextIndex);
        if (openBlockIndex >= nextIndex) {
            blockMode = BLOCK_MODE_SAFE;
            // {{ 左侧的位置
            addIndex(openBlockIndex);
            // 跳过 {{
            openBlockIndex += 2;
            // {{ 后面总得有内容吧
            if (openBlockIndex < length) {
                if (string.charAt(content, openBlockIndex) === '{') {
                    blockMode = BLOCK_MODE_UNSAFE;
                    openBlockIndex++;
                }
                // {{ 右侧的位置
                addIndex(openBlockIndex);
                // block 是否安全
                addIndex(blockMode);
                // 打开一个 block 就入栈一个
                array.push(blockStack, env.TRUE);
                if (openBlockIndex < length) {
                    closeBlockIndex = string.indexOf(content, '}}', openBlockIndex);
                    if (closeBlockIndex >= openBlockIndex) {
                        // 注释可以嵌套，如 {{！  {{xx}} {{! {{xx}} }}  }}
                        nextIndex = string.indexOf(content, '{{', openBlockIndex);
                        if (nextIndex < 0 || closeBlockIndex < nextIndex) {
                            if (closeBlock()) {
                                break;
                            }
                        }
                    }
                    else if (process.env.NODE_ENV === 'development') {
                        fatal('找不到结束定界符');
                    }
                }
                else if (process.env.NODE_ENV === 'development') {
                    fatal('{{{ 后面没字符串了？');
                }
            }
            else if (process.env.NODE_ENV === 'development') {
                fatal('{{ 后面没字符串了？');
            }
        }
        else {
            break;
        }
    }
    for (let i = 0, length = indexList.length; i < length; i += 5) {
        index = indexList[i];
        // {{ 左侧的位置
        openBlockIndex = indexList[i + 1];
        if (openBlockIndex) {
            parseHtml(string.slice(content, index, openBlockIndex));
        }
        // {{ 右侧的位置
        openBlockIndex = indexList[i + 2];
        blockMode = indexList[i + 3];
        closeBlockIndex = indexList[i + 4];
        if (closeBlockIndex) {
            code = string.trim(string.slice(content, openBlockIndex, closeBlockIndex));
            // 不用处理 {{ }} 和 {{{ }}} 这种空 block
            if (code) {
                parseBlock(code);
            }
        }
        else {
            blockMode = BLOCK_MODE_NONE;
            parseHtml(string.slice(content, index));
        }
    }
    if (nodeStack.length) {
        /**
         * 处理可能存在的自闭合元素，如下
         *
         * <input>
         */
        popSelfClosingElementIfNeeded();
        if (process.env.NODE_ENV === 'development') {
            if (nodeStack.length) {
                fatal('还有节点未出栈');
            }
        }
    }
    if (nodeList.length > 0) {
        removeComment(nodeList);
    }
    return nodeList;
}
