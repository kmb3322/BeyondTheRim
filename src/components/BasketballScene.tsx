// client/src/components/BasketballScene.tsx
import { Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useRef, useState } from 'react';
import BasketballModel, { BasketballModelHandle } from './BasketballModel';

type BasketballSceneProps = {
  // MainPage에서 전달받은 높이 (버튼 바로 위까지)
  sceneHeight: number;
};

const BasketballScene: React.FC<BasketballSceneProps> = ({ sceneHeight }) => {
  // 농구공 모델에 접근하기 위한 ref
  const modelRef = useRef<BasketballModelHandle>(null);

  // 오버레이에서 사용하는 상태
  const [isDragging, setIsDragging] = useState(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const totalDelta = useRef(0);
  const tapThreshold = 5;

  // === 오버레이 pointer 이벤트 핸들러 ===
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 오버레이 영역에서는 스크롤을 막기 위해 preventDefault
    e.preventDefault();
    setIsDragging(true);
    totalDelta.current = 0;
    prevPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaX = e.clientX - prevPointer.current.x;
    const deltaY = e.clientY - prevPointer.current.y;
    totalDelta.current += Math.abs(deltaX) + Math.abs(deltaY);

    // 농구공 모델에 회전 적용
    if (modelRef.current) {
      modelRef.current.applyRotation(deltaX, deltaY);
    }

    prevPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    // 드래그 이동량이 작으면 "탭"으로 간주, 바운스 트리거
    if (totalDelta.current < tapThreshold && modelRef.current) {
      modelRef.current.triggerBounce();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 1) 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[0, 5, 5]} intensity={1.5} />
        <Suspense fallback={<Html>Loading...</Html>}>
          <group position={[0, -1.2, 0]}>
            <BasketballModel ref={modelRef} />
          </group>
        </Suspense>
      </Canvas>

      {/* 
        2) "투명 오버레이" DIV.
           - 여기서만 touch-action: none → 스크롤 방지
           - 오버레이의 높이를 MainPage에서 계산한 sceneHeight로 지정
      */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          width: '100%',
          height: `${sceneHeight}px`,
          // 개발/디버그 시 backgroundColor를 잠깐 활성화 할 수 있습니다.
          // backgroundColor: 'rgba(255, 0, 0, 0.2)',
          backgroundColor: 'transparent',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};

export default BasketballScene;
