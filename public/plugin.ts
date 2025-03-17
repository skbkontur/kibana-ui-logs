import { CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { KibanaSearchLoggerPluginSetup, KibanaSearchLoggerPluginStart } from './types';
import { ATTRIBUTES, INDEX_NAME, SELECTORS } from '../common';

export class KibanaSearchLoggerPlugin
  implements Plugin<KibanaSearchLoggerPluginSetup, KibanaSearchLoggerPluginStart>
{
  private observer: MutationObserver | null = null;
  private lastSentData: string | null = null;
  
  constructor() {
    this.debouncedSendData = this.debounce((core: CoreStart) => this.sendData(core), 1000);
  }

  public setup(core: CoreSetup): KibanaSearchLoggerPluginSetup {
    return {};
  }

  public start(core: CoreStart): KibanaSearchLoggerPluginStart {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target as Node;

        if (target instanceof HTMLElement) {
          if (mutation.type === 'attributes') {
            if (
              target.matches(SELECTORS.indexPatternSwitch) &&
              mutation.attributeName === ATTRIBUTES.indexPatternTitle
            ) {
              this.debouncedSendData(core);
            }

            if (
              target.matches(SELECTORS.timeRangeDuration) &&
              mutation.attributeName === ATTRIBUTES.timeFilter
            ) {
              this.debouncedSendData(core);
            }
          }

          if (
            target.matches(SELECTORS.queryInput) ||
            target.matches(SELECTORS.globalFilterGroup)
          ) {
            this.debouncedSendData(core);
          }
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    this.waitForElements(
      [
        SELECTORS.timeRangeDuration,
        SELECTORS.indexPatternSwitch,
        SELECTORS.queryInput,
        SELECTORS.globalFilterGroup,
      ],
      () => {
        this.sendData(core);
      }
    );

    return {};
  }

  private waitForElements(selectors: string[], callback: () => void) {
    const observer = new MutationObserver(() => {
      const allElementsExist = selectors.every((selector) => document.querySelector(selector));
      if (allElementsExist) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private debouncedSendData = this.debounce((core: CoreStart) => this.sendData(core), 1000);

  private sendData(core: CoreStart) {
    const queryDateRange = document.querySelector(SELECTORS.timeRangeDuration);
    const queryDateRangeValue = queryDateRange?.getAttribute(ATTRIBUTES.timeFilter) || '';

    const searchIndexButton = document.querySelector(SELECTORS.indexPatternSwitch);
    const searchIndexText = searchIndexButton?.getAttribute(ATTRIBUTES.indexPatternTitle);

    const queryInput = document.querySelector(SELECTORS.queryInput);
    const queryInputText = queryInput?.textContent;

    if (searchIndexText?.includes(INDEX_NAME)) return;

    const dateRangeParts = queryDateRangeValue.split(' to ');
    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date.toISOString();
    };

    const stripMilliseconds = (isoString: string | null) =>
      isoString ? isoString.slice(0, -5) + 'Z' : null;

    const startTime = formatDate(dateRangeParts[0]);
    const endTime = formatDate(dateRangeParts[1]);
    const startTimeForComparison = stripMilliseconds(startTime);
    const endTimeForComparison = stripMilliseconds(endTime);

    const activeFilters = Array.from(document.querySelectorAll(SELECTORS.filter))
      .map((el) =>
        el.getAttribute('title')?.match(/Filter: (.*?)\. Select for more filter actions\./)?.[1]
      )
      .filter(Boolean);

    const data = {
      searchIndex: searchIndexText,
      fromTime: startTime,
      toTime: endTime,
      query: queryInputText,
      filters: activeFilters,
    };

    const dataForComparison = JSON.stringify({
      searchIndex: searchIndexText,
      fromTime: startTimeForComparison,
      toTime: endTimeForComparison,
      query: queryInputText,
      filters: activeFilters,
    });

    if (this.lastSentData === dataForComparison) return;
    this.lastSentData = dataForComparison;

    core.http.post('/api/kibana_search_logger/log', {
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  public stop() {
    this.observer?.disconnect();
    this.observer = null;
  }
}
