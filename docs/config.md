自 `1.0.0-alpha.208` 版本开始，Yox 通过 `Yox.config` 对象支持自定义配置 ，默认值如下：

```js
{
  leftDelimiter: '{',
  rightDelimiter: '}',
  uglifyCompiled: false,
  minifyCompiled: false,
  logLevel: '此配置参考日志，本节不再赘述',
}
```

> 注意：不可覆盖 Yox.config 对象，只能改写它的属性值

## 模板定界符

Yox 通过配置的左右定界符来解析模板，你只需要各配置一个字符即可，它会自动 `repeat` 成相应的定界符。

* 安全定界符：`repeat(leftDelimiter, 2)` 和 `repeat(rightDelimiter, 2)`，如 `{{` 和 `}}`
* 危险定界符：`repeat(leftDelimiter, 3)` 和 `repeat(rightDelimiter, 3)`，如 `{{{` 和 `}}}`

## 编译模板的输出格式

编译模板默认输出源码格式，这样方便开发学习。

在生产环境，可按需打开 `uglifyCompiled` 和 `minifyCompiled`，这样能减少字符，压缩文件尺寸。