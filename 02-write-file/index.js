const { stdin, stdout } = process;
const fs = require('fs');
const path = require('path');


fs.writeFile(
    path.join(__dirname, 'text.txt'),
    '',
    err => {
        if (err) return console.error(err.message);
        stdout.write('Enter your text\n');
    }
);



stdin.on('data', data => {
    const dataStringified = data.toString();

    if (dataStringified.trim() === 'exit') {
        process.exit();
    }

    fs.appendFile(
        path.join(__dirname, 'text.txt'),
        `${dataStringified}`,
        err => {
            if (err) return console.error(err.message);
        }
    );
});

process.on('SIGINT', () => {
    process.exit();
});
process.on('exit', () => console.log('Good luck, student1'));