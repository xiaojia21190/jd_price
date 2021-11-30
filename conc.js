const { getCookie } = require('./jdCookie');
const child_process = require('child_process');

const concCk = async () => {
    let cks = await getCookie();
    for (let i = 0; i < cks.length; i++) {
        const element = cks[i];
        console.log(element);
        var workerProcess = child_process.exec(`node jd_speed_sign.js ${element.value}`, function (err, stdout, stderr) {
            if (!err) {
                //stdout输出结果，stderr输出错误
                console.log('结果:', stdout);
                console.log('错误:', stderr);
            } else {
                console.log(err);
            }
        });
        workerProcess.on('exit', (code) => {
            console.log('子进程已退出，退出码：' + code);
        });
    }
};

concCk();
