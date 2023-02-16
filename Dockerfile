# Author : WJ
# Revision Date : 2022/12/23
# Modified Date : 2023/02/17

# Reference 참고
# https://thumbsu.tistory.com/14 yarn 명령어 사용법
# https://lahuman.github.io/dockerfile_alpine_puppeteer/ node:Alpine 에서 puppeteer 기동
# https://darrengwon.tistory.com/804 node.js 기반 앱을 docker 환경에서 실행해보자
# https://magpienote.tistory.com/149 Docker로 express 개발 환경 구성하기
# https://blog.naver.com/chandong83/221006388637 도커 이미지 tar만들기
# https://www.leafcats.com/240 docker image를 tar 파일로 저장 (export / import / save / load)
# https://lahuman.github.io/dockerfile_alpine_puppeteer/ [Dockerfile] node:Alpine에서 puppeteer 기동 & 한글 깨짐 처리

FROM alpine
#FROM node:alpine

MAINTAINER WJ <02145s1@gmail.com>

USER root

# Create app directory
RUN mkdir -p /app
RUN mkdir -p /app/Screenshot
RUN cd /app

WORKDIR /app

# 내부 실행 파일 복사
COPY package.json ./
COPY package-lock.json ./
COPY app.js ./
COPY config.js ./

RUN apk update
RUN apk upgrade

# 한글 폰트 설치
RUN apk add fontconfig
RUN mkdir -p /usr/share/fonts
RUN cd /usr/share/fonts
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip
RUN unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont
RUN fc-cache -f -v

# 앱 디렉토리로 다시 이동
RUN cd /app

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm

# npm install 시 Chromium 다운로드 제외 처리
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# chromium-browser 설치 위치를 환경 변수에 저장
ENV CHROMIUM_PATH /usr/bin/chromium-browser

# 앱 디렉토리로 다시 이동
RUN cd /app

# 시간을 서울타임으로 변경
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone

# Set the lang
ENV LANG=ko_KR.UTF-8 \
    LANGUAGE=ko_KR.UTF-8

# node module 설치
RUN npm install --unsafe-perm

# 인자값을 지정하지 않을시 node app.js를 실행
CMD [ "npm", "start" ]

# 빌드 및 tar파일 생성 방법
# docker build -t npay-choolcheck:[버전] .
# docker commit -p [컨테이너ID] npay-choolcheck:[버전]
# docker save -o npay-choolcheck-[버전].tar npay-choolcheck:[버전]
