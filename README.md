# 结合 wangEditor 富文本解决微信图片防盗链问题

## 出现的背景

运营同学在编辑发布微信公众号的文章后，想把文章的内容复制到公司的管理后台。但是在粘贴的时候，却发现上传的图片显示“此图片来自微信公众平台，未经允许不可引用”。那就郁闷了，他们不想编辑的时候一张一张重新上传。怎么办？

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51684823665e420baba2564478179cf6~tplv-k3u1fbpfcp-watermark.image)

## 出现的原因

因为微信公众平台对图片采用了**防盗链**设置，微信的图片默认是不允许外部调用的。因为盗链意味着这个资源可以在任意地方访问，导致资源所有者的网站的流量费用增加。

## 如何实现防盗链

判断 request 请求头的 referer 是否来源于本站。若不是，则拒绝访问真实图片。所以，想绕过防盗链，**伪造请求头，改变 refer。**

## 具体实现

**使用 nodejs 服务器做防盗链资源中转**

### 大致流程

1. 自己服务器接收目标图片 url 参数的请求
2. referer 请求目标图片
3. 把请求到的数据作为 response 返回

### 期望

1. 微信图片域名的图片 url

   ```js
   https://mmbiz.qpic.cn/sz_mmbiz_jpg/skIv7LAPeGJrjaOJNmWNB9HNHTIic2UT1WDnUk32R5hlic5lWfnNY1BmEic1uW6vyEPyoqicl4thq1x3iaicluEicnicqA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1
   ```

2. nodejs 中转后的图片 url

```js
 https://m.wbiao.cn/mallapi/wechat/picReverseUrl?url=https://mmbiz.qpic.cn/sz_mmbiz_jpg/skIv7LAPeGJrjaOJNmWNB9HNHTIic2UT1WDnUk32R5hlic5lWfnNY1BmEic1uW6vyEPyoqicl4thq1x3iaicluEicnicqA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1
```

## 实现的主要代码

服务端（以 koa 为例子）：

```js
const Router = require("koa-router"); // koa 路由中间件
const router = new Router(); // 实例化路由
const request = require("request");

router.get("/api", async (ctx, next) => {
  var url = ctx.request.query.url;
  var options = {
    method: "GET",
    url: url,
    headers: {
      Referer: request.host,
    },
  };

  const PassThrough = require("stream").PassThrough;
  ctx.body = request(options)
    .on("response", (response) => {
      Object.keys(response.headers).forEach((key) => {
        if ("transfer-encoding" === key) return;
        ctx.set(key, response.headers[key]);
      });
    })
    .on("error", ctx.onerror)
    .pipe(PassThrough());
});

module.exports = router;
```

客户端(结合 wangEditor 富文本)：

粘贴的时候对内容处理，把以`https://mmbiz.qpic.cn/`开头的替换成自己代理的地址`https://m.wbiao.cn/mallapi/wechat/picReverseUrl?url=https://mmbiz.qpic.cn/`

````js
const E = window.wangEditor
    editor = new E('#toolbar-container', '#text-container')
    editor.config.pasteIgnoreImg = false
    editor.config.pasteTextHandle = pasteStr => {
      const _result = pasteStr.replace(
        /https:\/\/mmbiz.qpic.cn\//g,
        `${location.origin}/mallapi/wechat/picReverseUrl?url=https://mmbiz.qpic.cn/`
      )
      return _result
    }
    editor.create()
    ```
````
