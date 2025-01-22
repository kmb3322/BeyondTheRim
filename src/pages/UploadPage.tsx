// client/src/pages/UploadPage.tsx
import {
  Box,
  Button,
  Container,
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

export default function UploadPage() {
  const [headerType, setHeaderType] = useState<'header1' | 'header2'>('header1');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
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

    // 1) 클라이언트단 100MB 제한 검사
    if (videoFile.size > 100 * 1024 * 1024) {
      toast({
        title: '파일 크기 초과',
        description: '100MB 이하의 파일만 업로드 가능합니다.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    // 2) Firebase 로그인 확인
    if (!auth.currentUser) {
      toast({
        title: '로그인이 필요합니다.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      // 3) Firebase 토큰
      const token = await auth.currentUser.getIdToken();

      // 4) FormData 구성
      const formData = new FormData();
      formData.append('video', videoFile);

      // 5) 서버 업로드 요청 + 진행률 감시
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload-video`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`, // 서버에서 verifyAuthToken으로 검증
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

      // 업로드 후 메인으로 이동
      navigate('/main');
    } catch (error: any) {
      console.error(error);
      toast({
        title: '업로드 실패',
        description: error?.response?.data?.message || String(error),
        status: 'error',
        isClosable: true,
      });
      // 에러 시 진행률 표시를 초기화하거나 그대로 둠
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
            color="brand.400"
          >
            영상을 업로드해주세요
          </Text>

          <Box>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ color: 'white' }}
            />
          </Box>

          {/* 업로드 진행률 표시 (uploadProgress > 0 일 때) */}
          {uploadProgress > 0 && (
            <Progress
              value={uploadProgress}
              size="sm"
              colorScheme="green"
              borderRadius="md"
            />
          )}

          <Button
            colorScheme="#f33c3c"
            bg="#f33c3c"
            variant="solid"
            fontWeight={700}
            textColor="white"
            onClick={handleUpload}
            fontFamily="heading"
          >
            업로드
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
