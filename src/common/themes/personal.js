import {
  red500,
  red700,
  lightBlack,
  pinkA200,
  grey100,
  grey500,
  darkBlack,
  white,
  grey300
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
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
    accent1Color: pinkA200,
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
