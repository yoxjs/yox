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

## 自动识别

有些浏览器会识别某种格式的字符串，自动转换成 DOM 元素，这样会破坏底层维护的 Virtual DOM，将导致不可预期的问题。

建议关闭浏览器的自动识别功能，如下：

```html
<meta name="format-detection" content="telephone=no">
<meta name="format-detection" content="email=no">
```
