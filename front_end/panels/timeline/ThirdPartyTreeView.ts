// Copyright 2025 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import type * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Trace from '../../models/trace/trace.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';

import * as TimelineTreeView from './TimelineTreeView.js';
import * as Utils from './utils/utils.js';

const UIStrings = {
  /**
   *@description Unattributed text for an unattributed entity.
   */
  unattributed: '[unattributed]',
  /**
   *@description Title for the name of either 1st or 3rd Party entities.
   */
  firstOrThirdPartyName: '1st / 3rd party',
  /**
   *@description Title referencing transfer size.
   */
  transferSize: 'Transfer size',
  /**
   *@description Title referencing self time.
   */
  selfTime: 'Self time',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/ThirdPartyTreeView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);

export class ThirdPartyTreeViewWidget extends TimelineTreeView.TimelineTreeView {
  #thirdPartySummaries: {
    summaries: Trace.Extras.ThirdParties.ThirdPartySummary,
    entityByEvent: Map<Trace.Types.Events.Event, Trace.Extras.ThirdParties.Entity>,
  }|null = null;

  // By default the TimelineTreeView will auto-select the first row
  // when the grid is refreshed but for the ThirdParty view we only
  // want to do this when the user hovers.
  protected override autoSelectFirstChildOnRefresh = false;

  constructor() {
    super();
    this.element.setAttribute('jslog', `${VisualLogging.pane('third-party-tree').track({hover: true})}`);
    this.init();
    this.dataGrid.markColumnAsSortedBy('self', DataGrid.DataGrid.Order.Descending);
    /**
     * By default data grids always expand when arrowing.
     * For 3P table, we don't use this feature.
     */
    this.dataGrid.expandNodesWhenArrowing = false;
  }

  override wasShown(): void {
    this.dataGrid.addEventListener(DataGrid.DataGrid.Events.SELECTED_NODE, this.#onDataGridSelectionChange, this);
  }

  override childWasDetached(_widget: UI.Widget.Widget): void {
    this.dataGrid.removeEventListener(DataGrid.DataGrid.Events.SELECTED_NODE, this.#onDataGridSelectionChange);
  }

  override buildTree(): Trace.Extras.TraceTree.Node {
    const parsedTrace = this.parsedTrace();
    const entityMapper = this.entityMapper();

    if (!parsedTrace || !entityMapper) {
      return new Trace.Extras.TraceTree.BottomUpRootNode(
          [], this.textFilter(), this.filtersWithoutTextFilter(), this.startTime, this.endTime,
          this.groupingFunction());
    }

    // Update summaries.
    const min = Trace.Helpers.Timing.milliToMicro(this.startTime);
    const max = Trace.Helpers.Timing.milliToMicro(this.endTime);
    const bounds: Trace.Types.Timing.TraceWindowMicro = {max, min, range: Trace.Types.Timing.Micro(max - min)};
    this.#thirdPartySummaries =
        Trace.Extras.ThirdParties.getSummariesAndEntitiesWithMapping(parsedTrace, bounds, entityMapper.mappings());

    const events = this.#thirdPartySummaries?.entityByEvent.keys();
    const relatedEvents = Array.from(events ?? []).sort(Trace.Helpers.Trace.eventTimeComparator);

    // The filters for this view are slightly different; we want to use the set
    // of visible event types, but also include network events, which by
    // default are not in the set of visible entries (as they are not shown on
    // the main flame chart).
    const filter = new Trace.Extras.TraceFilter.VisibleEventsFilter(
        Utils.EntryStyles.visibleTypes().concat([Trace.Types.Events.Name.SYNTHETIC_NETWORK_REQUEST]));
    const node = new Trace.Extras.TraceTree.BottomUpRootNode(
        relatedEvents, this.textFilter(), [filter], this.startTime, this.endTime, this.groupingFunction());
    return node;
  }

  /**
   * Third party tree view doesn't require the select feature, as this expands the node.
   */
  override selectProfileNode(): void {
    return;
  }

  protected groupingFunction(): ((arg0: Trace.Types.Events.Event) => string)|null {
    return this.domainByEvent.bind(this);
  }

  private domainByEvent(event: Trace.Types.Events.Event): string {
    const parsedTrace = this.parsedTrace();
    if (!parsedTrace) {
      return '';
    }

    const entityMappings = this.entityMapper();
    if (!entityMappings) {
      return '';
    }

    const entity = entityMappings.entityForEvent(event);
    if (!entity) {
      return '';
    }

    return entity.name;
  }

  override populateColumns(columns: DataGrid.DataGrid.ColumnDescriptor[]): void {
    columns.push(
        {
          id: 'site',
          title: i18nString(UIStrings.firstOrThirdPartyName),
          width: '100px',
          fixedWidth: true,
          sortable: true,
        },
        {
          id: 'transfer-size',
          title: i18nString(UIStrings.transferSize),
          width: '80px',
          fixedWidth: true,
          sortable: true,
        },
        {
          id: 'self',
          title: i18nString(UIStrings.selfTime),
          width: '80px',
          fixedWidth: true,
          sortable: true,
        });
  }

  override populateToolbar(): void {
    return;
  }

  private compareTransferSize(
      a: DataGrid.SortableDataGrid.SortableDataGridNode<TimelineTreeView.GridNode>,
      b: DataGrid.SortableDataGrid.SortableDataGridNode<TimelineTreeView.GridNode>): number {
    const nodeA = a as TimelineTreeView.TreeGridNode;
    const nodeB = b as TimelineTreeView.TreeGridNode;
    const transferA = this.extractThirdPartySummary(nodeA.profileNode).transferSize ?? 0;
    const transferB = this.extractThirdPartySummary(nodeB.profileNode).transferSize ?? 0;
    return transferA - transferB;
  }

  override sortingChanged(): void {
    const columnId = this.dataGrid.sortColumnId();
    if (!columnId) {
      return;
    }

    let sortFunction:
        ((a: DataGrid.SortableDataGrid.SortableDataGridNode<TimelineTreeView.GridNode>,
          b: DataGrid.SortableDataGrid.SortableDataGridNode<TimelineTreeView.GridNode>) => number)|null;
    switch (columnId) {
      case 'transfer-size':
        sortFunction = this.compareTransferSize.bind(this);
        break;
      default:
        sortFunction = super.getSortingFunction(columnId);
        break;
    }

    if (sortFunction) {
      this.dataGrid.sortNodes(sortFunction, !this.dataGrid.isSortOrderAscending());
    }
  }

  /**
   * This event fires when the user selects a row in the grid, either by
   * clicking or by using the arrow keys. We want to have the same effect as
   * when the user hover overs a row.
   */
  #onDataGridSelectionChange(
      event: Common.EventTarget.EventTargetEvent<DataGrid.DataGrid.DataGridNode<TimelineTreeView.GridNode>>): void {
    this.onHover((event.data as TimelineTreeView.GridNode).profileNode);
  }

  override onHover(node: Trace.Extras.TraceTree.Node|null): void {
    const entityMappings = this.entityMapper();
    if (!entityMappings || !node?.event) {
      return;
    }
    const nodeEntity = entityMappings.entityForEvent(node.event);
    if (!nodeEntity) {
      return;
    }
    const eventsForEntity = entityMappings.eventsForEntity(nodeEntity);
    this.dispatchEventToListeners(TimelineTreeView.TimelineTreeView.Events.THIRD_PARTY_ROW_HOVERED, eventsForEntity);
  }

  displayInfoForGroupNode(node: Trace.Extras.TraceTree.Node): {
    name: string,
    color: string,
    icon: (Element|undefined),
  } {
    const color = 'gray';
    const unattributed = i18nString(UIStrings.unattributed);
    const id = typeof node.id === 'symbol' ? undefined : node.id;
    const domainName = id ? this.domainByEvent(node.event) : undefined;
    return {name: domainName || unattributed, color, icon: undefined};
  }

  extractThirdPartySummary(node: Trace.Extras.TraceTree.Node): {transferSize: number} {
    if (!this.#thirdPartySummaries) {
      return {transferSize: 0};
    }

    const entity = this.#thirdPartySummaries.entityByEvent.get(node.event);
    if (!entity) {
      return {transferSize: 0};
    }
    const summary = this.#thirdPartySummaries.summaries.byEntity.get(entity);
    if (!summary) {
      return {transferSize: 0};
    }
    return {transferSize: summary.transferSize};
  }

  nodeIsFirstParty(node: Trace.Extras.TraceTree.Node): boolean {
    const mapper = this.entityMapper();
    if (!mapper) {
      return false;
    }
    const firstParty = mapper.firstPartyEntity();
    return firstParty === mapper.entityForEvent(node.event);
  }

  nodeIsExtension(node: Trace.Extras.TraceTree.Node): boolean {
    const mapper = this.entityMapper();
    if (!mapper) {
      return false;
    }
    const entity = mapper.entityForEvent(node.event);
    return Boolean(entity) && entity?.category === 'Chrome Extension';
  }
}

export class ThirdPartyTreeView extends UI.Widget.WidgetElement<UI.Widget.Widget> {
  #treeView?: ThirdPartyTreeViewWidget;

  set treeView(treeView: ThirdPartyTreeViewWidget) {
    this.#treeView = treeView;
  }

  constructor() {
    super();
    this.style.display = 'contents';
  }

  override createWidget(): UI.Widget.Widget {
    const containerWidget = new UI.Widget.Widget(false, undefined, this);
    containerWidget.contentElement.style.display = 'contents';
    if (this.#treeView) {
      this.#treeView.show(containerWidget.contentElement);
    }
    return containerWidget;
  }
}

customElements.define('devtools-performance-third-party-tree-view', ThirdPartyTreeView);

declare global {
  interface HTMLElementTagNameMap {
    'devtools-performance-third-party-tree-view': ThirdPartyTreeView;
  }
}
