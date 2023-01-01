/**
 Created by WebStorm IDEA.
 * projectName    : NPay-CHOOLCHECK(앤페이-출첵)
 * fileName       : config.js
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
 * 2022/12/13        wj       코드 정리
 * 2023/01/01        wj       배포용 수정
 * 2023/01/02        wj       로그인 아이디&비밀번호를 임의 계정 입력후 테스트 진행(indexDev)
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
            headless: false, // 브라우저 띄움
            // slowMo: 500,
            executablePath: process.env.CHROMIUM_PATH,
            args: ['--no-sandbox']

        },
        viewportOptions: {
            width: 1080,
            height: 1024,
        },
    },
    id: 'wj',
    pw: 'wj'
}

export default config