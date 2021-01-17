import { cyan, grey, red } from '@material-ui/core/colors';
// import { fade } from '@material-ui/core/styles/colorManipulator';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import zIndex from '@material-ui/core/styles/zIndex';

const white = '#ffffff';
// const lightBlack = 'rgba(0, 0, 0, 0.54)';
// const darkBlack = 'rgba(0, 0, 0, 0.87)';

const theme: ThemeOptions = {
  zIndex: {
    ...zIndex,
    appBar: 2000
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  palette: {
    primary: {
      main: red[500]
    },
    secondary: {
      main: cyan[500],
      contrastText: white
    },
    divider: grey[500]
  }
};

export default theme;
