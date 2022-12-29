/**
 Created by WebStorm IDEA.
 * projectName    : NPay-CHOOLCHECK(앤페이-출첵)
 * fileName       : index
 * author         : wj
 * date           : 2022/12/15
 * description    : NPay-CHOOLCHECK 프로그램 환경설정
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2022/12/15        wj       최초 생성
 * 2022/12/16        wj       환경 설정 기능 코딩
 * 2022/12/24        wj       크롬 경로 주석 처리
 * 2022/12/29        wj       도커 경로 셋팅 및 코드 정리
 */

const config = {
    // 제작자는 이 스크립트가 정상적으로 작동함을 보장하지 않습니다.
    // 이 스크립트를 사용해서 발생하는 모든 문제는 사용자 본인 책임임을 알려드립니다.
    // 동의하시면 agree 항목의 값을 [true]로 변경하시기 바랍니다.
    agree: true,
    puppeteer: {
        launchOptions: {
            // defaultViewport: null,
            // devtools: true,
            // headless: false, // 브라우저 띄움
            // slowMo: 500,
            // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            // args: [],
            executablePath: process.env.CHROMIUM_PATH,
            args: ['--no-sandbox'], // This was important. Can't remember why

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