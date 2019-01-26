import * as React from 'react';
import Paper from '@material-ui/core/Paper';

import { DeckCreationProperties, FilterKey } from './types';
import FilterControls from './FilterControls';
import LayoutControls from './LayoutControls';
import SearchControls from './SearchControls';
import SortControls from './SortControls';

interface DeckCreationSidebarControlsProps {
  layout: DeckCreationProperties['layout']
  sortCriteria: DeckCreationProperties['sortCriteria']
  sortOrder: DeckCreationProperties['sortOrder']
  onSetField: (key: keyof DeckCreationProperties) => (value: any) => void
  onToggleFilter: (filter: FilterKey) => (event: React.SyntheticEvent<any>, toggled: boolean) => void
}

/**
 * Sidebar containing search, layout, sort, and filter controls.
 * Used by the Deck and NewSet containers.
 */
export default class DeckCreationSidebarControls extends React.Component<DeckCreationSidebarControlsProps> {
  public render(): JSX.Element {
    const { layout, sortCriteria, sortOrder, onSetField, onToggleFilter } = this.props;
    return (
      <Paper style={{padding: 20, marginBottom: 10}}>
        <SearchControls onChange={onSetField('searchText')} />

        <LayoutControls
          layout={layout}
          onSetLayout={onSetField('layout')} />

        <SortControls
          criteria={sortCriteria}
          order={sortOrder}
          onSetCriteria={onSetField('sortCriteria')}
          onSetOrder={onSetField('sortOrder')} />

        <FilterControls
          onToggleFilter={onToggleFilter}
          onSetCostRange={onSetField('costRange')} />
      </Paper>
    );
  }
}
