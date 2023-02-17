/**
 Created by WebStorm IDEA.
 * projectName    : NPay-CHOOLCHECK(앤페이-출첵)
 * fileName       : configDev.js
 * author         : wj
 * date           : 2023/01/11
 * description    : NPay-CHOOLCHECK 프로그램 환경설정
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2023/01/11        wj       최초 생성, 도커 환경변수에서 프로그램 사용 동의서 및 계정 정보를 입력 할 수 있도록 변경.
 * 2023/02/17        wj       동의 항목 주석 제거
 * 2023/02/18        wj       도커 환경변수 항목 config.js로 마이그레이션후 이전 버전 복원(개발용으로 사용될 예정)
 */

const config = {
    // 제작자는 이 앱이 정상적으로 작동함을 보장하지 않습니다.
    // 이 앱을 사용해서 발생하는 모든 문제는 사용자 본인 책임임을 알려드립니다.
    // 동의하시면 agree 항목의 값을 [true]로 변경하시기 바랍니다.

    agree: true,
    puppeteer: {
        launchOptions: {
            // defaultViewport: null,
            // devtools: true,
            // headless: false, // 브라우저 띄움
            // slowMo: 500,
            executablePath: process.env.CHROMIUM_PATH,
            args: ['--no-sandbox']

        },
        viewportOptions: {
            width: 1080,
            height: 1024,
        },
    },
    id: '',
    pw: ''
}

export default config
