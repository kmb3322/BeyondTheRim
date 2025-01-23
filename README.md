## **스포츠 대중화의 시대에 발맞춰.**

Beyond The Rim은 직접 개발한 AI 모델을 사용하여, 사용자의 슛 폼을 정밀하게 분석하고 객관적인 점수를 제공합니다. 체계적인 피드백을 통해 기술을 향상시키고, 경기력을 극대화할 수 있도록 도와드립니다. 누구나 쉽게 사용할 수 있는 직관적인 인터페이스로 언제 어디서나 나만의 퍼스널 슈팅 코치를 만나보세요. 

**지금 바로 시작하여 당신의 경기력은 한 단계 업그레이드하세요.**

# [https://beyondtherim.monster](https://soju.monster)

# Front+Back: https://github.com/kmb3322/BeyondTheRim
# ML Model: https://github.com/Jaiwooyu/shooting_monster.git

---

## 1. 보다 객관적으로, 보다 나은 경기력을.

좋은 슈팅이란 것은 정의 내리기 참 힘든 것입니다. 무엇인 좋은 슈팅인지에 대한 어려운 질문을 해결하기 위해 저희는 AI 모델을 이용하였습니다. 슛 폼을 분석하기 앞서서, 해당 user input data가 슛 폼인지를 확인하고, 모델 학습 과정에서 농구공 트래킹을 효과적으로 하기 위해서 YOLOv8 기반의 농구공 트래킹 모델을 제작하였습니다.

![농구공 트래킹 모델의 학습 결과 그래프](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/6717b31b-ef44-45e3-8948-0376678a2c7d/results.png)

농구공 트래킹 모델의 학습 결과 그래프

제작한 모델을 이용해서 농구공을 트래킹함으로써 실제 프로 농구 선수들의 슈팅 여부를 인식하고, Google의 MediaPipe 프레임워크에서 제공하는 인체 자세 추정 솔루션인 MediaPipe Pose를 이용해서 인체의 포즈 랜드마크 데이터를 뽑아냅니다. 이후, 인코더-LSTM-디코더 구조를 가진 저희의 딥러닝 기반의 자세 분석 모델에 이 랜드마크 데이터를 학습시킵니다. 

![images-jaehyeong-post-d75d742b-9f88-4377-b4e7-56ffeae53386-autoencoder-architecture.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/3ee3d73e-6f2c-4c9d-8ea7-006dd4a15ef1/images-jaehyeong-post-d75d742b-9f88-4377-b4e7-56ffeae53386-autoencoder-architecture.png)

User input data가 들어오게 되면, 이를 모델에 적용해서 재구성하고, 가장 효과적인 슈팅 폼으로 다시 탄생시킵니다. 

## 2. 누구나 이해할 수 있는 효과적인 피드백.

User input 영상을 페이지에 게시하게 되면, 저희의 자체적인 기준으로 수립한 점수가 책정됩니다. 이는 날짜별 그래프로 보기 쉽게 홈 화면에 게시됩니다. 각 슛 폼에 대해서, 효과적인 텍스트 피드백을 제공하며, 게시한 영상 옆에는 개선된 슛 폼(초록색)과, 영상 내 사람의 슛 폼(빨간색)을 함께 오버레이해 알아보기 쉽게 영상 피드백을 제공합니다. 

![Screen Recording 2025-01-23 at 20.33.45.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/395a34c7-04fe-47cb-b62f-3c0619062953/Screen_Recording_2025-01-23_at_20.33.45.gif)

![Screen Recording 2025-01-23 at 20.31.32.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/ba0a84a9-028e-48db-9c6c-ccbe4c073f05/Screen_Recording_2025-01-23_at_20.31.32.gif)

## 3. 쉽고 직관적인 UI

BeyondTheRim은 PC, 모바일 어디서나 일관된 사용자 경험을 제공할 수 있도록 아름다운 반응형 UI로 설계되었습니다. 

PC의 경우 마우스로 부드럽게 3D 농구공을 움직일 수 있으며, 모바일의 경우 드래그 가능 영역을 분리하여 부드러운 관성 · 중력 값이 적용된 3D 농구공을 체험할 수 있습니다.

스크롤 시에도 부드러운 로고와 헤더 전환 애니메이션으로 더 만족스러운 시각적 경험을 제공합니다.

![Screen Recording 2025-01-23 at 20.56.01.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/2031637b-ed1b-4cb3-9852-053bc3b32d1e/Screen_Recording_2025-01-23_at_20.56.01.gif)

![Screen Recording 2025-01-23 at 20.30.46.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/f0f59654-9d83-4429-84b5-f05631f9d190/Screen_Recording_2025-01-23_at_20.30.46.gif)

![Screen Recording 2025-01-23 at 20.30.21.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/5cb4467d-e6dd-417a-89f2-f2b2c00deab0/Screen_Recording_2025-01-23_at_20.30.21.gif)

## 4. 자체적으로 수립한, 좋은 슈팅의 기준.

모델에 적용해 나온 개선된 슈팅의 랜드마크 데이터와, 유저의 영상으로부터 추출한 랜드마크 데이터를 먼저 비교합니다. 랜드마크 데이터 중, 슈팅에 중요한 양 어깨, 슈팅핸드의 팔꿈치, 손목, 그리고 가이드핸드의 팔꿈치 랜드마크 데이터만 선별해 차이 정도를 비교합니다. 다른 정도를 점수로 산출해 총점의 50프로를 반영합니다. 

총점의 나머지 50프로는 자체 판별 기준을 통해서 책정합니다. 슈팅 과정에서 팔꿈치는 잘 펴져 힘을 잘 전달하는지, 손목은 잘 꺾여 슈팅의 방향성을 잘 유지하는지 측정합니다. 또한, 무릎과 팔꿈치가 펴지는 타이밍이 일치해 하체의 힘을 잘 전달하고 있는지 판단합니다. 양쪽 어깨는 수평으로 잘 정렬되어있는지, 팔의 각도가 높아서 슈팅의 포물선이 잘 그려질지를 판단합니다. 이와 같은 기준들에 대해서 가중치를 책정하여 총점을 판단하고 user들에게 효과적인 피드백을 제공합니다.

# 💻Tech Stack

---

> **Frontend**
> 
> 
> React+Vite
> 

![React-icon.svg.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/37436834-10b4-4695-a58a-3050524c30b7/React-icon.svg.png)

![logo.svg](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/40cbea86-f08b-4c1f-af00-7639f19fef53/logo.svg)

> **Backend**
> 
> 
> node.js
> 
> Firebase Auth
> 
> Firestore DB
>
> AWS S3

![nodejs.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/aa7aadcf-db98-4440-a861-9f247db5c82e/nodejs.png)

![touchicon-180.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/718cfeb4-0e7d-46fa-b927-a915d3c21d50/touchicon-180.png)

> **MachineLearning API**
> 
> 
> YOLO v8
> 
> MediaPipe
> 

![64994922be624dae865d06a5_UltralyticsYOLO_full_blue.svg](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/c5afe6d0-7f27-469a-9317-f874175d3dfb/64994922be624dae865d06a5_UltralyticsYOLO_full_blue.svg)

![media.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/177ba3d9-e046-4cb3-8f8a-f4f7248fb972/media.png)

> **배포**
> 
> 
> AWS EC2
> 
> Vercel
> 
> Vercel
> 

![aws.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/6822bd39-56a8-4989-b2da-3ed58a442198/d6428696-6821-465d-9900-0ba1f79109ff.png)

![vercellogo.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/63c1bde3-52de-40da-99f9-eb59e790a83b/vercellogo.png)

# 👥Team

---

### Full Stack Dev 김민범

- 카이스트 전산학부
- [kmb332212@gmail.com](mailto:kmb332212@gmail.com)
- https://github.com/kmb3322

### AI Engineer 유재우

- 카이스트 전산학부
- [wodnjack@kaist.ac.kr](mailto:wodnjack@kaist.ac.kr)
- https://github.com/Jaiwooyu

# 😸개발 후기

---

### 김민범

- 인생 최초로 머신러닝 모델을 다뤄보고, 학습해본 경험이어서 매우 유익했다. 최종 모델에 들어간 재우형의 엄청난 노고에 너무나 감사했다!! 몰입캠프가 끝난 후에도 이 추억이 오래오래 남을 것 같다~~🥰

### 유재우

- 인생 처음 AI를 다뤄보고, 그것으로 좋아하는 것에 대한 프로젝트를 해낼 수 있어서 너무나 행복했다. 정말 후회없는 일주일, 후회없는 프로젝트였고, 옆에서 항상 노력해준 프론트엔드 마스터 민범이에게 고맙다는 말을 전한다. 🙇
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
