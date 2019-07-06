## 定界符

Yox 采用了 `Mustache` 的定界符： `{{` 和 `}}`。

```html
<div>
  {{name}}
</div>
```

> 目前不支持自定义定界符，如果对自定义定界符有刚需，请通过 [Issue](https://github.com/yoxjs/yox/issues/new) 清晰地描述使用场景。

## 注释

**推荐**使用 `HTML` 注释，天生语法高亮。

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

有时候，你会碰到需要注释属性的情况，如下：

```html
<div
  id="id"

  // 下面这些想暂时注释掉，而不想删掉
  class="class"
  title="title"
>

</div>
```

这时，你可以切换到 `Mustache` 注释，如下：

```html
<div
  id="id"

  {{!

  下面这些想暂时注释掉，而不想删掉

  class="class"
  title="title"

  }}
>

</div>
```

需要注意，`{{!` 后面必须紧跟一个空白符，可以是空格，也可以是换行符，反例如下：

```html
<div>
  <!-- 如果 ! 后面没有空白符，这不是取反操作嘛 -->
  {{!visible}}

  <!-- 这样就知道是注释啦 -->
  {{! visible}}
</div>
```

## 引用

通过 `ref` 获取模板里的 `元素节点` 或 `组件节点`，如下：

```html
<div>
  <!-- 引用元素 -->
  <video ref="video"></video>
  <!-- 引用组件 -->
  <Player ref="player" />
</div>
```

```js
{
  afterMount: function () {

    // 获取元素节点
    var video = this.$refs.video
    video.play()

    // 获取组件实例
    var player = this.$refs.player
    // 调用组件方法
    player.play()

  }
}
```

> `$refs` 在组件触发 `afterMount` 钩子函数之后可用

## 插值

顾名思义，插值表示把一个 `表达式` 的值插入到模板中，如下：

```html
<div id="{{id}}">
  {{name}}
</div>
```

插值有两个位置：**属性值** 和 **子节点**。

### 属性值

如果属性值需要从 `data` 中读取，可使用插值，如下：

```html
<input type="checkbox" checked="{{isChecked}}">
```

当 `isChecked` 为 `true` 时，`input` 会自动勾选。

#### 属性类型

Yox 会自动识别常见属性的类型，如下：

* `number`: min minlength max maxlength step width height size rows cols tabindex
* `boolean`: disabled checked required multiple readonly autofocus autoplay controls loop muted novalidate draggable hidden spellcheck
* `string`: id class name value for accesskey title style src type href target alt placeholder preload poster wrap accept pattern dir autocomplete autocapitalize

当我们为这些属性设值时，请**尊重**它们的类型。

如果这些属性的值是字面量，Yox 会自动转型，如下：

```html
<!--
  按照 HTML 的游戏规则，boolean 属性不写属性值表示 true
  作为扩展，值为字面量 true 也表示 true
-->
<input type="checkbox" disabled checked="true">
```

#### 插值数量

如果属性值只有一个插值，表达式的值会直接赋给属性值，即值的类型保持不变。

如果属性值包含 `多个插值` 或 `插值与字面量混用`，Yox 会把它们的值拼接起来，形成一个字符串，再赋给属性值，举例如下：

```html
<div class="{{class1}} {{class2}}" title="hello, {{name}}">
  balabala
</div>
```

### 子节点

子节点插值有两种类型：**安全插值** 和 **危险插值**。

#### 安全插值

安全插值，表示值最终会设置到 `元素节点` 或 `文本节点` 的 `textContent` 属性上，因此它是**安全**的。

```html
<div>
  <!-- 不会出现加粗效果 -->
  {{'<b>title</b>'}}
</div>
```

#### 危险插值

危险插值，表示值最终会设置到 `元素节点` 的 `innerHTML` 属性上，常用于渲染富文本。

```html
<div>
  <!-- 会出现加粗效果 -->
  {{{'<b>title</b>'}}}
</div>
```

危险插值必须独享一个 `元素节点`，如下：

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

> 请问 `文本节点` 哪来的 `innerHTML`？

## 条件判断

`if` 或 `else if` 后面紧跟一个表达式，语法和 `JavaScript` 完全一致。

```html
<div>
  {{#if expression}}
      ...
  {{else if expression}}
      ...
  {{else}}
      ...
  {{/if}}
</div>
```

此外，还可以在 `元素节点` 或 `组件节点` 的**属性**层级使用条件判断，如下：

```html
<div {{#if id}}id="{{id}}"{{/if}}
  class="{{#if class}}{{class}}{{else}}default{{/if}}">
  xxx
</div>
```

> 例子本身没有意义，纯粹演示功能。

在 `Mustache` 的语法中，`[]` 被认为是 `false`，这个特性严重违反直觉，为了避免歧义和保持代码逻辑清晰，我们并未采用。

Yox 判断非空数组的方式如下：

```html
<div>
  {{#if !list || !list.length}}
    没有数据
  {{else}}
    ...
  {{/if}}
</div>
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
<div>
  {{#if isFalsyArray(list)}}
    没有数据
  {{else}}
    ...
  {{/if}}
</div>
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

### 数组下标

如果循环过程中要用到数组下标，可通过 `[array]:[index]` 语法获取，如下：

```html
<div>
  {{#each array:index}}
    ...
  {{/each}}
</div>
```

对于 Yox 来说，判断数组的最后一项非常简单，只需 `if` 一下。

```html
<div>
  {{#each array:index}}
    {{#if index === $length - 1}}
        ...
    {{/if}}
  {{/each}}
</div>
```

> 关于 `$length` 参考 **模板** - **特殊变量**

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

### 自动向上查找

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

向上查找确实好用，但它一层一层的向上尝试读取数据，必然会影响性能，甚至有时候实际读取的数据可能并不是你想要的，举个例子：

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


## 循环对象

```html
<div>
  {{#each object:key}}
    ...
  {{/each}}
</div>
```

> 更多内容，参考**循环数组**


## 循环区间

区间，表示从一个数到另一个数，比如从 5 到 10，或者反过来，从 10 到 5。

> 仅支持整数区间循环，因为内部实现为 `for` 循环配合 `i++` 或 `i--`，强用小数出现浮点精度问题不要怪 Yox。

```html
<div>
  // 包含 to
  {{#each from => to:index}}
    ...
  {{/each}}

  // 不包含 to
  {{#each from -> to:index}}
    ...
  {{/each}}
</div>
```

> `from` 是起始的数字，`to` 是结束的数字，如果 `from` 大于 `to`，则递减循环，如果 `from` 小于 `to`，则递增循环。

当我们遇到一些特殊需求，循环区间比循环数组更自然 ，举个例子：

创建 5 颗星星，如果没有循环区间，只能先创建一个数组，再循环该数组。

数据

```js
{
  stars: new Array(5)
}
```

模板

```html
<div>
  {{#each stars:index}}
    <Star value="{{index + 1}}" />
  {{/each}}
</div>
```

使用循环区间则简单的多，不需要创建数组，直接开始写模板，如下：

```html
<div>
  {{#each 1 => 5}}
    <Star value="{{this}}" />
  {{/each}}
</div>
```

同样创建了 5 颗星星，还把当前值传给了 `value`。


## 延展属性

Yox 专门为 `组件` 的传值实现了延展属性，如下：

```html
<div>
  <Component {{...props}} />
</div>
```

> 不支持延展 HTML 元素属性，没必要

为了给组件传递大量的数据，也许你曾经写过这样的代码：

```html
<Component
  name="{{props.name}}"
  age="{{props.age}}"
  email="{{props.email}}"
  gender="{{props.gender}}"
  address="{{props.address}}"
/>
```

逐个传值，看起来只是体力劳动，它的风险在于，如果写错一个字母，`debug` 分分钟让你怀疑人生。

为了彻底消灭这个隐患，我们有情怀地实现了延展属性。


## 定义子模板

如果要在多个地方使用相同的模板，最好不要复制粘贴，而是应该使用子模板。

### 全局注册

对于复用性比较高的子模板，建议全局注册，如下：

```js
// 单个注册
Yox.partial('name', '<div>...</div>')

// 批量注册
Yox.partial({
  name1: '<div>...</div>',
  name2: '<div>...</div>',
  ...
})
```

### 本地注册

仅限于当前组件使用的子模板，建议本地注册，如下：

```js
{
   partials: {
    name1: '<div>...</div>',
    name2: '<div>...</div>',
  }
}
```

### 用时定义

如果觉得 `本地注册` 比较麻烦，也可以直接在组件模板里定义子模板，如下：

```html
<div>
  {{#partial name}}
    <div>
      ...
    </div>
  {{/partial}}
</div>
```

注意，用时定义的子模板，不会注册到组件实例中。

也就是说，用时定义和本地注册不是一回事。


## 导入子模板

查找子模板的顺序是 `用时定义` => `本地注册` => `全局注册`，三次尝试如果依然找不到子模板，则报错。

```html
<div>
  {{> partialName}}
</div>
```

## 过滤器

Yox 的过滤器采用了 `函数调用` 的方式，如下：

```html
<div>
    日期：{{formatDate(date)}}
</div>
```

### 全局注册

对于比较常用的过滤器，建议全局注册，如下：

```js
// 单个注册
Yox.filter('formatDate', function (date) {
  return 'x'
})

// 批量注册
Yox.filter({
  formatDate1: function (date) {
    return 'x1'
  },
  formatDate2: function (date) {
    return 'x2'
  }
})
```

如果项目用了 `underscore` 或 `lodash`，甚至可以注册整个库，如下：

```js
Yox.filter(_)
```

### 本地注册

对于比较冷门，通用性不强的过滤器，建议本地注册，如下：

```js
{
  filters: {
    formatName: function (name) {
      return 'balabala'
    }
  }
}
```


## Keypath

在前面介绍循环数组时，提到了 `each` 会递进数据上下文，其实质就是修改了 `keypath`。

如果没有使用 `each`，`keypath` 始终是 `""`，只有 `each` 会把 `keypath` 切换成当前正在遍历的列表项，举个例子：

数据

```js
{
  data: {
    users: [
      {
        name: 'Jack'
      },
      {
        name: 'John'
      },
      {
        name: 'Mike'
      }
    ]
  },
  methods: {
    select: function (keypath, user) {
      console.log(keypath, user)
    }
  }
}
```

模板

```html
<div>
  {{#each users}}
    <div>
      {{name}}
    </div>
    <button on-click="select($keypath, this)">
      Select
    </button>
  {{/each}}
</div>
```

> 关于 `$keypath`，参考 **模板** - **特殊变量**

渲染用户列表，我们给每个用户添加一个按钮，希望点击按钮能知道点击的是哪个用户。

当我们点击第二个用户时，打印如下：

```js
users.1 Object {name: "John"}
```

`users.1` 正是渲染第二个用户时的 `keypath`。


## 特殊变量

### $event

触发事件时，通过 `$event` 获取当前的事件对象，如下：

```html
<button on-click="submit($event)">
  Submit
</button>
```

> 调用方法如果没有参数，默认会把事件对象传进来，因此这里写与不写 `$event` 是一样的。
>
> 加上这个特性主要是方便多个参数时修改 event 参数的位置。

### $data

触发 `组件事件` 时，通过 `$data` 获取当前的事件数据，如下：

```html
<Button on-click="submit($event, $data)">
  Submit
</Button>
```

> 调用方法如果没有参数，默认会把事件对象和事件数据传进来，因此这里写与不写 `$event, $data` 是一样的。
>
> 加上这个特性主要是方便多个参数时修改 event 和 data 参数的位置，或只需要 data 参数。

### $keypath

在模板的任何位置，通过 `$keypath` 获取当前 `keypath`，如下：

```html
<div>
  {{$keypath}}

  {{#each list}}
    {{$keypath}}
  {{/each}}
</div>
```

### $length

在 `each` 内部，通过 `$length` 获取当前遍历数组的长度，如下：

```html
<div>
  {{#each list}}
    {{$length}}
  {{/each}}
</div>
```

`each` 会预先读取数组的长度，并存在 `$length` 变量中，就像下面这样：

```js
for (var i = 0, $length = list.length; i < $length; i++) {
  // 读取 $length
}
```


