/**
 Created by WebStorm IDEA.
 * projectName    : NPay-CHOOLCHECK
 * packageName    :
 * fileName       : app
 * author         : wj
 * date           : 2023/02/17
 * description    : 네이버 페이 포인트 자동 줍기 출석 앱 - NaverPay-Online Ragpicker
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2023/02/17        wj       최초 생성 후 도커 이미지 빌드 1.0.16
 */

import puppeteer, {KnownDevices} from 'puppeteer'; // 퍼펫티어 라이브러리, 모바일 에뮬레이터 라이브러리
import config from './config.js'; // 설정 파일
import schedule from 'node-schedule'; // 특정시간 함수 실행 라이브러리

// import config from './configDev.js'; //도커 환경변수 추가 설정 파일

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
    const iPhone = KnownDevices['iPhone 13 Pro']; // 에뮬을 아이폰13프로 지정
    await page.emulate(iPhone);

    // await page.setViewport({
    //     width: 1280, height: 1024
    // }); // 화면 크기

    // await login(job1_1); // 00시 자정
    // await login(job1_2); // 8시 종료
    // await login(job1_3); // 9시 1차, 2차
    // await login(job2); // 10시 매일 적립

    try {
        let today = new Date();
        schedule.scheduleJob('01 00 00 * * *', () => { // 매일 오전 12시 프로그램 작동
            console.log("현재 시간: " + today.toLocaleString() + " 자정 네이버 페이 자동 출첵이 시작되었습니다.");
            login(job1_1) // 네이버 로그인후 자정광고 함수 실행
        });
    } catch (e) {
        throw  Error("시간에 맞춰 실행하지 못하였습니다. 수동적립후 오류를 확인 해주세요.\n" + e);
    }

    // try {
    //     let today = new Date();
    //     schedule.scheduleJob('02 00 08 * * *', () => { // 매일 오전 08시 프로그램 작동
    //         console.log("현재 시간: " + today.toLocaleString() + " 네이버 페이 자동 출첵이 시작되었습니다.");
    //         login(job1_2) // 네이버 로그인후 8시 광고 함수 실행
    //     });
    // } catch (e) {
    //     throw  Error("시간에 맞춰 실행하지 못하였습니다. 수동적립후 오류를 확인 해주세요.\n" + e);
    // }

    try {
        let today = new Date();
        schedule.scheduleJob('02 00 09 * * *', () => { // 매일 오전 09시 프로그램 작동
            console.log("현재 시간: " + today.toLocaleString() + " 네이버 페이 자동 출첵이 시작되었습니다.");
            login(job1_3) // 네이버 로그인후 9시 광고 함수 실행
        });
    } catch (e) {
        throw  Error("시간에 맞춰 실행하지 못하였습니다. 수동적립후 오류를 확인 해주세요.\n" + e);
    }


    try {
        let today = new Date();
        schedule.scheduleJob('02 00 10 * * *', () => { // 매일 오전 10시 프로그램 작동
            console.log("현재 시간: " + today.toLocaleString() + " 네이버 페이 자동 출첵이 시작되었습니다.");
            login(job2) // 네이버 로그인후 10시 광고 함수 실행
        });
    } catch (e) {
        throw  Error("시간에 맞춰 실행하지 못하였습니다. 수동적립후 오류를 확인 해주세요.\n" + e);
    }

    //////////////////// 네이버 로그인 함수 ////////////////////
    async function login(login){
        //////////////////// 네이버 로그인 계정 입력 ////////////////////

        await page.goto("https://nid.naver.com/nidlogin.login"); // 로그인 페이지로 이동
        try {
            await page.waitForTimeout(1000); // 로그인 페이지 로딩 대기
            await page.select("#locale_switch", "ko_KR"); // 크로미움 브라우저가 기본값 영어로 되어있음, 언어 한국어로 변경
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

        //////////////////// 네이버 로그인 ////////////////////

        await page.waitForTimeout(3000); // 로그인 처리 대기(봇 방지 처리)
        await page.click("#log\\.login");
        await page.waitForTimeout(1000); // 대기

        //////////////////// 네이버 로그인 실패처리 ////////////////////

        try {

            try {
                let loginAuthTitle = "2단계 인증 알림 발송 완료"
                const loginAuthMsg = await page.$("#push_title");
                const loginAuth = await page.evaluate(loginAuthMsg => loginAuthMsg.textContent, loginAuthMsg);
                await page.screenshot({path: 'Screenshot/loginAuth.png', fullPage: false});

                // return;
                if (loginAuthTitle == loginAuth) {
                    await page.click("#resendBtn");
                    console.log("휴대폰에서 네이버앱 로그인 인증을 빠르게 하세요.");
                    await page.waitForTimeout(8000);
                }

            } catch (e) {
                // await page.screenshot({
                //     path: 'Screenshot/loginOk.png', fullPage: false
                // });
                // console.log("로그인을 성공하였습니다.");
            }

            try {

                let loginOtpTitle = "OTP 인증번호를 입력해 주세요."
                const loginOtpMsg = await page.$("#otp_title");
                const loginOtp = await page.evaluate(loginOtpMsg => loginOtpMsg.textContent, loginOtpMsg);
                await page.screenshot({path: 'Screenshot/loginOtp.png', fullPage: false});
                if (loginOtpTitle == loginOtp) {
                    console.log("OTP 로그인이 감지되었습니다.\n휴대폰에서 네이버앱 로그인 2단계 인증을 해지후 도커앱을 다시 시작 하세요.");
                    return;
                }

            } catch (e) {
                // await page.screenshot({
                //     path: 'Screenshot/loginOk.png', fullPage: false
                // });
            }

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
                // await page.screenshot({
                //     path: 'Screenshot/loginOk.png', fullPage: false
                // });
                // console.log("로그인을 성공하였습니다.");
                // await ad1(); // 1차 광고 실행
            }
            await page.screenshot({
                path: 'Screenshot/loginOk.png', fullPage: false
            });
            console.log("로그인을 성공하였습니다.");
        } catch (e) {
        }
        login(); // Callback 적용
    }

    //////////////////// 자정 광고 함수 ////////////////////
    async function job1_1() {
        //////////////////// 1차 자정 광고 ////////////////////
        try {
            let alreadyDone = "클릭 적립은 캠페인당 1회만 적립 됩니다.2초 뒤 다음 페이지로 이동 합니다.";
            let endAd = "준비된 클릭 적립이 모두 소진 되었습니다.2초 뒤 다음 페이지로 이동 합니다.";

            await page.goto('https://ofw.adison.co/u/naverpay/ads/343265'); // 나이키 인기 신발
            await page.waitForTimeout(1000); // 접속 대기
            const modal = await page.$("body > div.cpc_popup > div > div.dim > p");
            const modalText = await page.evaluate(modal => modal.textContent, modal);
            console.log("알림창 내용: " + modalText);

            if (modalText == endAd) {
                await page.screenshot({
                    path: 'Screenshot/NPayEndAd1_1.png', fullPage: false
                });
                console.log("자정 1차 온라인 폐지가 소진 되어 종료되었습니다. 자정 2차 적립으로 진행합니다.");
            }
            if (modalText == alreadyDone) {
                await page.screenshot({
                    path: 'Screenshot/NPayAlreadyDone1_1.png', fullPage: false
                });
                console.log("이미 자정 1차 온라인 폐지 줍기를 하셨습니다. 자정 2차 적립으로 진행합니다.");
            }

            await page.screenshot({
                path: 'Screenshot/NPayMidnight1_1.png', fullPage: false
            });
            console.log("자정 1차 광고 페이지에 접속하였지만, 포인트 적립이 되었는지는 확인하세요!")
            await page.waitForTimeout(7000); // 2초후 자동 페이지 이동 대기
        } catch (e) {
            let errorMsg = "자정 1차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            await page.screenshot({
                path: 'Screenshot/NPayMidnightFailAccess1_1.png', fullPage: false
            });
            throw Error(errorMsg + e);
        }
        //
        // //////////////////// 2차 자정 광고 ////////////////////
        // try {
        //     let alreadyDone = "클릭 적립은 캠페인당 1회만 적립 됩니다.2초 뒤 다음 페이지로 이동 합니다.";
        //     let endAd = "준비된 클릭 적립이 모두 소진 되었습니다.2초 뒤 다음 페이지로 이동 합니다.";
        //
        //     await page.goto('https://ofw.adison.co/u/naverpay/ads/298915'); // 나이키 에어맥스 95
        //     await page.waitForTimeout(1000); // 접속 대기
        //
        //     const modal = await page.$("body > div.cpc_popup > div > div.dim > p");
        //     const modalText = await page.evaluate(modal => modal.textContent, modal);
        //     console.log("알림창 내용: " + modalText);
        //
        //     if (modalText == endAd) {
        //         await page.screenshot({
        //             path: 'Screenshot/NPayEndAd2.png', fullPage: false
        //         });
        //         console.log("2차 온라인 폐지가 소진 되어 종료되었습니다.");
        //     }
        //     if (modalText == alreadyDone) {
        //         await page.screenshot({
        //             path: 'Screenshot/NPayAlreadyDone2.png', fullPage: false
        //         });
        //         console.log("이미 2차 자정 온라인 폐지 줍기를 하셨습니다.");
        //     }
        //
        //     await page.screenshot({
        //         path: 'Screenshot/NPayMidnight2.png', fullPage: false
        //     });
        //     console.log("자정 2차 광고 페이지에 접속하였지만, 포인트 적립이 되었는지는 확인하세요!")
        //     await page.waitForTimeout(5000); // 2초후 페이지 이동 대기
        // } catch (e) {
        //     let errorMsg = "자정 2차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
        //     await page.screenshot({
        //         path: 'Screenshot/NPayMidnightFailAccess2.png', fullPage: false
        //     });
        //     throw Error(errorMsg + e);
        // }
        //
        // //////////////////// 3차 자정 광고 ////////////////////
        // try {
        //     let alreadyDone = "클릭 적립은 캠페인당 1회만 적립 됩니다.2초 뒤 다음 페이지로 이동 합니다.";
        //     let endAd = "준비된 클릭 적립이 모두 소진 되었습니다.2초 뒤 다음 페이지로 이동 합니다.";
        //
        //     await page.goto('https://ofw.adison.co/u/naverpay/ads/343265'); // 나이키 플래시 세일
        //     await page.waitForTimeout(1000); // 접속 대기
        //
        //     const modal = await page.$("body > div.cpc_popup > div > div.dim > p");
        //     const modalText = await page.evaluate(modal => modal.textContent, modal);
        //     console.log("알림창 내용: " + modalText);
        //
        //     if (modalText == endAd) {
        //         await page.screenshot({
        //             path: 'Screenshot/NPayEndAd2.png', fullPage: false
        //         });
        //         console.log("2차 온라인 폐지가 소진 되어 종료되었습니다.");
        //     }
        //     if (modalText == alreadyDone) {
        //         await page.screenshot({
        //             path: 'Screenshot/NPayAlreadyDone2.png', fullPage: false
        //         });
        //         console.log("이미 2차 자정 온라인 폐지 줍기를 하셨습니다.");
        //     }
        //
        //     await page.screenshot({
        //         path: 'Screenshot/NPayMidnight2.png', fullPage: false
        //     });
        //     console.log("자정 2차 광고 페이지에 접속하였지만, 포인트 적립이 되었는지는 확인하세요!")
        //     await page.waitForTimeout(5000); // 2초후 페이지 이동 대기
        // } catch (e) {
        //     let errorMsg = "자정 2차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
        //     await page.screenshot({
        //         path: 'Screenshot/NPayMidnightFailAccess2.png', fullPage: false
        //     });
        //     throw Error(errorMsg + e);
        // }

    }
    // async function job1_2() {
    //     //////////////////// 8시 광고 ////////////////////
    //     try {
    //         let alreadyDone = "클릭 적립은 캠페인당 1회만 적립 됩니다.2초 뒤 다음 페이지로 이동 합니다.";
    //         let endAd = "준비된 클릭 적립이 모두 소진 되었습니다.2초 뒤 다음 페이지로 이동 합니다.";
    //
    //         await page.goto('https://ofw.adison.co/u/naverpay/ads/348514'); // 갤럭시 온라인 체험존
    //
    //         await page.waitForTimeout(1000); // 접속 대기
    //
    //         const modal = await page.$("body > div.cpc_popup > div > div.dim > p");
    //         const modalText = await page.evaluate(modal => modal.textContent, modal);
    //         console.log("알림창 내용: " + modalText);
    //
    //         if (modalText == endAd) {
    //             await page.screenshot({
    //                 path: 'Screenshot/NPayEndAd1_2.png', fullPage: false
    //             });
    //             console.log("8시 광고 온라인 폐지가 소진 되어 종료되었습니다.");
    //         }
    //         if (modalText == alreadyDone) {
    //             await page.screenshot({
    //                 path: 'Screenshot/NPayAlreadyDone1_2.png', fullPage: false
    //             });
    //             console.log("8시 광고를 이미 온라인 폐지 줍기 하셨습니다.");
    //         }
    //
    //         await page.screenshot({
    //             path: 'Screenshot/NPay1_2.png', fullPage: false
    //         });
    //         console.log("8시 광고 페이지에 접속하였지만, 포인트 적립이 되었는지는 확인하세요!")
    //         await page.waitForTimeout(7000); // 2초후 자동 페이지 이동 대기
    //     } catch (e) {
    //         let errorMsg = "8시 광고 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
    //         await page.screenshot({
    //             path: 'Screenshot/NPayFailAccess1_2.png', fullPage: false
    //         });
    //         throw Error(errorMsg + e);
    //     }
    // }

    //////////////////// 9시 광고 함수 ////////////////////
    async function job1_3() {
        //////////////////// 9시 광고 1차 ////////////////////
        try {
            let alreadyDone = "클릭 적립은 캠페인당 1회만 적립 됩니다.2초 뒤 다음 페이지로 이동 합니다.";
            let endAd = "준비된 클릭 적립이 모두 소진 되었습니다.2초 뒤 다음 페이지로 이동 합니다.";

            await page.goto('https://ofw.adison.co/u/naverpay/ads/230108'); // 웰컴 저축은행

            await page.waitForTimeout(1000); // 접속 대기

            const modal = await page.$("body > div.cpc_popup > div > div.dim > p");
            const modalText = await page.evaluate(modal => modal.textContent, modal);
            console.log("알림창 내용: " + modalText);

            if (modalText == endAd) {
                await page.screenshot({
                    path: 'Screenshot/NPayEndAd1_3_1.png', fullPage: false
                });
                console.log("9시 1차 광고 온라인 폐지가 소진 되어 종료되었습니다. 9시 2차 광고 적립으로 진행합니다.");
            }
            if (modalText == alreadyDone) {
                await page.screenshot({
                    path: 'Screenshot/NPayAlreadyDone1_3_1.png', fullPage: false
                });
                console.log("9시 1차 광고를 이미 온라인 폐지 줍기 하셨습니다. 9시 2차 적립으로 진행합니다.");
            }
            //
            // //////// 화면 이동후 광고 종료 여부 확인 //////////////
            //
            // await page.waitForTimeout(3000); // 페이지 이동후 잠시 대기
            //
            // let endAd2 = "광고 참여가 종료되었습니다.다른 광고를 이용해 주세요 ";
            //
            //
            // const modal2 = await page.$("body > div.blocker.current > div > div:nth-child(1)");
            // const modalText2 = await page.evaluate(modal2 => modal2.textContent, modal2);
            // console.log("알림창 내용: " + modalText2);
            // if (modalText2 == endAd2) {
            //     await page.screenshot({
            //         path: 'Screenshot/NPayEnd1_3_1.png', fullPage: false
            //     });
            //     console.log("9시 1차 광고가 종료되어 출첵을 실패하였습니다. 확인후 다시 시도 해주세요.");
            // }
            //
            await page.screenshot({
                path: 'Screenshot/NPay1_3_1.png', fullPage: false
            });
            console.log("9시 1차 광고 페이지에 접속하였지만, 포인트 적립이 되었는지는 확인하세요!")

            await page.waitForTimeout(7000); // 2초후 자동 페이지 이동 대기

        } catch (e) {
            let errorMsg = "9시 1차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            await page.screenshot({
                path: 'Screenshot/NPayFailAccess1_3_1.png', fullPage: false
            });
            throw Error(errorMsg + e);
        }

        //////////////////// 9시 광고 2차 ////////////////////

        try {
            let alreadyDone = "클릭 적립은 캠페인당 1회만 적립 됩니다.2초 뒤 다음 페이지로 이동 합니다.";
            let endAd = "준비된 클릭 적립이 모두 소진 되었습니다.2초 뒤 다음 페이지로 이동 합니다.";

            await page.goto('https://ofw.adison.co/u/naverpay/ads/298919'); // 나이키 와플

            await page.waitForTimeout(1000); // 접속 대기

            const modal = await page.$("body > div.cpc_popup > div > div.dim > p");
            const modalText = await page.evaluate(modal => modal.textContent, modal);
            console.log("알림창 내용: " + modalText);


            if (modalText == endAd) {
                await page.screenshot({
                    path: 'Screenshot/NPayEndAd1_3_2.png', fullPage: false
                });
                console.log("9시 2차 온라인 폐지가 소진 되어 종료되었습니다.");
            }
            if (modalText == alreadyDone) {
                await page.screenshot({
                    path: 'Screenshot/NPayAlreadyDone1_3_2.png', fullPage: false
                });
                console.log("9시 2차 광고를 이미 온라인 폐지 줍기 하셨습니다.");
            }
            //
            // //////// 화면 이동후 광고 종료 여부 확인 //////////////
            //
            // await page.waitForTimeout(3000); // 페이지 이동후 잠시 대기
            // let endAd2 = "광고 참여가 종료되었습니다.다른 광고를 이용해 주세요 ";
            // const modal2 = await page.$("body > div.blocker.current > div > div:nth-child(1)");
            // const modalText2 = await page.evaluate(modal2 => modal2.textContent, modal2);
            // console.log("알림창 내용: " + modalText2);
            // if (modalText2 == endAd2) {
            //     await page.screenshot({
            //         path: 'Screenshot/NPayEnd1_3_2.png', fullPage: false
            //     });
            //     console.log("9시 2차 광고가 종료되어 출첵을 실패하였습니다. 확인후 다시 시도 해주세요.");
            // }

            await page.screenshot({
                path: 'Screenshot/NPay1_3_2.png', fullPage: false
            });
            console.log("9시 2차 페이지에 접속하였지만, 포인트 적립이 되었는지는 확인하세요!")

            await page.waitForTimeout(7000); // 2초후 자동 페이지 이동 대기

        } catch (e) {
            let errorMsg = "9시 2차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
            await page.screenshot({
                path: 'Screenshot/NPayFailAccess1_3_2.png', fullPage: false
            });
            throw Error(errorMsg + e);
        }

    }


    //////////////////// 매일적립 광고 함수 ////////////////////
    async function job2() {

        //////////////////// 1차 광고 ////////////////////
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
            const callToActionBtn = await page.$("#app > div:nth-child(3) > div > div > div > button > span");
            const btnText = await page.evaluate(callToActionBtn => callToActionBtn.textContent, callToActionBtn);
            console.log("버튼상태:" + btnText);
            if (btnText == possibleBtn) {
                console.log("현재 상태 광고 참여 가능합니다. 이어서 진행합니다.");
                await page.click("#app > div:nth-child(3) > div > div > div > button"); // 모바일 버전 포인트 받기 버튼
                // await page.click("#app > div:nth-child(2) > div > div > div > button"); // PC 버전 포인트 받기 버튼
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

            const modal = await page.$("body > div.blocker.current > div > div:nth-child(1)");
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
        //
        // //////////////////// 2차 광고 ////////////////////
        // try {
        //     await page.goto('https://ofw.adison.co/u/naverpay/ads/72557'); // 오전 10시 현장결제
        //
        //     await page.waitForTimeout(2000);
        //     await page.screenshot({
        //         path: 'Screenshot/NPay2.png', fullPage: false
        //     });
        //     console.log("2차 광고 페이지 접속에 성공하였습니다.")
        // } catch (e) {
        //     let errorMsg = "2차 적립 페이지에 접속 할 수 없습니다. 다시 확인후 재시도 해주십시오."
        //     await page.screenshot({
        //         path: 'Screenshot/NPayFailAccess2.png', fullPage: false
        //     });
        //     throw Error(errorMsg + e);
        // }
        // try {
        //     await page.waitForTimeout(5000);
        //
        //     let possibleBtn = "\n" + "                  참여하고 포인트받기\n" + "              ";
        //     const callToActionBtn = await page.$("#app > div:nth-child(3) > div > div > div > button > span"); // 모바일 버전
        //     // const callToActionBtn = await page.$("#app > div:nth-child(2) > div > div > div > button > span"); // PC 버전
        //     const btnText = await page.evaluate(callToActionBtn => callToActionBtn.textContent, callToActionBtn);
        //     console.log("버튼상태: " + btnText);
        //
        //     if (btnText == possibleBtn) {
        //         console.log("현재 상태 광고 참여 가능합니다. 이어서 진행합니다.");
        //         await page.click("#app > div:nth-child(3) > div > div > div > button"); // 모바일 버전 포인트 받기 버튼
        //         // await page.click("#app > div:nth-child(2) > div > div > div > button"); // PC 버전 포인트 받기 버튼
        //         await page.waitForTimeout(3000);
        //
        //     }
        //
        //     let completionBtn = "\n" + "                  참여 완료\n" + "              ";
        //     if (btnText == completionBtn) {
        //         console.log("광고 참여 완료가 확인되어 출첵이 되지 않았습니다.\n이어서 3차 광고 적립을 진행합니다.");
        //         await page.screenshot({
        //             path: 'Screenshot/NPayResult2.png', fullPage: false
        //         });
        //         await page.waitForTimeout(1000);
        //     }
        //
        //     let endAd = "광고 참여가 종료되었습니다.다른 광고를 이용해 주세요 ";
        //     const modal = await page.$("body > div.blocker.current > div > div:nth-child(1)"); // 모바일 버전
        //     // const modal = await page.$("#app > div.blocker.current > div > div:nth-child(1)"); // PC 버전
        //     const modalText = await page.evaluate(modal => modal.textContent, modal);
        //     console.log("알림창 내용: " + modalText);
        //
        //     if (modalText == endAd) {
        //         await page.screenshot({
        //             path: 'Screenshot/NPayEnd2.png', fullPage: false
        //         });
        //         console.log("광고가 종료되어 출첵을 실패하였습니다. 확인후 다시 시도 해주세요.");
        //     }
        //
        // } catch (e) {
        //     await page.screenshot({
        //         path: 'Screenshot/NPaySuccess2.png', fullPage: false
        //     });
        //     console.log("2차 적립을 성공하였습니다.");
        // }

        //////////////////// 3차 광고 ////////////////////

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
            const callToActionBtn = await page.$("#app > div:nth-child(3) > div > div > div > button > span");
            // const callToActionBtn = await page.$("#app > div:nth-child(2) > div > div > div > button > span"); // PC 버전
            const btnText = await page.evaluate(callToActionBtn => callToActionBtn.textContent, callToActionBtn);
            console.log("버튼상태: " + btnText);

            if (btnText == possibleBtn) {
                console.log("현재 상태 광고 참여 가능합니다. 이어서 진행합니다.");
                await page.click("#app > div:nth-child(3) > div > div > div > button"); // 모바일 버전 포인트 받기 버튼
                // await page.click("#app > div:nth-child(2) > div > div > div > button"); // PC 버전 포인트 받기 버튼
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
            const modal = await page.$("body > div.blocker.current > div > div:nth-child(1)"); // 모바일 버전
            // const modal = await page.$("#app > div.blocker.current > div > div:nth-child(1)"); // PC 버전
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
        }
        finally {
            let today = new Date();
            console.log("네이버 페이 포인트 줍기를 완료하였습니다.\n적립이 되었는지 실제로 확인 하십시오.\n완료 시각: " + today.toLocaleString());
        }
    }

})();