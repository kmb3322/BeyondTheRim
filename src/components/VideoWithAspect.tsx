import { AspectRatio, Box, IconButton } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';

type VideoWithAspectProps = {
  src: string;
};

const VideoWithAspect: React.FC<VideoWithAspectProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  // 자동으로 플레이 상태 업데이트
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  // Intersection Observer를 사용하여 자동 재생/일시정지
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch((error) => {
            console.error('Error attempting to play', error);
          });
        } else {
          video.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5, // 영상의 50% 이상이 보일 때 재생
    });

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, []);

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      borderRadius="8px"
      overflow="hidden"
      boxShadow="md"
      cursor="pointer"
      flex="1"
    >
      <AspectRatio ratio={3 / 4} width="100%">
        <video
          ref={videoRef}
          src={src}
          style={{ borderRadius: '12px', objectFit: 'cover' }}
          muted
          // 기본 컨트롤 제거
          controls={false}
          // iOS 사파리에서 전체화면 전환을 방지하기 위한 속성 추가
          playsInline
          webkit-playsinline="true"
        />
      </AspectRatio>
      {/* 재생/일시정지 버튼을 호버 시에만 표시 */}
      {(isHovered || isPlaying) && (
        <IconButton
          icon={isPlaying ? <FiPause /> : <FiPlay />}
          aria-label="Play/Pause"
          size="lg"
          colorScheme="red"
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          opacity="0.8"
          onClick={togglePlay}
          _hover={{ opacity: 1 }}
          bg="rgba(0, 0, 0, 0.6)"
          color="white"
          borderRadius="full"
          zIndex={1}
        />
      )}
    </Box>
  );
};

export default VideoWithAspect;
