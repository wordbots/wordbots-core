import React from 'react';
import { number, func } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

const PageSwitcher = ({ page, maxPages, prevPage, nextPage }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px',
    width: 'calc(100% - 40px)'
  }}>
    <RaisedButton
      icon={<FontIcon className="material-icons">arrow_back</FontIcon>}
      disabled={page <= 1}
      onClick={prevPage}
    />
    <div>{`${page} / ${maxPages}`}</div>
    <RaisedButton
      icon={<FontIcon className="material-icons">arrow_forward</FontIcon>}
      disabled={page >= maxPages}
      onClick={nextPage}
    />
  </div>
);

PageSwitcher.propTypes = {
  page: number,
  maxPages: number,
  prevPage: func,
  nextPage: func
};

export default PageSwitcher;
