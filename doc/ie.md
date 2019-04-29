低端浏览器请使用 `dist/legacy/` 目录下的文件。

> 注意：IE6 和 IE7 不支持 `querySelector`，为了避免兼容选择器而增加体积，仅支持 `"#id"` 选择器。

Yox 用了以下高级 API，它们都可以打补丁实现。

* `Object.keys`
* `Object.freeze`
* `String.prototype.trim`
* `Array.isArray`
* `Array.prototype.indexOf`
* `Array.prototype.map`
* `Array.prototype.filter`
* `JSON.stringify`

> IE8 已内置 JSON 对象，IE6、7 需要打补丁

如果不想自己实现这些函数，建议加上以下三个脚本：

```html
<!--[if lt IE 9]>
<script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.13/es5-shim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.13/es5-sham.min.js"></script>
<![endif]-->

<!--[if lt IE 8]>
<script src="https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js"></script>
<![endif]-->

<!-- 在此加载 yoxjs -->
```





