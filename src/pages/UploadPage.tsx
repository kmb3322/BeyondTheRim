// src/pages/UploadPage.tsx
import {
  Box,
  Button,
  Container,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import Navbar from '../components/Navbar';
import { auth, db } from '../firebaseConfig';

export default function UploadPage() {
  // -----------------------------
  // 1) 헤더 전환 상태
  // -----------------------------
  const [headerType, setHeaderType] = useState<'header1' | 'header2'>('header1');

  // (단순히 스크롤 감지해서 헤더 전환)
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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
  // 2) 파일 업로드 상태
  // -----------------------------
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast({
        title: 'No video selected',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    // 로그인 유저 체크
    if (!auth.currentUser) {
      toast({
        title: '로그인이 필요합니다.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      // 2-1) 서버로부터 Presigned URL 획득
      const resPresigned = await axios.post(
        'http://localhost:4000/api/get-presigned-url',
        {
          filename: videoFile.name,
        }
      );
      const { presignedUrl, s3ObjectKey } = resPresigned.data;

      // 2-2) Presigned URL로 S3에 PUT 업로드
      await axios.put(presignedUrl, videoFile, {
        headers: {
          'Content-Type': videoFile.type,
        },
      });

      // 2-3) Firestore에 기록 (score는 아직 분석 전이므로 null)
      const userId = auth.currentUser.uid;
      const docId = uuidv4();

      await setDoc(doc(db, 'users', userId, 'shots', docId), {
        s3Url: `https://${import.meta.env.VITE_S3_BUCKET_NAME}.s3.amazonaws.com/${s3ObjectKey}`,
        score: null,
        createdAt: serverTimestamp(),
      });

      toast({
        title: '영상 업로드 성공!',
        status: 'success',
        isClosable: true,
      });

      // 업로드 후 메인페이지로 이동
      navigate('/main');
    } catch (error) {
      console.error(error);
      toast({
        title: '업로드 실패',
        description: String(error),
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
            colorScheme="red"
            variant="solid"
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
