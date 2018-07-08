import * as React from 'react';
import { string } from 'prop-types';
import Paper from '@material-ui/core/Paper';

const Title = ({ text }) => (
  <Paper style={{
    display: 'inline-block',
    padding: '5px 15px',
    fontSize: 24,
    fontFamily: 'Carter One',
    color: 'white',
    backgroundColor: '#f44336',
    opacity: 0.8
  }}>{text}</Paper>
);

Title.propTypes = {
  text: string
};

export default Title;
