const less = require("less");
const path = require("path");
var fs = require("fs");

// doc
// https://www.11ty.dev/docs/data-js/

module.exports = function () {
  // Compile LESS into CSS
  const inputFile = path.join(__dirname, "../styles/main.less");
  const outputFile = path.join(__dirname, "../built/style.css");

  fs.readFile(inputFile, function (error, data) {
    data = data.toString();

    less.render(
      data,
      {
        filename: path.resolve(inputFile),
      },
      function (e, css) {
        fs.writeFile(outputFile, css.css, function (err) {
          if (err) {
            console.log(err);
          }
          console.log("LESS compiled");
        });
      }
    );
  });
};
