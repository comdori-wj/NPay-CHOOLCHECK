/**
 Created by WebStorm IDEA.
 *packageName    :
 * fileName       : index
 * author         : wj
 * date           : 2022/12/15
 * description    : NaverPay(네이버 페이) 자동 출첵 프로그램
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2022/12/15        wj       최초 생성
 */

import puppeteer from 'puppeteer';
import config from './config.js';

// if (!config.agree) {
//     throw Error('config.js에서 동의를 해 주시기 바랍니다.');
//     console.log("config.js에서 동의를 해 주시기 바랍니다.");
// }
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });

    const page = (await browser.pages())[0]; // 첫 번째 탭에서 시작.
    try {
        await page.goto('https://ofw.adison.co/u/naverpay/ads/55162') // 오전 8시 마이스토어

    }catch (e) {
        let errorMsg = "페에지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
        throw Error(errorMsg + e);
        console.log(errorMsg, e);
    }
})();

