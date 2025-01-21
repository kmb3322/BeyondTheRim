// client/src/pages/UploadPage.tsx
import {
  Box,
  Button,
  Container,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { auth } from '../firebaseConfig';

export default function UploadPage() {
  const [headerType, setHeaderType] = useState<'header1' | 'header2'>('header1');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  // 스크롤 이벤트 (헤더 전환 여부)
  React.useEffect(() => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast({
        title: '영상 파일을 선택해주세요.',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    if (!auth.currentUser) {
      toast({
        title: '로그인이 필요합니다.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      // Firebase 토큰 가져오기
      const token = await auth.currentUser.getIdToken();

      // FormData 구성
      const formData = new FormData();
      formData.append('video', videoFile);

      // 서버 업로드 요청
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // 서버에서 verifyAuthToken으로 검증
        },
      });

      console.log(response.data);
      toast({
        title: '업로드 완료',
        description: '영상이 성공적으로 업로드되었습니다.',
        status: 'success',
        isClosable: true,
      });

      navigate('/main');
    } catch (error: any) {
      console.error(error);
      toast({
        title: '업로드 실패',
        description: error?.response?.data?.message || String(error),
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="black">
      <Navbar headerType={headerType} />
      <Container maxW="md" pt={10} color="white">
        <VStack spacing={6} align="stretch">
          <Text fontSize={38} fontFamily="Noto Sans KR" fontWeight={700} color="brand.400">
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
