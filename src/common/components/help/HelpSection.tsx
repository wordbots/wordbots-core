import { Paper } from '@material-ui/core';
import * as React from 'react';

import { HEADER_HEIGHT } from '../../constants';

import { anchorId, helpSectionClass } from './AnchorLink';

const HelpSection = (props: { id: string, title: string, children: JSX.Element | JSX.Element[] }): JSX.Element => (
  <Paper
    id={props.id}
    className={helpSectionClass}
    elevation={3}
    style={{ position: 'relative', marginBottom: 20, padding: '5px 20px' }}
  >
    <div
      id={anchorId(props.id)}
      style={{ position: 'absolute', top: -(HEADER_HEIGHT + 76) }}
    />
    <h2>{props.title}</h2>
    {props.children}
  </Paper>
);

export default HelpSection;
