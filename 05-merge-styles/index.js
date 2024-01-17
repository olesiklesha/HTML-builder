const fs = require('fs');
const path = require('path');

fs.writeFile(
    path.join(__dirname, 'project-dist', 'bundle.css'),
    '',
    err => {
        if (err) throw err;
    }
);

fs.readdir(
    path.join(__dirname, 'styles'),
    { withFileTypes: true },
    function (err, files) {
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
                        path.join(__dirname, 'project-dist', 'bundle.css'),
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
