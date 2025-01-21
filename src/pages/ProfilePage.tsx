// src/pages/ProfilePage.tsx
import {
    AspectRatio,
    Box,
    Grid,
    GridItem,
    Spinner,
    Text,
    useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getUserShots } from '../services/firestoreServices';
  
  type ShotData = {
    id: string;
    s3Url: string;
    score: number | null;
    processed: string | null;
    createdAt?: any;
  };
  
  export default function ProfilePage() {
    const [shots, setShots] = useState<ShotData[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
  
    // 한번만 불러옴
    useEffect(() => {
      async function fetchShots() {
        try {
          const shotList = await getUserShots();
          setShots(shotList);
        } catch (error) {
          console.error(error);
          toast({
            title: '데이터 불러오기 실패',
            description: String(error),
            status: 'error',
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      }
      fetchShots();
    }, [toast]);
  
    if (loading) {
      return (
        <Box minH="100vh" bg="black" color="white">
          <Navbar headerType="header2" />
          <Box display="flex" justifyContent="center" alignItems="center" pt="50px">
            <Spinner size="xl" />
          </Box>
        </Box>
      );
    }
  
    return (
      <Box minH="100vh" bg="black" color="white">
        {/* 프로필 페이지에서는 스크롤 시 Navbar를 'header2'처럼 고정적으로 보이게 할 수도 있음 */}
        <Navbar headerType="header2" />
        <Box p={4}>
          <Text fontSize="2xl" mb={6}>
            나의 슛 영상 갤러리
          </Text>
  
          {shots.length === 0 && (
            <Text>아직 업로드된 영상이 없습니다.</Text>
          )}
  
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
        </Box>
      </Box>
    );
  }
  