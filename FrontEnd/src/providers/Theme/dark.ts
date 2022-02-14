import { DefaultTheme } from 'styled-components';
import bg from '../../assets/images/bg@2x.webp';

const theme: DefaultTheme = {
  bg: bg,
  colors: {
    background: '#0c0d11',
    foreground: '#ffffff',
    success: '#03a062',
    secondary: '#cecece',
    primary: '#03a062',
    danger: '#fb6161',
    text: {
      primary: '#ffffff',
      secondary: '#cecece',
    },
    header: {
      background: 'transparent',
      border: '#313743',
      avatar: '#222833',
      avatarHover: '#171721',
      price: '#2e0f7f',
      tvl: '#03a062',
    },
    button: {
      disable: '#373b4a',
    },
  },
};

export default theme;
