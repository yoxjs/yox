表达式是所有模板语法的基础，没有一个优秀的表达式引擎，再好的模板语法都是空中楼阁。

Yox 内置了一个非常强大的表达式引擎，不仅支持常见的 `一元运算`，`二元运算` 和 `三元运算`，还支持 `基本类型字面量`、`数组字面量`、`对象字面量`、`数组索引访问`、`对象属性访问` 和 `函数调用`。

## 一元运算

```html
<div>
  {{+a}} {{-a}} {{~a}} {{!a}} {{!!a}}
</div>
```


## 二元运算

```html
<div>
  <!-- 数学计算 -->
  {{a + b}} {{a - b}} {{a * b}} {{a / b}} {{a % b}}

  <!-- 布尔比较 -->
  {{a > b}} {{a < b}}
  {{a >= b}} {{a <= b}}
  {{a == b}} {{a != b}}
  {{a === b}} {{a !== b}}
  {{a && b}} {{a || b}}

  <!-- 位运算 -->
  {{a & b}} {{a | b}} {{a ^ b}}

  <!-- 位移 -->
  {{a << b}} {{a >> b}} {{a >>> b}}
</div>
```


## 三元运算

```html
<div>
  {{a ? b : c}}
</div>
```


## 基本类型字面量

```html
<div>
  <!-- 数字 -->
  {{0}} {{1}}

  <!-- 字符串 -->
  {{'0'}} {{"1"}}

  <!-- 布尔 -->
  {{true}} {{false}}

  <!-- 空值 -->
  {{null}} {{undefined}}
</div>
```


## 数组字面量

```html
<div>
  {{[1, 2, 3]}}
</div>
```


## 对象字面量

```html
<div>
  <!--
    在 {{ 的右侧 和 }} 的左侧要打一个空格
    因为 {{{ 和 }}} 在模板语法中表示 “危险插值”，参考 模板 - 插值
  -->
  {{ { name: 'yox', age: 100 } }}
</div>
```


## 数组索引访问

```html
<div>
  {{users.0.name}}
</div>
```

> 不建议写 `users[0].name`，虽然能识别，但不符合 `Yox` 的风格


## 对象属性访问

```html
<div>
  {{user.name}}
  {{users[index].name}}
</div>
```

> 如果访问数组索引需要变量，必须使用 `[]`，这很 `JavaScript` 不是吗？


## 函数调用

函数调用有两种使用场景：

* 指令
* 过滤器

### 指令

Yox 的指令支持函数调用，如下：

```html
<div o-name="invoke()"></div>
```

`invoke()` 可调用的函数来自当前模板所属组件的实例方法。实例方法既可以是组件自定义的 `methods`，也可以是 Yox 内置的一些组件实例方法，如 `set`、`fire` 等。

> 更多内容，参考 **事件处理** - **调用方法** 和 **自定义指令**


### 过滤器

`过滤器` 指的是一个 `Function`，通过调用该函数，获得一个更符合展示需求的数据格式，比如格式化日期：

```html
<div>
  生日：{{formatDate(birthday)}}
</div>
```

```js
{
  filters: {
    formatDate: function (value) {
      var month = value.getMonth() + 1
      var date = value.getDate()
      return [
        value.getFullYear(),
        month < 10 ? '0' + month : month,
        date < 10 ? '0' + date : date
      ].join('-')
    }
  }
}
```

与其他框架不同的是，Yox 不支持调用对象自身的方法，如下：

```html
<div>
  {{name.toUpperCase()}}
</div>
```

你希望把 `name` 转换成大写格式，Yox 却认为你在调用名为 `name` 的函数库中的 `toUpperCase` 函数，最终能否正确输出，无关技术，纯靠人品。

`Yox` 没有采用 `{{ name | upper }}` 方案的过滤器，它不够直观，尤其是多参数的场景，如下：

```html
<div>
  {{ birthday | formatDate true false }}
</div>
```

参数之间到底应该用 `""` 还是 `","` 呢？不仅是语法设计者很难抉择，框架使用者也很迷茫，如下：

```html
<div>
  {{ birthday | formatDate true, false }}
</div>
```

是不是觉得这两种语法并没有什么区别呢？作为开发者，可能你总是想不起到底应该用哪一种。

Yox 采用了更为简单直白的过滤器方案：`JavaScript` 式的函数调用。如果你会 `JavaScript`，那么 Yox 的过滤器对你来说学习成本为零。

```html
<div>
  {{ formatDate(birthday, true, false) }}
</div>
```

## 全局函数

你无法在 Yox 表达式中调用 `JavaScript` 环境存在的全局函数，如下：

```html
<div>
  <!-- parseInt 是无法调用到的，除非注册了 parseInt 过滤器 -->
  {{#if parseInt(a, 10) === 10}}
    a is 10
  {{/if}}
</div>
```

### 全局函数的风险

如果你不理解 Yox 的做法，大概也知道全局函数具体有哪些完全取决于浏览器厂商。

如果浏览器厂商新出了一个全局函数，在你没听过这个全局函数的情况下，看到模板里用了这个函数会是一种什么情景。

```html
<div>
  {{thisIsANewGlobalFunction()}}
</div>
```

我猜你会全局搜索 `thisIsANewGlobalFunction`，发现没有结果，然后开始怀疑人生。

> 我们希望所有的函数调用都有迹可循，不是凭空出现，这样的开发模式才够严谨。

### 全局过滤器

如果你非常想用全局函数，那么 Yox 的全局过滤器可能正是你需要的。

举个例子，如果你喜欢用 `lodash`，可以把它注册为全局过滤器，如下：

```js
Yox.filter('_', _)
```

```html
<div>
  {{_.toUpper(name)}}
</div>
```

如果你觉得 `_.toUpper` 看着别扭，还可以直接注册整个 `lodash` 对象，如下：

```js
Yox.filter(_)
```

```html
<div>
  {{toUpper(name)}}
</div>
```

> 友情提醒：这样做很容易命名冲突，请确定不会发生这种事。

## 无副作用

表达式的目的是求值，不应对原有数据造成任何改动，这就是为什么我们不支持 `a++`、`++a`、`a--`、`--a` 的原因。

## 表达式 vs 语句

也许有人还分不清 `表达式` 和 `语句`，简单来说，`表达式` 会产生一个**值**，`语句` 则是表达一种**逻辑**，比如循环或条件。

Yox 只支持 `表达式`，不支持 `语句`，也就是说，下面这些示例全都不会生效：

```html
<div>
  <!-- 这是语句，不是表达式 -->
  {{var a = 1}}

  <!-- 这是语句，请使用 ok ? message : '' -->
  {{if (ok) { return message }}}
</div>
```