import { Box, Button, Container, Image, Text, VStack, useBreakpointValue, useToast } from '@chakra-ui/react';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebaseConfig';
import nbalogo3 from '/assets/nbalogo3.mp4';

export default function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();

  // 화면 크기에 따라 텍스트 속성을 동적으로 설정합니다.
  const fontSize = useBreakpointValue({ base: '16px', md: '24px' });
  const letterSpacing = useBreakpointValue({ base: '13px', md: '25px' });
  
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
    <Box
      minH="100vh"
      bg="black"
      color="white"
      display="flex"
      justifyContent="center"
      alignItems="center"
      textAlign="center" w="full"
    >
      <Container pt={10} pb={10} maxW="container.xl">
        <VStack spacing={3} align="center">
          <video
            src={nbalogo3}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: useBreakpointValue({ base: "80%", md: "50%" }),
              height: useBreakpointValue({ base: "80%", md: "50%" }),
              objectFit: 'contain',
            }}
          />
          <Text
            as="span"

            fontSize={fontSize}
            fontFamily="Noto Sans KR"
            fontWeight={700}
            color="#f33c3c"
            letterSpacing={letterSpacing}
            textAlign="center"
            maxW="100%"
            mb={10}
            display="inline-block"
          >
            새 코트에 참여하세요
          </Text>
          <Button
            borderRadius={12}
            width="320px"
            colorScheme="#f33c3c"
            bg="#f33c3c"
            fontWeight={700}
            textColor="white"
            onClick={handleGoogleLogin}
            fontFamily="Noto Sans KR"
            leftIcon={(
              <Image
                src="/assets/google_logo.png"
                alt="Google Logo"
                boxSize="24px"
                mt={0.5}
                ml={1}
              />
            )}
            _hover={{
              bg: "#d32f2f",
              transform: "scale(1.02)",
            }}
            justifyContent="center"
          >
            Sign In With Google
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
