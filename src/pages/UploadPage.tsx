// client/src/pages/UploadPage.tsx
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Progress,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar'; // 예시
import { auth } from '../firebaseConfig';

// 이미지와 텍스트가 함께 페이드 인/아웃 되는 캐러셀 컴포넌트
const ImageCarousel: React.FC = () => {
  const images = ['/assets/player1.png', '/assets/player2.png'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // 페이드 아웃 시작
      setFade(false);
      setTimeout(() => {
        // 이미지 전환 후 페이드 인
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true);
      }, 1000);
    }, 7000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <Box
      width="100%"
      height={{ base: '200px', md: '250px' }} // 필요한 경우 높이 조정
      position="relative"
      overflow="hidden"
      borderRadius="md"
      mt={6}
    >
      {/* 이미지와 텍스트가 함께 감싸진 박스 */}
      <Box
        width="100%"
        height="100%"
        transition="opacity 1s ease-in-out"
        opacity={fade ? 1 : 0}
        position="absolute"
        top={-5}
        left={0}
      >
        <Image
          src={images[currentImageIndex]}
          alt={`Player ${currentImageIndex + 1}`}
          objectFit="contain"
          alignContent={"center"}
          ml={3}
          width="90%"
          height="90%"
          mb={10}
          bottom={10}
        />
        {/* 하단에 텍스트 오버레이 */}
        <Box
          position="absolute"
          bottom={0}
          width="100%"
          bg="rgba(0, 0, 0, 0.5)"
          py={-5}
          textAlign="center"
        >
          <Text fontSize="14px" fontFamily="Noto Sans KR" fontWeight="700" color="#f33c3c" >
            양 팔과 양 다리가 카메라에 분명하게 나오도록 촬영해주세요.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default function UploadPage() {
  const [headerType, setHeaderType] = useState<'header1' | 'header2'>('header1');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [handedness, setHandedness] = useState<'left' | 'right'>('right'); // 추가: handedness 상태
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeaderType('header2');
      } else {
        setHeaderType('header1');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * 파일 선택
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadProgress(0); // 새 파일 선택 시 진행률 0으로 초기화
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  /**
   * handedness 선택 핸들러
   */
  const handleHandednessChange = (hand: 'left' | 'right') => {
    setHandedness(hand);
  };

  /**
   * 업로드 요청
   */
  const handleUpload = async () => {
    if (!videoFile) {
      toast({
        title: '영상 파일을 선택해주세요.',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    // 클라이언트단 100MB 제한 검사
    if (videoFile.size > 100 * 1024 * 1024) {
      toast({
        title: '파일 크기 초과',
        description: '100MB 이하의 파일만 업로드 가능합니다.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    // Firebase 로그인 확인
    if (!auth.currentUser) {
      toast({
        title: '로그인이 필요합니다.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      // Firebase 토큰 획득
      const token = await auth.currentUser.getIdToken();

      // FormData 구성
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('hand', handedness); // 추가: handedness 필드 추가

      // 서버 업로드 요청 + 진행률 감시
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload-video`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          },
        }
      );

      console.log(response.data);
      toast({
        title: '업로드 완료',
        description: '영상이 성공적으로 업로드되었습니다.',
        status: 'success',
        isClosable: true,
      });

      // 업로드 후 메인 화면으로 이동
      navigate('/main');
    } catch (error: any) {
      console.error(error);
      toast({
        title: '업로드 실패',
        description: error?.response?.data?.message || String(error),
        status: 'error',
        isClosable: true,
      });
      setUploadProgress(0);
    }
  };

  return (
    <Box minH="100vh" bg="black">
      <Navbar headerType={headerType} />
      <Container maxW="md" pt={10} color="white">
        <VStack spacing={6} align="stretch">
          <Text
            fontSize={38}
            fontFamily="Noto Sans KR"
            fontWeight={700}
            color="#f33c3c"
            mb={-8}
          >
            분석할 영상을
          </Text>
          <Text
            fontSize={38}
            fontFamily="Noto Sans KR"
            fontWeight={700}
            color="#f33c3c"
            mb={-5}
          >
            여기에 업로드 하세요.
          </Text>
          <Text
            fontSize={12}
            fontFamily="Noto Sans KR"
            fontWeight={500}
            mb={-6}
            ml={1}
            color="gray.300"
          >
            초당 165.2FLOPs의 자체 딥러닝 모델을 통해
          </Text>
          <Text
            fontSize={12}
            fontFamily="Noto Sans KR"
            fontWeight={500}
            color="gray.300"
            ml={1}
          >
            엄선된 NBA·KBL 선수들의 슛 폼 데이터 셋과 대조합니다.
          </Text>

          {/* 이미지 및 텍스트가 함께 페이드 효과로 전환되는 캐러셀 */}
          <ImageCarousel />
          <Box mt={-3} >
            <Flex alignItems="start" justify={"start"}>
              <input
                type="file"
                accept="video/*"
                id="file-upload"
                onChange={handleFileChange}
                style={{ display: 'none' }} // input 숨김
              />
              <label htmlFor="file-upload">
                <Button
                  as="span"
                  bg="transparent"
                  colorScheme="black"
                  border="1px solid #f33c3c"
                  fontWeight={600}
                  fontSize="12px"
                  textColor="#f33c3c"
                  borderRadius="full"
                  width="20"
                  mb={-2}
                  padding="4px 12px"
                  _hover={{
                    bg: '#f33c3c',
                    color: 'black',
                    transform: 'scale(1.05)',
                  }}
                  transition="all 0.2s"
                >
                  영상 선택
                </Button>
              </label>
              {videoFile && (
                <Text ml={3} mt={2.5} fontSize={14} fontFamily="Noto Sans KR" fontWeight={700} color="#f33c3c">
                  {videoFile.name}
                </Text>
              )}
            </Flex>
          </Box>

          {/* 업로드 진행률 표시 */}
          {uploadProgress > 0 && (
            <Progress
              value={uploadProgress}
              size="sm"
              colorScheme="grey"
              borderRadius="md"
            />
          )}

          {/* handedness 선택 버튼 추가 */}
          <Box mb={3}>

            <HStack spacing={3} alignItems="start" justify={"start"}>
              <Button
                bg={handedness === 'left' ? '#f33c3c' : 'transparent'}
                color={handedness === 'left' ? 'black' : '#f33c3c'}
                border="1px solid #f33c3c"
                fontWeight={600}
                fontSize="12px"
                borderRadius="full"
                width="20"
                padding="4px 12px"
                onClick={() => handleHandednessChange('left')}
                _hover={{
                  bg: '#f33c3c',
                  color: 'black',
                  transform: 'scale(1.05)',
                }}
                transition="all 0.2s"
              >
                왼손잡이
              </Button>
              <Button
                bg={handedness === 'right' ? '#f33c3c' : 'transparent'}
                color={handedness === 'right' ? 'black' : '#f33c3c'}
                border="1px solid #f33c3c"
                fontWeight={600}
                fontSize="12px"
                borderRadius="full"
                width="20"
                padding="4px 12px"
                onClick={() => handleHandednessChange('right')}
                _hover={{
                  bg: '#f33c3c',
                  color: 'black',
                  transform: 'scale(1.05)',
                }}
                transition="all 0.2s"
              >
                오른손잡이
              </Button>
            </HStack>
          </Box>

          

          

          <Button
            bg="#f33c3c"
            variant="solid"
            fontWeight={500}
            fontSize={15}
            textColor="black"
            onClick={handleUpload}
            fontFamily="Noto Sans KR"
            colorScheme="black"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.2)"
            _hover={{
              bg: '#d32f2f',
              transform: 'scale(1.02)',
            }}
          >
            업로드
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
