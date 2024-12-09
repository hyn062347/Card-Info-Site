# Card Info Site
1인 개발

## 목차
1. 소개
2. 개발환경
3. 기능
4. 프로젝트 의존성
5. 프로젝트 실행

## 소개
이 사이트는 원하는 카드의 모든 버전을 쉽게 검색하고 상세 정보를 확인하기 위해 개발했습니다.

## 개발환경
`MacOS 15.1`


## 기능
React Autosuggest를 활용하여 검색어를 입력하면 자동완성이 되며, 검색을 수행하면 Scryfall.com의 API를 받아와 화면에 보여줍니다.
카드를 검색해서 들어가게되면 Puppeteer를 활용하여 Cardkingdom사이트에서 같은 카드의 가격을 찾아옵니다.

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
npm install cheerio
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
