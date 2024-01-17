const fs = require('fs');
const path = require('path');

const createFolder = new Promise(function (res, rej) {
    return fs.mkdir(path.join(__dirname, 'files-copy'),
        { recursive: true },
        (err) => {
            if (err) rej(err);
            res();
        });
});


async function clearDir() {
    return new Promise(function (res, rej) {
        fs.rm(
            path.join(__dirname, 'files-copy'),
            { recursive: true },
            err => {
                if (err) rej(err);
                fs.mkdir(
                    path.join(__dirname, 'files-copy'),
                    err => {
                        if (err) rej(err);
                        res();
                    }
                );
            }
        );
    });
}

async function copy() {
    await createFolder;
    await clearDir();

    fs.readdir(
        path.join(__dirname, 'files'),
        (err, files) => {
            if (err) throw err;

            for (let file of files) {
                fs.copyFile(
                    path.join(__dirname, 'files', file),
                    path.join(__dirname, 'files-copy', file),
                    err => {
                        if (err) throw err;
                    }
                );
            }
        }
    );
}

copy();