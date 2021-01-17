import { red500, red700, lightBlack, grey100, grey500, darkBlack, white, grey300, cyan500 } from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';
import zIndex from 'material-ui/styles/zIndex';

export default {
  zIndex: Object.assign({}, zIndex, {
    appBar: 2000
  }),
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: red500,
    primary2Color: red700,
    primary3Color: lightBlack,
    accent1Color: cyan500,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: red500
  }
};
