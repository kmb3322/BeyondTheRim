// src/pages/ResultPage.tsx
import { Box, Container, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function ResultPage() {
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // 서버에서 분석이 끝났다고 가정하고,
    // Firestore에서 가장 최근 문서를 가져오거나,
    // 혹은 서버의 API를 호출해서 분석된 URL을 가져오는 로직을 수행
    // 여기서는 단순히 2초 후에 값이 있는/없는 시나리오를 보여주기만 함

    setTimeout(() => {
      // setVideoUrl('https://example.com/analyzed.mp4'); // 실제 분석된 영상 URL
      setVideoUrl(null); // 없다고 가정
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <Box bg="black" minH="100vh" color="white">
      <Navbar />
      <Container maxW="md" py={10} textAlign="center">
        {loading ? (
          <>
            <Spinner color="brand.500" size="xl" thickness="4px" />
            <Text mt={4}>분석 중...</Text>
          </>
        ) : videoUrl ? (
          <Box as="video" controls width="100%" src={videoUrl} />
        ) : (
          <Text color="brand.400" fontSize="lg">
            아직 분석 결과가 없습니다.
          </Text>
        )}
      </Container>
    </Box>
  );
}
