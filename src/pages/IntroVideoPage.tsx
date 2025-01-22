// src/pages/IntroVideoPage.tsx
import { Box, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IntroVideoPage() {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 15000); // 15초 후에 버튼 표시

    return () => clearTimeout(timer);
  }, []);

  // 화면 아무곳이나 더블 클릭 시 버튼 노출
  const handleTouch = () => {
    if (!showButton) {
      setShowButton(true);
    }
  };

  const handleStart = () => {
    navigate('/main');
  };

  return (
    <Box
      position="relative"
      width="100%"
      height="100vh"
      overflow="hidden"
      bg="black"
      
    >
      {/* 무한 반복 인트로 비디오 */}
      <video
        src="/assets/intro.mp4"  // public 폴더 내 경로
        autoPlay
        loop
        muted
        playsInline
        onTouchStart={handleTouch}
        onClick={handleTouch}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* 15초 후 또는 클릭 시 나타나는 시작하기 버튼 */}
      {showButton && (
        <Box
          position="absolute"
          top="67%"
          left="50%"
          transform="translate(-50%, -50%)"
          opacity={0} // 초기 투명도
          animation="fadeIn 1s forwards" // 1초 동안 애니메이션 실행
          sx={{
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 0.7 },
            },
          }}
        >
          <Button
            borderRadius={12}
            width="320px"
            colorScheme="#f33c3c"
            bg="#f33c3c"
            onClick={handleStart}
            fontWeight={700}
            textColor={'white'}
            letterSpacing={6}
            fontFamily="Noto Sans KR"  // Noto Sans KR 폰트 적용
            
            justifyContent="center"
          >
            시작하기
          </Button>
        </Box>
      )}
    </Box>
  );
}
