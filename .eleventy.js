const markdownIt = require("markdown-it");
const { parse } = require("node-html-parser");

module.exports = (function(eleventyConfig) {
    eleventyConfig.addWatchTarget("_styles");
    // Copy /images to /public
    eleventyConfig.addPassthroughCopy({'_static': '/'});
    eleventyConfig.addPassthroughCopy('.well-known')

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
    const markdownItAnchor = require("markdown-it-anchor");

    const anchoroptions = {
        level: 1,  // Minimum level to apply anchors, or array of selected levels.
    };

    const options = {
        html: true, // enable HTML tags in source
        typographer: true, // uniformize typography
        linkify: true, // convert URLs into links
    };

    let md = markdownIt(options).use(markdownItAnchor, anchoroptions);

    // set the library to process markdown files
    eleventyConfig.setLibrary("md", md);

    eleventyConfig.addFilter("markdown", (content) => {
      return md.render(content);
    });

    // TOC filter for pages
    eleventyConfig.addFilter("toc", function (content) {
      // as used in CryptPad Blueprints
      // this filter is taken from the eleventy-notes project
      // https://github.com/rothsandro/eleventy-notes/blob/main/.app/lib/modules/toc/toc.filter.js

      const html = parse(content);
      const headings = html.querySelectorAll("h1, h2, h3, h4");
      const toc = headings.map((heading) => {
        heading.querySelectorAll("[aria-hidden=true]").forEach((el) => el.remove());

        const id = heading.attributes.id;
        const text = heading.innerText;
        const level = parseInt(heading.tagName.replace("H", ""), 10);
        return { id, text, level };
      });

      // The page title already uses an h1, so it's recommended
      // to start with h2 in the content. If the first heading
      // is an h2 or higher, we'll adjust the levels to start with level 1
      // to avoid unnecessary indentation in the TOC.
      const minLevel = Math.min(...toc.map((item) => item.level));
      if (minLevel > 1) toc.forEach((item) => (item.level -= minLevel - 1));

      return toc;
    })

});
