import {
    AspectRatio,
    Box,
    Button,
    Container,
    Grid,
    GridItem,
    Spinner,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
    
  import BasketballScene from '../components/BasketballScene';
import Navbar from '../components/Navbar';
import ScoreChart from '../components/ScoreChart';
import { auth, db } from '../firebaseConfig';
    
  type ShotData = {
    id?: string;
    s3Url: string;
    score: number | null;
    processed?: string | null;
    createdAt?: any;
  };
    
  export default function MainPage() {
    // -----------------------------
    // 1) 헤더 전환 상태 (scrollY > 400 기준)
    // -----------------------------
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
    
    // -----------------------------
    // 2) Firestore에서 shots 불러오기
    // -----------------------------
    const [shots, setShots] = useState<ShotData[]>([]);
    const [loadingShots, setLoadingShots] = useState(true);
    const toast = useToast();
    
    useEffect(() => {
      const fetchShots = async () => {
        if (!auth.currentUser) {
          setShots([]);
          setLoadingShots(false);
          return;
        }
    
        try {
          const shotsRef = collection(db, 'users', auth.currentUser.uid, 'shots');
          const q = query(shotsRef, orderBy('createdAt', 'asc'));
          const snapshot = await getDocs(q);
    
          const shotList: ShotData[] = [];
          snapshot.forEach((docSnap) => {
            shotList.push({
              id: docSnap.id,
              ...docSnap.data(),
            } as ShotData);
          });
    
          setShots(shotList);
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
    
      fetchShots();
    }, [toast]);
    
    // -----------------------------
    // 3) 차트 및 평균 점수 계산
    // -----------------------------
    const labels = shots.map((shot) =>
      shot.createdAt ? shot.createdAt.toDate().toLocaleString() : 'Unknown'
    );
    const scores = shots.map((shot) => shot.score ?? 0);
    
    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, cur) => sum + cur, 0) / scores.length)
      : 0;
    
    // -----------------------------
    // 4) 평균 점수 카운트업 애니메이션
    // -----------------------------
    const [displayScore, setDisplayScore] = useState(0);
    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    
    useEffect(() => {
      setDisplayScore(0);
      startTimeRef.current = null;
    
      const duration = 1000; // 1초 동안 증가
    
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
        const val = Math.floor(progress * averageScore);
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
    
    const navigate = useNavigate();
    
    return (
      <Box minH="100vh" bg="transparent" position="relative">
        {/* 헤더 영역 */}
        <Navbar headerType={headerType} />
        <Box position="relative" width="100%" height="300px" />
    
        {/* BasketballScene는 header가 header1일 때만 활성화 */}
        <Box position="absolute" top="0" left="0" width="100%" height="562px" zIndex={999}>
          <BasketballScene enabled={headerType === 'header1'} />
        </Box>
    
        {/* 실제 페이지 컨텐츠 */}
        <Container maxW="md" pt={0} color="white">
          <VStack spacing={6} align="stretch">
            <Text fontSize={38} fontFamily="Noto Sans KR" fontWeight={700} color="brand.400">
              다시 코트에 오신 것을 환영합니다.
            </Text>
    
            {/* 업로드 페이지로 이동하는 버튼 */}
            <Button
              colorScheme="red"
              variant="solid"
              onClick={() => navigate('/upload')}
              fontFamily="heading"
            >
              업로드 페이지로
            </Button>
    
            {/* shot 데이터에 따른 차트 표시 */}
            {loadingShots && (
              <VStack spacing={4} mt={6}>
                <Spinner />
                <Text>점수 정보를 불러오는 중...</Text>
              </VStack>
            )}
    
            {!loadingShots && shots.length > 0 && (
              <VStack spacing={4} mt={6} border="1px solid white" p={4} borderRadius="md">
                <Text fontSize="3xl" fontWeight="bold" color="red.300">
                  나의 평균 점수: {displayScore}
                </Text>
                <ScoreChart labels={labels} scores={scores} />
              </VStack>
            )}
    
            {!loadingShots && shots.length === 0 && (
              <Text mt={6}>아직 업로드된 영상이 없습니다.</Text>
            )}
    
            {/* 스크롤 영역에 ProfilePage의 갤러리 컨텐츠를 불러옴 */}
            <Box mt={6}>
              <Text fontSize="2xl" mb={6}>
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
                    // processed 필드가 존재하면 processed URL 사용, 없으면 s3Url 사용
                    const videoUrl = shot.processed ? shot.processed : shot.s3Url;
                    return (
                      <GridItem
                        key={shot.id}
                        border="1px solid white"
                        borderRadius="md"
                        overflow="hidden"
                        p={2}
                      >
                        <AspectRatio ratio={16 / 9}>
                          <video
                            src={videoUrl}
                            controls
                            style={{ width: '100%', height: '100%' }}
                          />
                        </AspectRatio>
                        <Text mt={2}>
                          점수: {shot.score ?? '분석 중'}
                        </Text>
                      </GridItem>
                    );
                  })}
                </Grid>
              )}
    
              {/* 스크롤 영역을 길게 하려면 아래와 같이 추가할 수 있습니다 */}
              <Box height="100vh" />
            </Box>
    
          </VStack>
        </Container>
      </Box>
    );
  }
  