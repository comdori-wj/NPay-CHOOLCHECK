/**
 Created by WebStorm IDEA.
 * projectName    : NPay-CHOOLCHECK(앤페이-출첵)
 * fileName       : index
 * author         : wj
 * date           : 2022/12/15
 * description    : 네이버 페이 자동 출석 프로그램 - NaverPay-attendanceCheck
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2022/12/15        wj       최초 생성
 * 2022/12/16        wj       네이버 자동 로그인 기능 구현
 * 2022/12/17        wj       포인트 적립 기능 구현
 * 2022/12/20        wj       포인트 적립 기능 구현 및 수정
 * 2022/12/23        wj       3차 광고 추가
 * 2022/12/27        wj       지정된 시간에 자동 실행 구현
 * 2022/12/28        wj       프로그램(프로젝트) 이름 변경, 성공 및 실패 메시지 추가
 * 2022/12/30        wj       코드 정리 및 프로그램 알고리즘 개선 작업1
 * 2023/01/01        wj       배포용, 개발용(indexDev) 분리후 배포용 일부 수정 및 개발용 코드 개발
 * 2023/01/01        wj       개발용-1.0.8 적용
 * 2023/01/02        wj       개발용-1.0.10 적용 : 네이버 로그인 실패 처리 기능 추가
 * 2023/01/05        wj       개발용-1.0.11 적용 : 네이버 로그인 실패 처리 기능 버그 수정(로그인 완료후 튕김 문제 해결)
 * 2023/01/06        wj       1차 포인트 적립 후 실패 오류로 인한 2차 적립 실패 버그 픽스
 */

import config from "./config.js";
import puppeteer from "puppeteer";
import schedule from "node-schedule";

if (!config.agree) {
    throw Error('config.js에서 동의를 해 주시기 바랍니다.');
}

if (!config.id || !config.pw) {
    throw Error("ID, 비밀번호가 없습니다. 확인 후 다시 시도 해주세요.");
}

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch(config.puppeteer.launchOptions);
    } catch (e) {
        throw Error("브라우저를 실행 할 수 없습니다: " + e);
    }

    console.log("네이버 페이 출첵 프로그램이 실행되었습니다.");

    const page = (await browser.pages())[0]; // 첫 번째 탭에서 시작.
    await page.setViewport({
        width: 1280, height: 1024
    }); // 화면 크기


    try {
        let today = new Date();
        schedule.scheduleJob('02 00 10 * * *', () => { // 매일 오전 10시 프로그램 작동
            console.log("현재 시간: "+ today.toLocaleString() + " 네이버 페이 자동 출첵이 시작되었습니다.");
            Job(); // 자동화
        });
    } catch (e) {
        throw  Error("시간에 맞춰 실행하지 못하였습니다. 수동적립후 오류를 확인 해주세요.\n" + e);
    }

    async function Job() {

        ////////////////////네이버 로그인////////////////////
        await page.goto("https://nid.naver.com/nidlogin.login"); // 로그인 페이지로 이동
        try {
            await page.waitForTimeout(1000); // 로그인 페이지 로딩 대기
            await page.evaluate((id, pw) => { // 아이디, 비밀번호 입력
                document.querySelector('#id').value = id;
                document.querySelector('#pw').value = pw;
            }, config.id, config.pw);

            await page.click("#keep"); //로그인 상태 유지 버튼
        } catch (e) {
            throw Error("id, pw를 입력하지 못했습니다. 오류를 확인해 주십시오: " + e);
            await page.screenshot({
                path: 'Screenshot/loginInputFail.png', fullPage: false
            });
        }
        await page.waitForTimeout(3000); // 로그인 처리 대기(봇 방지 처리)
        await page.click("#log\\.login");
        await page.waitForTimeout(1000); // 대기


        ////////////////////네이버 로그인 실패처리////////////////////
        try{
            const errMsg = await page.$("#err_common > div");
            let loginErrMsg = "\n" +"                                        아이디(로그인 전용 아이디) 또는 비밀번호를 잘못 입력했습니다."+
                " 입력하신 내용을 다시 확인해주세요.\n" + "                                    ";
            const errMsgText = await page.evaluate(errMsg => errMsg.textContent, errMsg);

            if(errMsgText == loginErrMsg) {
                console.log("아이디 또는 비밀번호가 맞지 않습니다. 다시 확인후 시도해주십시오.");
                await page.screenshot({
                    path: 'Screenshot/loginFail.png', fullPage: false
                });
                return;
            }

        } catch (e) {
            await page.screenshot({
                path: 'Screenshot/loginOk.png', fullPage: false
            });
            console.log("로그인을 성공하였습니다.");
            //return;
        }

        ////////////////////1차 광고////////////////////
        try {
            await page.goto('https://ofw.adison.co/u/naverpay/ads/55162'); // 오전 8시 마이스토어
            await page.waitForTimeout(2000);
            await page.screenshot({
                path: 'Screenshot/NPay1.png', fullPage: false
            });
            console.log("1차 광고 페이지 접속에 성공하였습니다.")
        } catch (e) {
            let errorMsg = "1차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            await page.screenshot({
                path: 'Screenshot/NPayFailAccess1.png', fullPage: false
            });
            throw Error(errorMsg + e);
        }
        try {
            await page.waitForTimeout(5000);

            let possibleBtn = "\n"+"                  참여하고 포인트받기\n"+"              ";
            let completionBtn = "\n"+"                  참여 완료\n" +"              ";
            const callToActionBtn = await page.$("#app > div:nth-child(2) > div > div > div > button > span");
            const btnText = await page.evaluate(callToActionBtn => callToActionBtn.textContent, callToActionBtn);
            console.log("버튼상태: "+btnText);

            if(btnText == possibleBtn){
                console.log("현재 상태 광고 참여 가능합니다. 이어서 진행합니다.");
                await page.click("#app > div:nth-child(2) > div > div > div > button"); // 포인트 받기 버튼
                await page.waitForTimeout(3000);
            }
            else if(btnText == completionBtn){
                console.log("광고 참여 완료가 확인되어 출첵이 되지 않았습니다.");
                await page.screenshot({
                    path: 'Screenshot/NPayResult1.png', fullPage: false
                });
                // return;
            }

            let endAd = "광고 참여가 종료되었습니다.다른 광고를 이용해 주세요 ";
            const modal =await page.$("#app > div.blocker.current > div > div:nth-child(1)");
            const modalText = await page.evaluate(modal => modal.textContent, modal);
            console.log("알림창 내용: "+modalText);

            if(modalText == endAd){
                await page.screenshot({
                    path: 'Screenshot/NPayEnd1.png', fullPage: false
                });
                console.log("광고가 종료되어 출첵을 실패하였습니다. 확인후 다시 시도 해주세요.");
                // return;
            }

        } catch (e) {
            await page.screenshot({
                path: 'Screenshot/NPaySuccess1.png', fullPage: false
            });
            console.log("1차 적립을 성공하였습니다.");
        }

        ////////////////////2차 광고////////////////////
        try {
            await page.waitForTimeout(3000);
            await page.goto('https://ofw.adison.co/u/naverpay/ads/72557'); // 오전 10시 현장결제
            console.log("2차 광고 페이지 접속에 성공하였습니다.")

        } catch (e) {
            let errorMsg = "2차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            throw Error(errorMsg + e);
        }
        try {
            await page.waitForTimeout(7000);
            await page.click("#app > div:nth-child(2) > div > div > div > button"); // 포인트 받기 버튼
            await page.waitForTimeout(3000);
            await page.screenshot({
                path: 'Screenshot/NPayResult2.png', fullPage: false
            });
            console.log("2차 적립을 성공하였습니다.")

        } catch (e) {
            await page.waitForTimeout(2000);
            await page.screenshot({
                path: 'Screenshot/NPayFail2.png', fullPage: false
            });
            throw  Error("2차 포인트 받기 버튼 클릭 실패!" + e);
        }

        ////////////////////3차 광고////////////////////
        try {
            await page.waitForTimeout(2000);
            await page.goto('https://ofw.adison.co/u/naverpay/ads/67823') // 오전 10시 즉시적립
            console.log("3차 광고 페이지 접속에 성공하였습니다.")

        } catch (e) {
            let errorMsg = "3차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            throw Error(errorMsg + e);
        }
        try {
            await page.waitForTimeout(7000);
            await page.click("#app > div:nth-child(2) > div > div > div > button");
            await page.waitForTimeout(3000);
            await page.screenshot({
                path: 'Screenshot/NPayResult3.png', fullPage: false
            });
            console.log("3차 적립을 성공하였습니다.")

        } catch (e) {
            await page.waitForTimeout(2000);
            await page.screenshot({
                path: 'Screenshot/NPayFail3.png', fullPage: false
            });
            throw  Error("3차 포인트 받기 버튼 클릭 실패!" + e);
        }
        finally {
            let today = new Date();
            console.log(today.toLocaleDateString()+"의 네이버 페지 줍기를 완료하였습니다. 적립이 되었는지 실제로 확인 하십시오.");
        }
    }

})();