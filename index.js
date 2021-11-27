const axios = require('axios').default;
const puppeteer = require('puppeteer');
const userAgent = require('./user_agents');
const iPhone = puppeteer.devices['iPhone 6'];

const jd_price = async () => {
    let res = await axios.get(process.env.getCookie);
    let CookieJDsa = res.data.result;
    const brower = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            // "--single-process",
            '--start-maximized',
            '--use-gl=swiftshader',
            '--disable-gl-drawing-for-tests',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
    });

    let messageList = [];
    for (const iterator of CookieJDsa) {
        let message = '';
        let cookie = iterator.value;
        const pt_pin = cookie.match(/pt_pin=(.*?);/);
        const pt_key = cookie.match(/pt_key=(.*?);/);
        console.log(`${pt_pin[1]} 申请价保`);
        message += `${pt_pin[1]} 申请价保`;
        const context = await brower.createIncognitoBrowserContext();
        const page = await context.newPage();
        page.setDefaultNavigationTimeout(50 * 1000);

        await page.evaluateOnNewDocument(() => {
            const newProto = navigator.__proto__;
            delete newProto.webdriver;
            navigator.__proto__ = newProto;
        });
        await page.evaluateOnNewDocument(() => {
            window.navigator.chrome = {
                runtime: {},
            };
        });
        await page.emulate(iPhone);
        try {
            await page.setCookie(
                {
                    name: 'pt_pin',
                    value: pt_pin[1],
                    domain: '.jd.com',
                },
                {
                    name: 'pt_key',
                    value: pt_key[1],
                    domain: '.jd.com',
                }
            );
            await Promise.all([
                page.setUserAgent(userAgent.randomByRegex('iPhone')),
                page.setJavaScriptEnabled(true), //  允许执行 js 脚本
                page.goto(indexUrl, {
                    waitUntil: 'networkidle0',
                }),
                page.waitForTimeout(2000),
            ]);
            await page.waitForSelector('.one-jb-btn');
            try {
                await page.click('#one-btn');
                console.log(`等待5s进行下一个`);
                await page.waitForTimeout(5 * 1000);
                message += ', 申请价保成功';
            } catch (error) {
                console.log(`已经价保过,稍等结果`);
                message += ', 已经价保过,稍等结果';
            }
            await page.close();
            messageList.push(message);
        } catch (error) {
            console.log(error);
            await page.close();
        }
    }
    notify('价格保护', messageList.join('\n'));
    await brower.close();
};

const notify = async (text, desp) => {
    let content = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
    const body = {
        token: process.env.token,
        title: `${text}`,
        content: `${content}`,
        topic: process.env.topic,
    };
    try {
        let res = await axios.post('https://www.pushplus.plus/send', body, {
            headers: {
                'Content-Type': ' application/json',
            },
        });
        if (res.data.code === 200) {
            console.log(`push+发送一对多通知消息完成。\n`);
        } else {
            console.log(`push+发送一对多通知消息失败：${res.data.msg}\n`);
        }
    } catch (error) {
        console.log(`push+发送一对多通知消息失败！！\n`);
        console.log(err);
    } finally {
        return;
    }
};

jd_price();
