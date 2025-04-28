# Card Info Site
1인 개발

## 목차
1. 소개
2. 링크
3. 프로젝트 구조도
4. 개발환경
5. 기능
6. 프로젝트 의존성
7. 프로젝트 실행
8. 쇼케이스

## 소개
이 사이트는 Scryfall API를 이용하여 TCG게임 매직 더 개더링의 원하는 모든 카드 버전을 쉽게 검색하고 가격과 상세정보를 쉽게 확인하기 위해 개발했습니다.

2024년 12월 추가 - 반응형 웹을 지원합니다.

2025 1월 추가 - ChatGPT API를 활용하여 카드의 요약을 제공합니다.

## 링크
https://wufflefoils.netlify.app/

※ 영어검색만 지원합니다.

## 프로젝트 구조도
![Image](https://github.com/user-attachments/assets/e3ec8b84-e001-4bba-9b5e-c5e01505f306)

로컬서버

![Image](https://github.com/user-attachments/assets/79b56159-f3a1-4a2f-b7ca-c9277a1b0a7f)

Netlify Serverless 구조

## 개발툴
`VSCode` `React` `NodeJS` `ChatGPT API` `Scryfall API` `Netlify`

## 기능
React Autosuggest를 활용하여 검색어를 입력하면 자동완성이 되며, 검색을 수행하면 Scryfall.com의 API를 받아와 모든 카드의 버전을 화면에 보여줍니다.
카드를 선택해서 페이지를 이동하면 Puppeteer를 활용하여 Cardkingdom사이트에서 같은 카드의 가격을 찾아오고, Chat GPT API를 사용하여 해당 카드의 요약을 제공합니다.

## 프로젝트 의존성
1. 프로젝트를 클론합니다.
2. 필요한 의존성을 설치합니다.

+ 프론트엔드 의존성
```bash
cd front-end/
```

```bash

npm install axios
```

```bash
npm install react
```

```bash
npm install react-autosuggest
```

```bash
npm install react-router-dom
```

+ 백엔드 의존성
```bash
cd back-end/
```

```bash
npm install axios
```

```bash
npm install express
```

```bash
npm install puppeteer
```


## 프로젝트 실행

+ 프론트엔드 실행
```bash
cd front-end/
```

```bash
npm start
```

+ 백엔드 실행
```bash
cd back-end/
```

```bash
node server.js
```

## 쇼케이스
<img width="2027" alt="스크린샷 2024-12-09 19 34 32" src="https://github.com/user-attachments/assets/434d41a2-4761-4e3f-8a62-3827594ddc46">
초기화면

<img width="2029" alt="스크린샷 2024-12-09 19 35 25" src="https://github.com/user-attachments/assets/6dc7fdae-02fa-451e-a207-8cac1f00d025">
검색화면 (자동완성)

<img width="2029" alt="스크린샷 2024-12-09 19 36 04" src="https://github.com/user-attachments/assets/7c903023-977d-4e4d-a3fb-435992687fcd">
검색 결과 화면

<img width="2030" alt="스크린샷 2024-12-09 19 36 38" src="https://github.com/user-attachments/assets/101038cd-6d53-462a-8457-359bf88d0d57">
카드 선택 후 카드 버전 선택화면

<img width="798" alt="Image" src="https://github.com/user-attachments/assets/81f1a493-8b29-4762-8ab0-60ca04ef5170">

카드 디테일 화면

<img width="1067" alt="스크린샷 2024-12-09 19 58 12" src="https://github.com/user-attachments/assets/f943721e-408b-46a6-8acf-0c2b60553785">
헤더 컴포넌트 자동완성








