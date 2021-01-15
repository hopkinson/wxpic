import Koa from "koa";
import request from "request";
const app = new Koa();

app.use(ctx => {
  var url = ctx.request.query.url;
  var options = {
    method: "GET",
    url: url,
    headers: {
      Referer: request.host
    }
  };

  const PassThrough = require("stream").PassThrough;
  ctx.body = request(options)
    .on("response", response => {
      Object.keys(response.headers).forEach(key => {
        if ("transfer-encoding" === key) return;
        ctx.set(key, response.headers[key]);
      });
    })
    .on("error", ctx.onerror)
    .pipe(PassThrough());
});

app.listen();

export default {
  path: "/api",
  handler: app.callback()
};
