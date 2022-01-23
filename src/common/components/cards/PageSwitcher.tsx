import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as React from 'react';

interface PageSwitcherProps {
  page: number
  maxPages: number
  prevPage: () => void
  nextPage: () => void
}

export default class PageSwitcher extends React.PureComponent<PageSwitcherProps> {
  public render(): JSX.Element {
    const { page, maxPages, prevPage, nextPage } = this.props;
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '20px',
          width: 'calc(100% - 40px)'
        }}
      >
        <Button
          variant="outlined"
          disabled={page <= 1}
          onClick={prevPage}
        >
          <Icon className="material-icons">arrow_back</Icon>
        </Button>
        <div style={{ margin: 'auto' }}>
          {`${page} / ${maxPages}`}
        </div>
        <Button
          variant="outlined"
          disabled={page >= maxPages}
          onClick={nextPage}
        >
          <Icon className="material-icons">arrow_forward</Icon>
        </Button>
      </div>
    );
  }
}
