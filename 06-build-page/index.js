const fs = require('fs');
const path = require('path');

async function createDir() {
    return new Promise(function (res, rej) {
        fs.mkdir(
            path.join(__dirname, 'project-dist', 'assets'),
            { recursive: true },
            err => {
                if (err) rej();
                res();
            }
        );
    });
}

async function clearDir() {
    return new Promise(function (res, rej) {
        fs.rm(
            path.join(__dirname, 'project-dist', 'assets'),
            { recursive: true },
            err => {
                if (err) rej(err);
                fs.mkdir(
                    path.join(__dirname, 'project-dist', 'assets'),
                    err => {
                        if (err) rej(err);
                        res();
                    }
                );
            }
        );
    });
}

async function copyAssets() {
    await createDir();
    await clearDir();

    return new Promise(function (res, rej) {
        fs.readdir(
            path.join(__dirname, 'assets'),
            { withFileTypes: true },
            (err, data) => {
                if (err) rej(err);
                // console.log(data);
                for (let item of data) {
                    if (!item.isFile()) {
                        fs.mkdir(
                            path.join(__dirname, 'project-dist', 'assets', item.name),
                            { recursive: true },
                            err => {
                                if (err) rej(err);
                            }
                        );

                        fs.readdir(
                            path.join(__dirname, 'assets', item.name),
                            (err, files) => {
                                if (err) rej(err);

                                for (let file of files) {
                                    fs.copyFile(
                                        path.join(__dirname, 'assets', item.name, file),
                                        path.join(__dirname, 'project-dist', 'assets', item.name, file),
                                        err => {
                                            if (err) rej(err);
                                        }
                                    );
                                }
                            }
                        );
                    } else {
                        fs.copyFile(
                            path.join(__dirname, 'assets', item.name),
                            path.join(__dirname, 'project-dist', 'assets', item.name),
                            err => {
                                if (err) rej(err);
                            }
                        );
                    }
                }

                res();
            }
        );
    });
}

async function createHtml() {
    return new Promise(function (res, rej) {
        fs.writeFile(
            path.join(__dirname, 'project-dist', 'index.html'),
            '',
            err => {
                if (err) rej(err);
                res();
            }
        );
    });
}

async function createCss() {
    return new Promise(function (res, rej) {
        fs.writeFile(
            path.join(__dirname, 'project-dist', 'style.css'),
            '',
            err => {
                if (err) rej(err);
                res();
            }
        );
    });
}

async function bundleCSS() {
    await createCss();

    fs.readdir(
        path.join(__dirname, 'styles'),
        { withFileTypes: true },
        (err, files) => {
            if (err) throw err;
            for (let file of files) {
                if (file.isFile() && file.name.split('.')[1] === 'css') {
                    const stream = fs.createReadStream(
                        path.join(__dirname, 'styles', file.name),
                        'utf-8'
                    );

                    let res = '';

                    stream.on('data', chunk => res += chunk);
                    stream.on('end', () => {
                        fs.appendFile(
                            path.join(__dirname, 'project-dist', 'style.css'),
                            res,
                            err => {
                                if (err) throw err;
                            }
                        );
                    });
                    stream.on('error', error => console.error(error.message));
                }
            }
        }
    );
}

let readT = new Promise(function (res, rej) {
    fs.readFile(
        path.join(__dirname, 'template.html'),
        function (err, data) {
            if (err) rej(err);
            let arr = [];
            arr = data.toString();
            arr = arr.split('\n');
            arr = arr.map(item => item.trim());

            res(arr);
        });
});

async function getComp(comp) {
    return new Promise(function (res, rej) {
        fs.readFile(
            path.join(__dirname, 'components', `${comp}.html`),
            (err, data) => {
                if (err) rej(err);
                let str = data.toString()
                // console.log(data);
                res(str);
            }
        );
    });
}

// copyAssets();

const getComponentsName = (str) => {
    const result = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i].includes('{')) {
            result.push(str.substring(i + 2, str.indexOf('}', i)));
            i++;
        }
    }

    return result;
}

async function insertComponentText (str, componentNames) {
    const arr = str.split('');

    let counter = 0;
    while (componentNames[counter]) {
        const firstBracket = arr.indexOf('{')
        const firstBracketClosed = arr.indexOf('}')

        let componentInfo = await getComp(componentNames[counter]);
        arr.splice(firstBracket, firstBracketClosed + 2 - firstBracket, componentInfo);
        counter++;
    }

    return arr.join('');
}

async function bundleHTML() {
    await createDir();
    await copyAssets();
    await createHtml();
    await createCss();
    await bundleCSS();
    const arr = await readT;
    let finalBundle = [];

    for (let i = 0; i < arr.length; i++) {
        if (!arr[i].includes('{')) {
            finalBundle.push(arr[i]);
        } else {
            const currentComponent = await insertComponentText(arr[i], getComponentsName(arr[i]))

            finalBundle.push(currentComponent);
        }
    }

    fs.appendFile(
        path.join(__dirname, 'project-dist', 'index.html'),
        finalBundle.join(''),
        err => {
            if (err) throw err;
        }
    );
    // console.log(finalBundle);
}

bundleHTML();