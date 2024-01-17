const fs = require('fs');
const path = require('path');

fs.readdir(
    path.join(__dirname, 'secret-folder'),
    { withFileTypes: true },
    function (err, files) {
        if (err) console.error(err.message);
        for (let file of files) {
            if (file.isFile()) {
                let res = `${file.name.split('.')[0]} - ${file.name.split('.')[1]} - `;
                fs.stat(
                    path.join(__dirname, 'secret-folder', file.name),
                    (err, data) => {
                        if (err) console.error(err);
                        console.log(res + data.size / 1024 + 'kb');
                    }
                );
            }
        }
    });