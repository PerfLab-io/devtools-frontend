// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Protocol from '../../../generated/protocol.js';
import {getValuesOfAllBodyRows} from '../../../testing/DataGridHelpers.js';
import {renderElementIntoDOM} from '../../../testing/DOMHelpers.js';
import {describeWithLocale} from '../../../testing/EnvironmentHelpers.js';
import * as RenderCoordinator from '../../../ui/components/render_coordinator/render_coordinator.js';

import * as ApplicationComponents from './components.js';

async function renderSharedStorageAccessGrid(events: Protocol.Storage.SharedStorageAccessedEvent[]):
    Promise<ApplicationComponents.SharedStorageAccessGrid.SharedStorageAccessGrid> {
  const component = new ApplicationComponents.SharedStorageAccessGrid.SharedStorageAccessGrid();
  renderElementIntoDOM(component);
  component.data = events;

  // The data-grid's renderer is scheduled, so we need to wait until the coordinator
  // is done before we can test against it.
  await RenderCoordinator.done();

  return component;
}

function getInternalDataGridShadowRoot(
    component: ApplicationComponents.SharedStorageAccessGrid.SharedStorageAccessGrid): ShadowRoot {
  const dataGrid = component.shadowRoot!.querySelector('devtools-data-grid')!;
  assert.isNotNull(dataGrid.shadowRoot);
  return dataGrid.shadowRoot;
}

describeWithLocale('SharedStorageAccessGrid', () => {
  it('renders shared storage access events', async () => {
    const noId = '' as Protocol.Page.FrameId;
    const params1 = {key: 'key0', value: 'value0'} as Protocol.Storage.SharedStorageAccessParams;
    const params2 = {key: 'key0'} as Protocol.Storage.SharedStorageAccessParams;

    const component = await renderSharedStorageAccessGrid([
      {
        accessTime: 0,
        type: Protocol.Storage.SharedStorageAccessType.DocumentAppend,
        mainFrameId: noId,
        ownerOrigin: 'https://owner1.com',
        params: params1,
      },
      {
        accessTime: 10,
        type: Protocol.Storage.SharedStorageAccessType.WorkletDelete,
        mainFrameId: noId,
        ownerOrigin: 'https://owner2.com',
        params: params2,
      },
    ]);

    const dataGridShadowRoot = getInternalDataGridShadowRoot(component);
    const rowValues = getValuesOfAllBodyRows(dataGridShadowRoot);
    const expectedValues = [
      [(new Date(0 * 1e3)).toLocaleString(), 'documentAppend', 'https://owner1.com', JSON.stringify(params1)],
      [(new Date(10 * 1e3)).toLocaleString(), 'workletDelete', 'https://owner2.com', JSON.stringify(params2)],
    ];
    assert.deepEqual(rowValues, expectedValues);
  });

  it('hides shared storage event table when there are no events', async () => {
    const component = await renderSharedStorageAccessGrid([]);

    const nullGridElement = component.shadowRoot!.querySelector('devtools-new-data');
    assert.isNull(nullGridElement);

    const noEventsElement = component.shadowRoot!.querySelector('div.no-events-message');
    assert.instanceOf(noEventsElement, HTMLDivElement);
  });
});
