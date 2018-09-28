import * as React from 'react';
import { bool, string } from 'prop-types';
import Paper from '@material-ui/core/Paper';

const Title = ({ text, small = false }) => (
  <Paper style={{
    display: 'inline-block',
    padding: '5px 15px',
    fontSize: small ? 16 : 24,
    fontFamily: 'Carter One',
    color: 'white',
    backgroundColor: '#f44336',
    opacity: 0.8,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0
  }}>{text}</Paper>
);

Title.propTypes = {
  text: string,
  small: bool
};

export default Title;
