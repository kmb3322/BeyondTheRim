// client/src/pages/LoginPage.tsx
import { Box, Button, Container, Text, VStack, useToast } from '@chakra-ui/react';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebaseConfig';

export default function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        toast({
          title: '로그인 성공!',
          status: 'success',
          isClosable: true,
        });
        navigate('/main');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: '로그인 실패',
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="black" color="white">
      <Container maxW="md" pt={10}>
        <VStack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold">
            Google 계정으로 로그인
          </Text>
          <Button colorScheme="red" onClick={handleGoogleLogin} fontFamily="heading">
            구글 로그인
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
