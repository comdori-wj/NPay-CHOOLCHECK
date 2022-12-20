/**
 Created by WebStorm IDEA.
 * projectName    : NaverPay-attendanceCheck(가칭: NPayCHOOLCHECK(앤페이출첵))
 * fileName       : index
 * author         : wj
 * date           : 2022/12/15
 * description    : NaverPay(네이버 페이) 자동 출석 프로그램
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2022/12/15        wj       최초 생성
 * 2022/12/16        wj       네이버 자동 로그인 기능 구현
 * 2022/12/17        wj       포인트 적립 기능 구현
 */

import puppeteer from 'puppeteer'; //
import config from './config.js'; // 설정 파일
import schedule from 'node-schedule'; // 특정시간 함수 실행 라이브러리

if (!config.agree) {
    throw Error('config.js에서 동의를 해 주시기 바랍니다.');
    console.log("config.js에서 동의를 해 주시기 바랍니다.");
}

if (!config.id || !config.pw) {
    throw Error("ID, 비밀번호가 없습니다. 확인 후 다시 시도 해주십시오.");
}

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch(config.puppeteer.launchOptions);
    } catch (e) {
        throw Error("브라우저를 실행 할 수 없습니다: " + e);
        console.log("브라우저 실행 불가 : ",e);
    }

    // const browser = await puppeteer.launch({
    //     headless: false,
    //     executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    // });

    const autoWork = schedule.scheduleJob('10 00 10 * * *', () => { // 오전 8시 이벤트
        console.log("네이버 페이 자동 출첵이 시작되었습니다.");
        // Job();
    })
    const autoWork2 = schedule.scheduleJob('00 00 10 * * *', () => {
        //Job2();
    })

    const page = (await browser.pages())[0]; // 첫 번째 탭에서 시작.
    await page.setViewport({
        width: 1280, height: 1024
    }); // 화면 크기

    await page.goto("https://nid.naver.com/nidlogin.login"); // 로그인 페이지로 이동
    try {
        // await page.$x("/html/body/div[1]/div[2]/div/div[1]/form/ul/li/div/div[1]/div[1]/input");
        // await page.type("#id", config.id);
        await page.waitForTimeout(1000); // 로그인 페이지 로딩 대기
        await page.evaluate((id, pw) => { // 아이디, 비밀번호 입력
            document.querySelector('#id').value = id;
            document.querySelector('#pw').value = pw;
        }, config.id, config.pw);

        // await page.$x("/html/body/div[1]/div[2]/div/div[1]/form/ul/li/div/div[1]/div[2]/input");
        // await page.type("#pw", config.pw);
        await page.click("#keep"); //로그인 상태 유지 버튼
    } catch (e) {
        throw Error("id, pw를 입력하지 못했습니다. 확인해 주십시오: " + e);
    }
    try { // 로그인 처리
        await page.waitForTimeout(3000); // 로그인 처리 대기(봇 방지 처리)
        await page.click("#log\\.login");
        await page.waitForTimeout(5000); // 대기
        await page.screenshot({
            path: 'Screenshot/loginOk.png', fullPage:false
        });
    } catch (e) {
        await page.waitForTimeout(5000);
        await page.screenshot({
            path: 'Screenshot/loginNo.png', fullPage:false
        });
        throw Error("로그인 하지 못했습니다. 계정을 확인해 주세요." +e);
    }

    try {
        await page.goto('https://ofw.adison.co/u/naverpay/ads/55162') // 오전 8시 마이스토어

    }catch (e) {
        let errorMsg = "페에지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
        throw Error(errorMsg + e);
        //console.log(errorMsg, e);
    }
    try {
        await page.waitForTimeout(7000);
        await page.click("#app > div:nth-child(2) > div > div > div > button"); // 포인트 받기 버튼
        await page.waitForTimeout(3000);
        await page.screenshot({
            path: 'Screenshot/NPayResult1.png', fullPage:false
        });
    } catch (e) {
        throw  Error("포인트 받기 버튼 클릭 실패!" + e);
    }


})();

