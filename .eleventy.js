

module.exports = (function(eleventyConfig) {
    // Copy /images to /public
    eleventyConfig.addPassthroughCopy('static');
    eleventyConfig.addPassthroughCopy({'static': '/'});

    // Debug filter
    eleventyConfig.addFilter("log", (d) => {
        console.log(d);
      });

    // set nunjucks as markdown template engine
    // could be useful for custom processing like mermaid
    // return {
    //     markdownTemplateEngine: "njk, md"
    // }
});