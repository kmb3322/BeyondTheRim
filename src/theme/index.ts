import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark', // 다크 모드로 시작
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#ffe5e5',
      100: '#fcbcbc',
      200: '#f99191',
      300: '#f66767',
      400: '#f33c3c',
      500: '#ff0000', // 강렬한 레드
      600: '#c70000',
      700: '#8f0000',
      800: '#570000',
      900: '#200000',
    },
    // 배경은 거의 검정(#000) + 약간의 회색 tones
    gray: {
      900: '#1a1a1a',
      800: '#2f2f2f',
      700: '#3f3f3f',
      // ...
    },
  },
  fonts: {
    heading: `'Anton', sans-serif`, // 타이틀 계열에 "Anton" 적용
    body: `'Anton', sans-serif`,    // 본문도 통일 (디자인 취향에 맞게)
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: '#000000', // 기본 배경 검정
        color: '#ffffff',
        margin: 0,
        padding: 0,
      },
    },
  },
});
