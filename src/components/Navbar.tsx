import { Box, Button, Flex, Spacer, useBreakpointValue } from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

import nbalogo2 from '/assets/nbalogo2.mp4';
import nbalogo3 from '/assets/nbalogo3.mp4';

interface NavbarProps {
  headerType?: 'header1' | 'header2';
}

export default function Navbar({ headerType = 'header1' }: NavbarProps) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };



  // Breakpoint-based sizes for header2 video
  const videoStylesHeader2 = useBreakpointValue({
    base: {
      width: '200px',
      height: '80px',
    },
    md: {
      width: '250px',
      height: '100px',
    },
  });

  return (
    <Flex
      as="header"
      direction="column"
      position={headerType === 'header2' ? 'sticky' : 'relative'}
      top={0}
      height={headerType === 'header1' ? '15vh' : '10vh'}
      transition="height 0.5s ease-in-out"
      overflow="hidden"
      bg={headerType === 'header2' ? '#000000' : 'transparent'}
      zIndex={10}
    >
      {/* MP4 배경 (headerType이 'header1'일 때만) */}
      {headerType === 'header1' && (
        <Box
          position="absolute"
          top="10%"
          left="0"
          width="100%"
          height="100%"
          zIndex={-1}
        >
        <video
              src={nbalogo3}
              autoPlay
              loop
              muted
              playsInline
              style={{
                height: '100%',
                objectFit: 'contain',
              }}
            />
        </Box>
      )}

      {/* 상단 컨텐츠 */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={2}
        color="white"
        height="100%"
      >
        {/* header2에서는 작은 로고 비디오만 노출 */}
        {headerType === 'header2' && (
          <Box style={videoStylesHeader2}>
            <video
              src={nbalogo2}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        <Spacer />

        <Flex gap={4} align="center">
          {headerType === 'header1' ? (
            user && (
              <Link to="/profile">
              </Link>
            )
          ) : (
            user && (
              <>
                <Link to="/upload">
                  <Button colorScheme="#f33c3c" ml={6} width={16} height={8} borderRadius={5} fontSize={14} borderColor="#f33c3c" color="#f33c3c" fontFamily="Noto Sans KR" variant="outline" zIndex={9999}
                 _hover={{
                  color:"black",
                   bg: "#f33c3c", // 커서 올렸을 때의 배경색
                   transform: "scale(1.02)", // 약간 확대 효과
                 }}>
                    업로드
                  </Button>
                </Link>
                <Button colorScheme="#f33c3c" width={16} height={8} borderRadius={5} fontSize={14} onClick={handleLogout} borderColor="#f33c3c" color="#f33c3c" fontFamily="Noto Sans KR" variant="outline" zIndex={9999}
                 _hover={{
                  color:"black",
                   bg: "#f33c3c", // 커서 올렸을 때의 배경색
                   transform: "scale(1.02)", // 약간 확대 효과
                 }}>
                  로그아웃
                </Button>
              </>
            )
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
