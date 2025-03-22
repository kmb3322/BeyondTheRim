## **스포츠 대중화의 시대에 발맞춰.**

Beyond The Rim은 직접 개발한 AI 모델을 사용하여, 사용자의 슛 폼을 정밀하게 분석하고 객관적인 점수를 제공합니다. 체계적인 피드백을 통해 기술을 향상시키고, 경기력을 극대화할 수 있도록 도와드립니다. 누구나 쉽게 사용할 수 있는 직관적인 인터페이스로 언제 어디서나 나만의 퍼스널 슈팅 코치를 만나보세요. 

**지금 바로 시작하여 당신의 경기력을 한 단계 업그레이드하세요.**

# [https://beyondtherim.monster](https://beyondtherim.monster)

# Front+Back: https://github.com/kmb3322/BeyondTheRim
# ML Model: https://github.com/Jaiwooyu/shooting_monster.git

---

## 1. 보다 객관적으로, 보다 나은 경기력을.

좋은 슈팅이란 것은 정의 내리기 참 힘든 것입니다. 무엇인 좋은 슈팅인지에 대한 어려운 질문을 해결하기 위해 저희는 AI 모델을 이용하였습니다. 슛 폼을 분석하기 앞서서, 해당 user input data가 슛 폼인지를 확인하고, 모델 학습 과정에서 농구공 트래킹을 효과적으로 하기 위해서 YOLOv8 기반의 농구공 트래킹 모델을 제작하였습니다.

![results](https://github.com/user-attachments/assets/91eb2693-b749-414d-8e46-e94f86af03c4)


농구공 트래킹 모델의 학습 결과 그래프

제작한 모델을 이용해서 농구공을 트래킹함으로써 실제 프로 농구 선수들의 슈팅 여부를 인식하고, Google의 MediaPipe 프레임워크에서 제공하는 인체 자세 추정 솔루션인 MediaPipe Pose를 이용해서 인체의 포즈 랜드마크 데이터를 뽑아냅니다. 이후, 인코더-LSTM-디코더 구조를 가진 저희의 딥러닝 기반의 자세 분석 모델에 이 랜드마크 데이터를 학습시킵니다. 
<img width="850" alt="images-jaehyeong-post-d75d742b-9f88-4377-b4e7-56ffeae53386-autoencoder-architecture" src="https://github.com/user-attachments/assets/c8f80241-c687-4a7d-a466-556a457658f9" />

User input data가 들어오게 되면, 이를 모델에 적용해서 재구성하고, 가장 효과적인 슈팅 폼으로 다시 탄생시킵니다. 

## 2. 누구나 이해할 수 있는 효과적인 피드백.

User input 영상을 페이지에 게시하게 되면, 저희의 자체적인 기준으로 수립한 점수가 책정됩니다. 이는 날짜별 그래프로 보기 쉽게 홈 화면에 게시됩니다. 각 슛 폼에 대해서, 효과적인 텍스트 피드백을 제공하며, 게시한 영상 옆에는 개선된 슛 폼(초록색)과, 영상 내 사람의 슛 폼(빨간색)을 함께 오버레이해 알아보기 쉽게 영상 피드백을 제공합니다. 



https://github.com/user-attachments/assets/6b3581f8-438a-4c79-8ab3-6f6365e68a2b



https://github.com/user-attachments/assets/1899c15e-09e7-4b62-91bb-d656e52f2660



## 3. 쉽고 직관적인 UI

BeyondTheRim은 PC, 모바일 어디서나 일관된 사용자 경험을 제공할 수 있도록 아름다운 반응형 UI로 설계되었습니다. 

PC의 경우 마우스로 부드럽게 3D 농구공을 움직일 수 있으며, 모바일의 경우 드래그 가능 영역을 분리하여 부드러운 관성 · 중력 값이 적용된 3D 농구공을 체험할 수 있습니다.

스크롤 시에도 부드러운 로고와 헤더 전환 애니메이션으로 더 만족스러운 시각적 경험을 제공합니다.


https://github.com/user-attachments/assets/2bbc609a-2ecf-4cc7-8750-520ee225e41b



https://github.com/user-attachments/assets/1fb341af-aaae-4ab7-9240-e1104b1bbee9



https://github.com/user-attachments/assets/47f3d03a-3620-49c1-879a-d5ab33afae9f



## 4. 자체적으로 수립한, 좋은 슈팅의 기준.

모델에 적용해 나온 개선된 슈팅의 랜드마크 데이터와, 유저의 영상으로부터 추출한 랜드마크 데이터를 먼저 비교합니다. 랜드마크 데이터 중, 슈팅에 중요한 양 어깨, 슈팅핸드의 팔꿈치, 손목, 그리고 가이드핸드의 팔꿈치 랜드마크 데이터만 선별해 차이 정도를 비교합니다. 다른 정도를 점수로 산출해 총점의 50프로를 반영합니다. 

총점의 나머지 50프로는 자체 판별 기준을 통해서 책정합니다. 슈팅 과정에서 팔꿈치는 잘 펴져 힘을 잘 전달하는지, 손목은 잘 꺾여 슈팅의 방향성을 잘 유지하는지 측정합니다. 또한, 무릎과 팔꿈치가 펴지는 타이밍이 일치해 하체의 힘을 잘 전달하고 있는지 판단합니다. 양쪽 어깨는 수평으로 잘 정렬되어있는지, 팔의 각도가 높아서 슈팅의 포물선이 잘 그려질지를 판단합니다. 이와 같은 기준들에 대해서 가중치를 책정하여 총점을 판단하고 user들에게 효과적인 피드백을 제공합니다.

# 💻Tech Stack
<img width="697" alt="Screenshot 2025-03-22 at 16 18 12" src="https://github.com/user-attachments/assets/b87f6cc2-c7f4-451e-8c5f-c8dc55f40773" />



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

