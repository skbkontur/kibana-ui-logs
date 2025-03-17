export const PLUGIN_ID = 'kibanaSearchLogger';
export const PLUGIN_NAME = 'kibanaSearchLogger';
export const INDEX_NAME = 'kibana-ui-logs';
export const SELECTORS = {
  indexPatternSwitch: '[data-test-subj="indexPattern-switch-link"]',
  queryInput: '[data-test-subj="queryInput"]',
  timeRangeDuration: '[data-test-subj="dataSharedTimefilterDuration"]',
  globalFilterGroup: '[class*="globalFilterBar"]',
  filter: '[data-test-subj^="filter filter-enabled"]'
};
export const ATTRIBUTES = {
  indexPatternTitle: 'title',
  timeFilter: 'data-shared-timefilter-duration'
};
