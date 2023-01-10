/**
 Created by WebStorm IDEA.
 * projectName    : NPay-CHOOLCHECK(앤페이-출첵)
 * fileName       : indexDev
 * author         : wj
 * date           : 2023/01/01
 * description    : 네이버 페이 자동 출석 프로그램 - NaverPay-attendanceCheck
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2023/01/01        wj       최초 생성
 * 2023/01/01        wj       배포용, 개발용(indexDev) 분리후 배포용 일부 수정 및 개발용 코드 개발
 * 2023/01/02        wj       네이버 로그인 실패 처리 기능 구현
 * 2023/01/03        wj       네이버 로그인 실패 처리 버그 수정, 중복 코드 제거(브라우저 탭 열기)
 * 2023/01/04        wj       네이버 로그인 실패 처리 버그 마무리, 앱 시작 시간 및 완료 메시지 기능 추가
 * 2023/01/05        wj       코드 정리
 * 2023/01/07        wj       1, 2차 광고 알고리즘 수정, 일부 로그 메시지 수정
 * 2023/01/08        wj       2차 광고 버그 수정(실제로 적립이 안되었는데 성공 메시지 출력)
 * 2023/01/10        wj       3차 광고 알고리즘 전면 수정, 코드 정리
 * 2023/01/11        wj       도커 환경변수에서 앱 사용동의 약관, 네이버 아이디&비밀번호를 입력하는 방식의 새로운 기능 추가
 */
/* Reference
 * 파이썬 - 셀레니움으로 네이버 로그인하기, 캡차(보안문자) 우회 : https://private.tistory.com/119
 * [ 파이썬 ] 네이버 자동 로그인 후 클릭 이벤트 응모하기 : https://jeong-f.tistory.com/148
 */

import puppeteer from 'puppeteer'; // 퍼펫티어 라이브러리
// import config from './config.js'; // 설정 파일
import schedule from 'node-schedule'; // 특정시간 함수 실행 라이브러리

import config from './configDev.js'; //도커 환경변수 추가 설정 파일

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

    await Job();

    // try {
    //     let today = new Date();
    //     schedule.scheduleJob('25 43 21 * * *', () => { // 매일 오전 10시 프로그램 작동
    //         console.log("현재 시간: " + today.toLocaleString() + " 네이버 페이 자동 출첵이 시작되었습니다.");
    //         Job(); // 자동화
    //     });
    // } catch (e) {
    //     throw  Error("시간에 맞춰 실행하지 못하였습니다. 수동적립후 오류를 확인 해주세요.\n" + e);
    // }

    async function Job() {

        ////////////////////네이버 로그인////////////////////

        await page.goto("https://nid.naver.com/nidlogin.login"); // 로그인 페이지로 이동
        try {
            await page.waitForTimeout(1000); // 로그인 페이지 로딩 대기
            await page.select("#locale_switch", "ko_KR"); // 크로미움 브라우저가 기본값 영어로 되있음, 언어 한국어로 변경
            await page.waitForTimeout(2000); // 로그인 페이지 로딩 대기

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

        ////////////////////네이버 로그인 실패처리////////////////////

        await page.waitForTimeout(3000); // 로그인 처리 대기(봇 방지 처리)
        await page.click("#log\\.login");
        await page.waitForTimeout(1000); // 대기

        try {

            const errMsg = await page.$("#err_common > div");
            let loginErrMsg = "\n" + "                                        아이디(로그인 전용 아이디) 또는 비밀번호를 잘못 입력했습니다." + " 입력하신 내용을 다시 확인해주세요.\n" + "                                    ";
            const errMsgText = await page.evaluate(errMsg => errMsg.textContent, errMsg);

            if (errMsgText == loginErrMsg) {
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
            // await ad1(); // 1차 광고 실행
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
            let possibleBtn = "\n" + "                  참여하고 포인트받기\n" + "              ";
            const callToActionBtn = await page.$("#app > div:nth-child(2) > div > div > div > button > span");
            const btnText = await page.evaluate(callToActionBtn => callToActionBtn.textContent, callToActionBtn);
            console.log("버튼상태: " + btnText);
            if (btnText == possibleBtn) {
                console.log("현재 상태 광고 참여 가능합니다. 이어서 진행합니다.");
                await page.click("#app > div:nth-child(2) > div > div > div > button"); // 포인트 받기 버튼
                await page.waitForTimeout(3000);
                await page.screenshot({
                    path: 'Screenshot/NPaySuccess1.png', fullPage: false
                });
                console.log("1차 적립을 성공하였습니다.");
            }

            let completionBtn = "\n" + "                  참여 완료\n" + "              ";
            if (btnText == completionBtn) {
                console.log("광고 참여 완료가 확인되어 출첵이 되지 않았습니다.\n이어서 2차 광고 적립을 진행합니다.");
                await page.screenshot({
                    path: 'Screenshot/NPayResult1.png', fullPage: false
                });
                await page.waitForTimeout(1000);
            }

            let endAd = "광고 참여가 종료되었습니다.다른 광고를 이용해 주세요 ";
            const modal = await page.$("#app > div.blocker.current > div > div:nth-child(1)");
            const modalText = await page.evaluate(modal => modal.textContent, modal);
            console.log("알림창 내용: " + modalText);

            if (modalText == endAd) {
                await page.screenshot({
                    path: 'Screenshot/NPayEnd1.png', fullPage: false
                });
                console.log("광고가 종료되어 출첵을 실패하였습니다. 확인후 다시 시도 해주세요.");
            }

        } catch (e) {

        }

        ////////////////////2차 광고////////////////////
        try {
            await page.goto('https://ofw.adison.co/u/naverpay/ads/72557'); // 오전 10시 현장결제
            await page.waitForTimeout(2000);
            await page.screenshot({
                path: 'Screenshot/NPay2.png', fullPage: false
            });
            console.log("2차 광고 페이지 접속에 성공하였습니다.")
        } catch (e) {
            let errorMsg = "2차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            await page.screenshot({
                path: 'Screenshot/NPayFailAccess2.png', fullPage: false
            });
            throw Error(errorMsg + e);
        }
        try {
            await page.waitForTimeout(5000);

            let possibleBtn = "\n" + "                  참여하고 포인트받기\n" + "              ";
            const callToActionBtn = await page.$("#app > div:nth-child(2) > div > div > div > button > span");
            const btnText = await page.evaluate(callToActionBtn => callToActionBtn.textContent, callToActionBtn);
            console.log("버튼상태: " + btnText);

            if (btnText == possibleBtn) {
                console.log("현재 상태 광고 참여 가능합니다. 이어서 진행합니다.");
                await page.click("#app > div:nth-child(2) > div > div > div > button"); // 포인트 받기 버튼
                await page.waitForTimeout(3000);

            }

            let completionBtn = "\n" + "                  참여 완료\n" + "              ";
            if (btnText == completionBtn) {
                console.log("광고 참여 완료가 확인되어 출첵이 되지 않았습니다.\n이어서 3차 광고 적립을 진행합니다.");
                await page.screenshot({
                    path: 'Screenshot/NPayResult2.png', fullPage: false
                });
                await page.waitForTimeout(1000);
            }

            let endAd = "광고 참여가 종료되었습니다.다른 광고를 이용해 주세요 ";
            const modal = await page.$("#app > div.blocker.current > div > div:nth-child(1)");
            const modalText = await page.evaluate(modal => modal.textContent, modal);
            console.log("알림창 내용: " + modalText);

            if (modalText == endAd) {
                await page.screenshot({
                    path: 'Screenshot/NPayEnd2.png', fullPage: false
                });
                console.log("광고가 종료되어 출첵을 실패하였습니다. 확인후 다시 시도 해주세요.");
            }

        } catch (e) {
            await page.screenshot({
                path: 'Screenshot/NPaySuccess2.png', fullPage: false
            });
            console.log("2차 적립을 성공하였습니다.");
        }

        ////////////////////3차 광고////////////////////

        try {
            await page.goto('https://ofw.adison.co/u/naverpay/ads/67823') // 오전 10시 즉시적립
            await page.waitForTimeout(2000);
            await page.screenshot({
                path: 'Screenshot/NPay3.png', fullPage: false
            });
            console.log("3차 광고 페이지 접속에 성공하였습니다.")
        } catch (e) {
            let errorMsg = "3차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            await page.screenshot({
                path: 'Screenshot/NPayFailAccess3.png', fullPage: false
            });
            throw Error(errorMsg + e);
        }
        try {
            await page.waitForTimeout(5000);

            let possibleBtn = "\n" + "                  참여하고 포인트받기\n" + "              ";
            const callToActionBtn = await page.$("#app > div:nth-child(2) > div > div > div > button > span");
            const btnText = await page.evaluate(callToActionBtn => callToActionBtn.textContent, callToActionBtn);
            console.log("버튼상태: " + btnText);

            if (btnText == possibleBtn) {
                console.log("현재 상태 광고 참여 가능합니다. 이어서 진행합니다.");
                await page.click("#app > div:nth-child(2) > div > div > div > button"); // 포인트 받기 버튼
                await page.waitForTimeout(3000);

            }

            let completionBtn = "\n" + "                  참여 완료\n" + "              ";
            if (btnText == completionBtn) {
                console.log("광고 참여 완료가 확인되어 출첵이 되지 않았습니다.\n");
                await page.screenshot({
                    path: 'Screenshot/NPayResult3.png', fullPage: false
                });
                await page.waitForTimeout(1000);
            }

            let endAd = "광고 참여가 종료되었습니다.다른 광고를 이용해 주세요 ";
            const modal = await page.$("#app > div.blocker.current > div > div:nth-child(1)");
            const modalText = await page.evaluate(modal => modal.textContent, modal);
            console.log("알림창 내용: " + modalText);

            if (modalText == endAd) {
                await page.screenshot({
                    path: 'Screenshot/NPayEnd3.png', fullPage: false
                });
                console.log("광고가 종료되어 출첵을 실패하였습니다. 확인후 다시 시도 해주세요.");
                // return;
            }

        } catch (e) {
            await page.screenshot({
                path: 'Screenshot/NPaySuccess3.png', fullPage: false
            });
            console.log("3차 적립을 성공하였습니다.");
        } finally {
            let today = new Date();
            console.log("네이버 페이 포인트 줍기를 완료하였습니다.\n적립이 되었는지 실제로 확인 하십시오.\n완료 시각: " + today.toLocaleString());
        }
    }

})();
