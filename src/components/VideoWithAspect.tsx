// client/src/components/VideoWithAspect.tsx
import { AspectRatio, Box, IconButton } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';

type VideoWithAspectProps = {
  src: string;
};

const VideoWithAspect: React.FC<VideoWithAspectProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        const { videoWidth, videoHeight } = video;
        if (videoHeight > videoWidth) {
          setAspectRatio(3 / 4); // Portrait
        } else {
          setAspectRatio(4 / 3); // Landscape
        }
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [src]);

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

  return (
    <Box position="relative">
      <AspectRatio ratio={aspectRatio} width="100%">
        <video
          ref={videoRef}
          src={src}
          style={{ borderRadius: '8px' }}
          muted
          // Remove default controls
          controls={false}
        />
      </AspectRatio>
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
      />
    </Box>
  );
};

export default VideoWithAspect;
