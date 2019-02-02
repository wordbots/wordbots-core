import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

interface PageSwitcherProps {
  page: number
  maxPages: number
  prevPage: () => void
  nextPage: () => void
}

export default class PageSwitcher extends React.Component<PageSwitcherProps> {
  public render(): JSX.Element {
    const { page, maxPages, prevPage, nextPage } = this.props;
    return (
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
  }
}
