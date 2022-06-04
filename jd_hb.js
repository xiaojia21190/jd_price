const puppeteer = require('puppeteer')
const userAgent = require('./user_agents')
const iPhone = puppeteer.devices['iPhone 6']
const { getCookie } = require('./jdCookie')

const jd_hb = async () => {
    let CookieJDsa = await getCookie()
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
    })
    let jdhbUrl = 'https://u.jd.com/JKkMvJH'
    // for (const iterator of CookieJDsa.reverse()) {
    for (const iterator of CookieJDsa) {
        let times = 0
        let cookie = iterator.value
        const pt_pin = cookie.match(/pt_pin=(.*?);/)
        const pt_key = cookie.match(/pt_key=(.*?);/)
        console.log(`${pt_pin[1]} 领取红包`)
        const context = await brower.createIncognitoBrowserContext()
        const page = await context.newPage()
        page.setDefaultNavigationTimeout(50 * 1000)

        await page.evaluateOnNewDocument(() => {
            const newProto = navigator.__proto__
            delete newProto.webdriver
            navigator.__proto__ = newProto
        })
        await page.evaluateOnNewDocument(() => {
            window.navigator.chrome = {
                runtime: {},
            }
        })
        await page.emulate(iPhone)
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
            )

            while (times < 3) {
                await Promise.all([
                    page.setUserAgent(userAgent.randomByRegex('iPhone')),
                    page.setJavaScriptEnabled(true), //  允许执行 js 脚本
                    page.goto(jdhbUrl, {
                        waitUntil: 'networkidle0',
                    }),
                    page.waitForTimeout(2000),
                ])
                let flag = await getHb()
                if (flag) {
                    times++
                } else {
                    break
                }
            }

            await page.close()
        } catch (error) {
            console.log(error)
            await page.close()
        }

        async function getHb() {
            let flag = false
            try {
                console.log('等待2s')
                await page.waitForSelector('.index-module__animate-pulse___YnSfN', { timeout: 2000 })
                await page.click('.index-module__animate-pulse___YnSfN')
                await page.waitForTimeout(1 * 1000)
                let logText = await page.evaluate(async () => {
                    let text = document.getElementsByClassName('index-module__h1___1vPTg index-module__wx___36nAw')[0].innerText
                    return text
                })
                console.log(logText.replace(/\n/g, ''))
                flag = true
            } catch (error) {
                console.log('全部领取完成')
            }
            return flag
        }
    }
    await brower.close()
}

jd_hb()
