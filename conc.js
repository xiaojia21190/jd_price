const { getCookie } = require('./jdCookie');
const child_process = require('child_process');

const concCk = async () => {
    let cks = await getCookie();
    for (let i = 0; i < cks.length; i++) {
        const element = cks[i];
        var workerProcess = child_process.exec(`node jd_speed_sign.js ${element}`, function (err, stdout, stderr) {
            if (!err) {
                //stdout输出结果，stderr输出错误
                console.log('stdout:', stdout);
                console.log('stderr:', stderr);
            } else {
                console.log(err);
            }
        });
        workerProcess.on('exit', (code) => {
            console.log('子进程已退出，退出码：' + code);
        });
    }
};

module.exports = { concCk };
