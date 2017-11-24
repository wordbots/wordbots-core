import React from 'react';
import { object } from 'prop-types';

const Status = ({status}) => {
  const color = {
    error: '#F44336',
    warning: '#FFEB3B'
  }[status.type] || '#CCC';

  return (
    <div style={{
      display: 'inline-block',
      position: 'absolute',
      top: 50,
      margin: 'auto',
      width: '100%',
      height: 20,
      textAlign: 'center',
      fontFamily: 'Carter One',
      fontSize: 20,
      color: color
    }}>
      {status.message}
    </div>
  );
};

Status.propTypes = {
  status: object
};

export default Status;
