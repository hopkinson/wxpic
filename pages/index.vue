<template>
  <div class="container">
    <p>使用代理后的图片</p>
    <img
      src="http://localhost:3000/api?url=https://mmbiz.qpic.cn/sz_mmbiz_jpg/skIv7LAPeGJrjaOJNmWNB9HNHTIic2UT1WDnUk32R5hlic5lWfnNY1BmEic1uW6vyEPyoqicl4thq1x3iaicluEicnicqA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1"
    />
    <p>微信图片服务器域名的图片</p>
    <img
      src="https://mmbiz.qpic.cn/sz_mmbiz_jpg/skIv7LAPeGJrjaOJNmWNB9HNHTIic2UT1WDnUk32R5hlic5lWfnNY1BmEic1uW6vyEPyoqicl4thq1x3iaicluEicnicqA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1"
    />
    <div id="div1"></div>
  </div>
</template>

<script>
export default {
  mounted() {
    if (process.client) {
      const E = require("wangeditor");
      const editor = new E("#div1");
      editor.config.pasteIgnoreImg = false;
      editor.config.zIndex = 1;
      editor.config.pasteTextHandle = pasteStr => {
        const _result = pasteStr.replace(
          /https:\/\/mmbiz.qpic.cn\//g,
          `${location.origin}/wxpic?url=https://mmbiz.qpic.cn/`
        );
        this.code = _result;
        return _result;
      };
      editor.create();
    }
  }
};
</script>

<style>
img {
  width: 20%;
}
</style>
