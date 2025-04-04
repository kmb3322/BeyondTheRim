// client/src/pages/MainPage.tsx
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Spinner,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi'; // 새로고침 아이콘
import { useNavigate } from 'react-router-dom';

import BasketballScene from '../components/BasketballScene';
import Navbar from '../components/Navbar';
import ScoreChart from '../components/ScoreChart';
import VideoWithAspect from '../components/VideoWithAspect';
import { auth } from '../firebaseConfig';

// Firestore에서 가져온 shot 문서 타입
type ShotData = {
  id: string;
  s3Url: string;
  score: number | null;
  newUrl?: string | null; // 머신러닝 처리 후 추가
  processed?: any; // 처리 완료 시간 (Date or Timestamp or null)
  analysis?: {
    success: boolean;
    overall_similarity: number;
    major_differences: string[];
    detailed_analysis: {
      [key: string]: {
        difference: number | null;
        feedback: string;
      };
    };
    output_video_path: string;
  } | null;
  fbxUrl?: string | null; // fbx 모델 URL
  createdAt?: any; // Firestore Timestamp 또는 Date 또는 string
};

export default function MainPage() {
  // -------------------------------------------------------------
  // 1) 헤더 전환 상태
  // -------------------------------------------------------------
  const [headerType, setHeaderType] = useState<'header1' | 'header2'>('header1');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setHeaderType('header2');
      } else {
        setHeaderType('header1');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // -------------------------------------------------------------
  // 2) 서버에서 shots 불러오기
  // -------------------------------------------------------------
  const [shots, setShots] = useState<ShotData[]>([]);
  const [loadingShots, setLoadingShots] = useState(true);
  const toast = useToast();

  const fetchShots = async () => {
    if (!auth.currentUser) {
      setShots([]);
      setLoadingShots(false);
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user-shots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched shots:', res.data.shots); // 디버깅용 로그 추가
      setShots(res.data.shots);
    } catch (err) {
      console.error(err);
      toast({
        title: '데이터 불러오기 실패',
        description: String(err),
        status: 'error',
        isClosable: true,
      });
    } finally {
      setLoadingShots(false);
    }
  };

  useEffect(() => {
    fetchShots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------
  // 3) 차트용 날짜 라벨, 점수 (Updated to exclude 0 scores and '검출 실패')
  // -------------------------------------------------------------

  // Filter out shots with '검출 실패' and scores <= 0
  const validShots = shots.filter(
    (shot) => shot.score && shot.score > 0 && shot.analysis?.success !== false
  );

  const labels = validShots.map((shot) => {
    const parsedDate = parseFirestoreDate(shot.createdAt);
    if (parsedDate) {
      return parsedDate.toLocaleDateString('ko-KR'); // "2025. 1. 22." 등
    }
    return 'Unknown';
  });

  const scores = validShots.map((shot) =>
    shot.score !== null ? Math.round(shot.score * 100) / 100 : 0
  );

  // 평균 점수 (exclude 0 scores and '검출 실패')
  const averageScore = scores.length
    ? Math.round((scores.reduce((sum, cur) => sum + cur, 0) / scores.length) * 100) / 100
    : 0;

  // -------------------------------------------------------------
  // 4) 평균 점수 카운트업 애니메이션 (Updated to handle decimals)
  // -------------------------------------------------------------
  const [displayScore, setDisplayScore] = useState<number>(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayScore(0);
    startTimeRef.current = null;

    const duration = 1000; // 1초
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const val = parseFloat((progress * averageScore).toFixed(2));
      setDisplayScore(val);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [averageScore]);

  // -------------------------------------------------------------
  // 5) Background 영역(BasketballScene)
  // -------------------------------------------------------------
  const [sceneHeight, setSceneHeight] = useState(520);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const updateSceneHeight = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setSceneHeight(rect.top);
      }
    };

    updateSceneHeight();
    window.addEventListener('resize', updateSceneHeight);
    return () => {
      window.removeEventListener('resize', updateSceneHeight);
    };
  }, []);

  const navigate = useNavigate();
  const refreshShot = async () => {
    setLoadingShots(true);
    await fetchShots(); // 전체 목록 업데이트 (각 shot의 newUrl 등 최신 상태 반영)
    setLoadingShots(false);
  };

  return (
    <Box minH="100vh" bg="transparent" position="relative">
      {/* 헤더 */}
      <Navbar headerType={headerType} />

      {/* 헤더 아래쪽 공간 확보용 */}
      <Box position="relative" width="100%" height="300px" />

      {/* BasketballScene: headerType === 'header1' 일 때만 표시 */}
      {headerType === 'header1' && (
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height={`${sceneHeight}px`}
          zIndex={999}
        >
          <BasketballScene sceneHeight={sceneHeight} />
        </Box>
      )}

      {/* 메인 컨텐츠 */}
      <Container maxW="md" pt={0} color="white">
        <VStack spacing={6} align="stretch">
          <Text
            fontSize={38}
            fontFamily="Noto Sans KR"
            fontWeight={700}
            color="brand.400"
          >
            다시 코트에 오신 것을
          </Text>
          <Text
            mt={-8}
            fontSize={38}
            fontFamily="Noto Sans KR"
            fontWeight={700}
            color="brand.400"
          >
            환영합니다.
          </Text>

          {/* 업로드 페이지 이동 버튼 */}
          <Button
            ref={buttonRef}
            colorScheme="black"
            variant="solid"
            onClick={() => navigate('/upload')}
            fontFamily="Noto Sans KR"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.2)"
            bg="#f33c3c"
            fontWeight={700}
            fontSize={15}
            color="black"
            _hover={{
              bg: '#d32f2f',
              transform: 'scale(1.02)',
            }}
          >
            AI 슛 폼 분석하기
          </Button>

          {/* Shot 데이터 UI */}
          {loadingShots && (
            <VStack spacing={4} mt={6}>
              <Spinner />
              <Text>점수 정보를 불러오는 중...</Text>
            </VStack>
          )}

          {/* 평균 점수 + 차트 */}
          {!loadingShots && validShots.length > 0 && (
            <VStack spacing={4} mt={2} p={4} alignItems="start" position="relative">
              <IconButton
                aria-label="새로고침"
                icon={<FiRefreshCw />}
                size="sm"
                position="absolute"
                top="10px"
                right="10px"
                borderRadius="full"
                colorScheme='black'
                onClick={() => refreshShot()}
                _hover={{ bg: '#f33c3c' }}
                zIndex={2} // 비디오 UI보다 위에 표시되도록 설정
              />
              <Box ml={3} mb={5} display="flex" flexDirection="row">
                <Text fontSize={60} fontWeight="bold" color="#f33c3c">
                  {displayScore.toFixed(2)}
                </Text>
                <Text
                  fontFamily="Noto Sans KR"
                  fontSize={12}
                  ml={2}
                  fontWeight={700}
                  color="#f33c3c"
                  mt={3}
                >
                  나의 평균점수
                </Text>
              </Box>
              <Box borderRadius="12"
                      overflow="hidden"
                      width="100%"
                      p={5}
                      py={8}
                      bg="gray.900"
                      position="relative"> 
                <ScoreChart labels={labels} scores={scores} />
              </Box>
            </VStack>
          )}

          {!loadingShots && shots.length === 0 && (
            <Text mt={6}>아직 업로드된 영상이 없습니다.</Text>
          )}

          {/* 영상 갤러리 */}
          <Box mt={6}>
            <Text
              textColor="#f33c3c"
              fontFamily="Noto Sans KR"
              fontWeight={700}
              fontSize={30}
              mb={2}
            >
              나의 슛 영상 갤러리
            </Text>

            {loadingShots ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                <Spinner size="xl" />
              </Box>
            ) : shots.length === 0 ? (
              <Text>아직 업로드된 영상이 없습니다.</Text>
            ) : (
              <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
                {shots.map((shot) => {
                  const hasNewUrl = shot.newUrl && shot.newUrl !== null;
                  const videoUrls = hasNewUrl ? [shot.s3Url, shot.newUrl!] : [shot.s3Url];

                  // 피드백 추출: difference가 null이 아니고 0.07보다 큰 항목의 feedback
                  const feedbacks = shot.analysis?.detailed_analysis
                    ? Object.values(shot.analysis.detailed_analysis)
                        .filter(
                          (item) =>
                            item.difference !== null && item.difference > 0.08
                        )
                        .map((item, index) => (
                          <Box
                            key={index}
                            bg="gray.800"
                            color="gray.400"
                            px={3}
                            py={2}
                            borderRadius={10}
                            fontSize={14}
                            width="100%"
                            fontWeight={500}
                            wordBreak="break-word"
                          >
                            {item.feedback.split('. ').map((sentence, idx) => (
                              <React.Fragment key={idx}>
                                {sentence.trim()}.{/* 마침표 추가 */}
                                <br />
                              </React.Fragment>
                            ))}
                          </Box>
                        ))
                    : [];

                  return (
                    <GridItem
                      key={shot.id}
                      borderRadius="12"
                      overflow="hidden"
                      p={5}
                      bg="gray.900"
                      position="relative"
                    >
                      {/* 새로고침 버튼의 zIndex를 높게 설정 */}
                      <IconButton
                        aria-label="새로고침"
                        icon={<FiRefreshCw />}
                        size="sm"
                        position="absolute"
                        top="8px"
                        right="10px"
                        color="white"
                        colorScheme='black'
                        borderRadius="full"
                        onClick={() => refreshShot()}
                        _hover={{ bg: '#f33c3c' }}
                        zIndex={2} // 비디오 UI보다 위에 표시되도록 설정
                      />
                      
                      <Box ml={1} mb={5} display="flex" flexDirection="row" alignItems="center" mt={2}>
                      {shot.newUrl === null && shot.processed !== null ? (
                          <Text
                            textColor="#f33c3c"
                            fontFamily="Noto Sans KR"
                            fontWeight={700}
                            fontSize={22}
                          >
                            슛 폼이 검출되지 않음
                          </Text>
                        ) : hasNewUrl ? (
                          <>
                            <Text textColor="#f33c3c" fontSize={35}>
                              {shot.score !== null ? shot.score.toFixed(2) : '0.00'}
                            </Text>
                            <Text
                              textColor="#f33c3c"
                              fontFamily="Noto Sans KR"
                              fontWeight={700}
                              mt={-5}
                              ml={1}
                              fontSize={16}
                            >
                              점
                            </Text>
                          </>
                        ) : (
                          <Text
                            textColor="#f33c3c"
                            fontFamily="Noto Sans KR"
                            fontWeight={700}
                            fontSize={22}
                          >
                            분석 중
                          </Text>
                        )}
                      </Box>
                      <Box mt="5">
                        {hasNewUrl ? (
                          <Flex direction="row" gap={2}>
                            {videoUrls.map((url, index) => (
                              <VideoWithAspect key={index} src={url} />
                            ))}
                          </Flex>
                        ) : (
                          <VideoWithAspect src={shot.s3Url} />
                        )}
                      </Box>

                      {/* 피드백 표시 */}
                      {feedbacks.length > 0 && (
                        <Box mt={4}>
                          <Text mb={2} color="#f33c3c" letterSpacing={0}>
                            feedback
                          </Text>
                          <VStack align="start" spacing={2}>
                            {feedbacks}
                          </VStack>
                        </Box>
                      )}
                    </GridItem>
                  );
                })}
              </Grid>
            )}

            {/* 아래쪽 여백 */}
            <Box height="100vh" />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

// 안전하게 Date 객체로 변환하는 함수
function parseFirestoreDate(field: any): Date | null {
  if (!field) return null;

  // Firestore Timestamp 객체 형태인지 확인
  if (field.seconds && typeof field.seconds === 'number') {
    return new Date(field.seconds * 1000);
  }
  // 혹은 _seconds?
  if (field._seconds && typeof field._seconds === 'number') {
    return new Date(field._seconds * 1000);
  }

  // 만약 그냥 문자열로 저장된 경우
  const dateObj = new Date(field);
  if (isNaN(dateObj.getTime())) {
    return null; // 파싱 실패
  }
  return dateObj;
}
