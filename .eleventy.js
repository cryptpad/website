const markdownIt = require("markdown-it");

module.exports = (function(eleventyConfig) {
    eleventyConfig.addWatchTarget("_styles");
    // Copy /images to /public
    eleventyConfig.addPassthroughCopy({'_static': '/'});

    // Debug filter
    eleventyConfig.addFilter("log", (d) => {
        console.log(d);
      });

    eleventyConfig.addFilter("shuffle", (arr) => {
      arr.sort(() => {
        return 0.5 - Math.random();
      });
      return arr;
    });

    // Key / Value filter
    eleventyConfig.addFilter("keyValue", (d) => {
      let key = Object.keys(d)[0];
      let value = Object.values(d)[0];
      return {"key": key, "value": value};
    });
    // set nunjucks as markdown template engine
    // could be useful for custom processing like mermaid
    // return {
    //     markdownTemplateEngine: "njk, md"
    // }
    const md = new markdownIt({
      html: true,
    });

    eleventyConfig.addFilter("markdown", (content) => {
      return md.render(content);
    });
});