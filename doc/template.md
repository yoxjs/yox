## 定界符

Yox 采用了 `Mustache` 的定界符： `{{` 和 `}}`，我们认为这个设计非常好，如下：

```html
<div>
  {{name}}
</div>
```

> Yox 不支持自定义定界符，没有理由不选最好的设计。

## 注释

支持 `HTML` 注释语法，学习成本为零。

```html
<div>
  <!-- 单行注释 -->
</div>
```

```html
<div>
  <!--
      多行注释
  -->
</div>
```

## 插值

顾名思义，插值表示把一个 `表达式` 的值插入到模板中，如下：

```html
<div id="{{id}}">
  {{name}}
</div>
```

插值有两种使用场景：**属性值** 和 **子节点**。

### 属性值

如果属性值需要从 `data` 中读取，可使用插值，如下：

```html
<input type="checkbox" checked="{{isChecked}}">
```

当 `isChecked` 为 `true` 时，`input` 会自动勾选。

#### 属性类型

Yox 会自动识别常见的属性的类型，如下：

* `number`: min minlength max maxlength step width height size rows cols tabindex
* `boolean`: disabled checked required multiple readonly autofocus autoplay controls loop muted novalidate draggable hidden spellcheck
* `string`: id class name value for accesskey title style src type href target alt placeholder preload poster wrap accept pattern dir autocomplete autocapitalize

当我们为这些属性设值时，请**尊重**它们的类型。

#### 插值数量

如果属性值只有一个插值，表达式的值会直接赋给属性值。

如果属性值包含 `多个插值` 或 `插值与字面量混用`，Yox 会把它们的值拼接起来，形成一个字符串，再赋给属性值，举例如下：

```html
<div class="{{class1}} {{class2}}" title="hello, {{name}}">
  balabala
</div>
```

### 子节点

子节点插值有两种类型：**安全插值** 和 **危险插值**。

### 安全插值

安全插值，表示值最终会设置到 `元素节点` 或 `文本节点` 的 `textContent` 属性上，因此它是**安全**的。

```html
<div>
  <!-- 不会出现加粗效果 -->
  {{'<b>title</b>'}}
</div>
```

### 危险插值

危险插值，表示值最终会设置到 `元素节点` 的 `innerHTML` 属性上，常用于渲染富文本。

```html
<div>
  <!-- 会出现加粗效果 -->
  {{{'<b>title</b>'}}}
</div>
```

危险插值必须独享一个元素，如下：

```html
<div>
  {{{expression}}}
</div>
```

不支持下面这种写法：

```html
<div>
  balabala...
  {{{expression}}}
  balabala...
</div>
```

> 请问这种怎么用 innerHTML？

## 条件判断

`if` 或 `else if` 后面紧跟一个表达式，语法和 `JavaScript` 完全一致。

```html
{{#if expression}}
    ...
{{else if expression}}
    ...
{{else}}
    ...
{{/if}}
```

> Mustache 的原版语法中，`[]` 被认为是 `false`，这个设计严重违背工程师的第一直觉，甚至很难几句话跟新人解释清楚。为了避免歧义和保持代码逻辑清晰，我们把它剔除了。
>
> 此外，有些模板引擎喜欢把 `else if` 写成 `elif` 或是 `elseif`，我就奇了怪了，跟 js 语法保持一致很难么？

判断非空数组的方式如下：

```html
{{#if !list || !list.length}}
  没有数据
{{else}}
  ...
{{/if}}
```

如果觉得麻烦，可以先注册一个 `isFalsyArray` 过滤器。

```js
Yox.filter({
  isFalsyArray: Yox.array.falsy
})
```

> Yox 暴露了一些 core 用到的工具库，比如 `Yox.array`

改进版

```html
{{#if isFalsyArray(list)}}
  没有数据
{{else}}
  ...
{{/if}}
```

## 循环数组

循环数组，一般有两种设计风格，一种是 `item in array`，一种是 `each`。

我们比较偏向 `each`，因为它可以省略 `item`，减少命名的脑力消耗。

```html
<div>
  {{#each array}}
    ...
  {{/each}}
</div>
```

### Index

如果循环过程中要用到数组下标，可通过 `[array]:[index]` 语法获取，如下：

```html
<div>
  {{#each array:index}}
    ...
  {{/each}}
</div>
```

常见的需求是判断数组的最后一项，对于 Yox 来说非常简单，只需 `if` 一下。

```html
<div>
  {{#each array:index}}
    {{#if index === array.length - 1}}
        ...
    {{/if}}
  {{/each}}
</div>
```

> 也许你认为 Yox 应该提供 @last 之类的语法糖，抱歉并没有，我们的考虑是减少记忆负担，况且实现这个功能只需要一行代码而已。

### 递进上下文

有别于其他模板语法，`each` 会导致数据 `context` 递进一层，举个例子：

数据

```js
{
  list: [
    {
      name: 'Jake',
      age: 1
    },
    {
      name: 'John',
      age: 2
    }
  ]
}
```

模板

```html
<div>
  {{#each list}}
    name: {{name}}<br>
    age: {{age}}
  {{/each}}
</div>
```

进入 `each` 之后，`context` 会切换成当前正在遍历的列表项，因此我们可以直接用 `{{name}}` 获取当前项的 `name` 属性。

这时你肯定会好奇，怎么获取**当前项**自身呢？

`Mustache` 原本设计了 `.` 语法获取当前 `context`，可是我们觉得不够自然，于是把 `.` 改成了 `this`。

```html
<div>
  {{#each list}}
    name: {{this.name}}<br>
    age: {{this.age}}
  {{/each}}
</div>
```

> 对于基本类型的数组来说，`this` 简直是唯一的救命稻草。

### 向上查找

先来看一个例子。

数据

```js
{
  selectedIndex: 1,
  list: [
    { name: 'Jake' },
    { name: 'John' }
  ]
}
```

模板

```html
<div>
  {{#each list:index}}
    {{#if index === selectedIndex}}
      已选中
    {{else}}
      未选中
    {{/if}}
  {{/each}}
</div>
```

我们在 `if` 条件中用到了 `selectedIndex`，但是列表项中并没有，于是会自动向上查找，发现上层的 `selectedIndex`。

向上查找，指的是数据被循环一分为二，循环的外部和内部拥有不同的 `context`。

这个例子可能表现的不够明确，为了加深印象，我们再来看一个例子。

数据

```js
{
  wrapper: {
    selectedIndex: 1,
    list: [
      { name: 'Jake' },
      { name: 'John' }
    ]
  }
}
```

模板

```html
<div>
  {{#each wrapper.list:index}}
    {{#if index === selectedIndex}}
      已选中
    {{else}}
      未选中
    {{/if}}
  {{/each}}
</div>
```

在这个例子中，数据被 `wrapper` 包了一层，且 `each` 直接用了 `wrapper.list`。

外层 `context` 只有一个 `wrapper` 对象，内层 `context` 则直接是列表项。当列表项找不到 `selectedIndex` 时，自动向外查找一层，也没有找到（因为只有一个 `wrapper` 对象）。

> 正确写法是 `index === wrapper.selectedIndex`。


### 禁止向上查找

向上查找确实好用，但它一层一层的向上尝试读取数据，必然会导致效率的低下，甚至有时候实际读取的数据可能并不是你想要的，举个例子：

数据

```js
{
  checked: true,
  list: [
    { name: 'Jake' },
    { name: 'John' }
  ]
}
```

模板

```html
<div>
  {{#each list:index}}
    <input type="checkbox" model="checked">
  {{/each}}
</div>
```

需求是为每个列表项加一个双向绑定，但列表项并没有 `checked`，可能是接口忘了传吧，Yox 发现上层正好有一个 `checked`，于是所有列表项都绑定到这个 `checked`。

在这个场景中，我们应该明确告知 Yox 数据在什么位置，如下：

```html
<div>
  {{#each list:index}}
    <input type="checkbox" model="this.checked">
  {{/each}}
</div>
```

加上 `this` 之后，绑定目标非常明确，即当前列表项的 `checked` 属性。即使当前列表项没有 `checked` 属性，Yox 也不会向上查找。

如果你依然想为所有列表项绑定到同一个 `checked`，同样很简单，加上 `../` 即可。

```html
<div>
  {{#each list:index}}
    <input type="checkbox" model="../checked">
  {{/each}}
</div>
```

