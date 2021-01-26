const glob = require('glob');
var fs = require('fs-extra');

const FOLDER_NAME = "Training Connector";
fs.removeSync('../' + FOLDER_NAME);
fs.copySync('./', '../' + FOLDER_NAME);
fs.removeSync('../' + FOLDER_NAME+'/.git');
fs.writeFile('../' + FOLDER_NAME + '/Dockerfile', "");

glob('../' + FOLDER_NAME + '/**/*.{ts,js,html}', function (err, files) {
    for (let ind in files) {
        let filePath = files[ind];
        if (filePath.indexOf("node_modules") > -1 || filePath.indexOf("/build/") > -1) { continue; }
        fs.readFile(filePath, function (err, data) {
            if (err !== null) { console.error(err); }
            let dataString = data.toString();
            const uncomment = /\/\/ UNCOMMENT(.*?)\/\/ UNCOMMENT/gs
            const comment = /\/\/ COMMENT(.*?)\/\/ COMMENT/gs
            const commentLine = /( *)(\/\/ )(.*)/

            dataString = dataString.replace(uncomment, function (match) {
                let result = match.replace(/UNCOMMENT/g, "");
                let lines = result.split(/\r?\n/);
                let firstChar = -1;
                for (var i in lines) {
                    let thisline = lines[i];
                    if (thisline.match(commentLine)) {
                        continue;
                    }
                    if (firstChar === -1) {
                        firstChar = thisline.search(/\S/);
                    }
                    if (thisline.length < firstChar) {
                        thisline = ' '.repeat(firstChar - thisline.length) + thisline
                    }
                    lines[i] = thisline.substring(0, firstChar) + "// " + thisline.substring(firstChar);
                }
                return lines.join("\n");
            });

            dataString = dataString.replace(comment, function (match) {
                let result = match.replace(/COMMENT/g, "");
                result = result.replace(/( *)(\/\/ )(.*)/g, "$1$3")
                return result;
            });

            console.log(filePath);
            fs.writeFile(filePath, dataString);
        });
    }
});
fs.removeSync('../Training Application/build');
fs.removeSync('../Training Application/.git');