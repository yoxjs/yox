## SVG

Yox 的模板引擎要求标签必须结束，或者自闭合。也就是说，规范的 `svg` 是支持的。

```html
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32">
  <path fill="#9d9e9e" d="M0.035 15.435l1.032-1.032v12.322l-1.032-1.032h6.486l-1.032 1.032v-12.322l1.032 1.032h-6.486zM6.521 14.403v12.322h-6.486v-12.322h6.486z"></path>
</svg>
```

如果模板中包含 `DOCTYPE` 之类的非标签结构，则会被识别为普通文本。

```html
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32">
  <path fill="#9d9e9e" d="M0.035 15.435l1.032-1.032v12.322l-1.032-1.032h6.486l-1.032 1.032v-12.322l1.032 1.032h-6.486zM6.521 14.403v12.322h-6.486v-12.322h6.486z"></path>
</svg>
```


## 调试模式

简单地说，源码版默认是调试模式，压缩版默认是非调试模式。

在调试模式下，调用 `Yox.logger.log` 和 `Yox.logger.warn` 会打印信息。

在非调试模式下，调用这两个函数不会打印任何信息。

如果希望调试模式不依赖代码版本，可为 `window.DEBUG` 设置一个布尔值，它的优先级是最高的。


## 移动端

移动端通常会识别某些字符，自动转换成 DOM 元素，这样会破坏底层维护的 Virtual DOM，将导致不可预期的问题。

建议关闭浏览器的自动识别功能，如下：

```html
<meta name="format-detection" content="telephone=no">
<meta name="format-detection" content="email=no">
```


## 语法糖

很多人喜欢语法糖，比如 `Vue` 的 `Class` 绑定。

```html
<div v-bind:class="{ active: isActive }"></div>
```

这个语法糖的语义很清晰：当 `isActive` 为 `true` 时，为 `div` 加上名为 `active` 的 `class`。

虽然是很简单的语法糖，但当你知道，`Vue` 既可以这样写，又可以那样写，还可以 TMD 的各种写的时候，你就会崩溃了，总有一天你会问出这种低级问题：双向绑定怎么写来着？

出于减少记忆的考虑，我们希望通过一套设计精良的 `Mustache` 语法来满足各种需求，如下：

```html
<!-- 以下 3 种方式都可以 -->
<div class="{{isActive ? 'active' : ''}}"></div>
<div class="{{#if isActive}}active{{/if}}"></div>
<div {{#if isActive}}class="active"{{/if}}></div>
```

> 别忘了，还有过滤器函数呢，需要什么功能自己实现吧。

## 简单至上

简单易用，便有了群众基础，此外，越是简单，就越不容易犯错，这样便减少了未来重构升级的可能。

作为反面教材，很多框架内置了过滤函数、动画库、手势库，一大堆看起来非常有用的功能。对于我来说，但凡有学习成本的事情，我都会慎重考虑，毕竟团队开发不是我一个人学会了，整个团队都学会了。

> Vue 的体积差不多是 Yox 的一倍，它包含了太多从未用过的功能。

## 属性值引号

不论是 `元素节点`，还是 `组件节点`，属性值都必须加引号。

```html
<Component name="{{value}}" age="1" />
```

可以是双引号（推荐），也可以是单引号，但不能没有引号。

```html
<!-- 不支持 -->
<Component name={{value}} />
```

