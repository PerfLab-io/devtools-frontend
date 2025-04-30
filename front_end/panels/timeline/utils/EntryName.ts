// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import * as Common from '../../../core/common/common.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as Trace from '../../../models/trace/trace.js';

import {getEventStyle} from './EntryStyles.js';

// RegExp groups:
// 1 - scheme, hostname, ?port
// 2 - scheme (using the RFC3986 grammar)
// 3 - ?user:password
// 4 - hostname
// 5 - ?port
// 6 - ?path
// 7 - ?query
// 8 - ?fragment
const schemeRegex = /([A-Za-z][A-Za-z0-9+.-]*):\/\//;
const userRegex = /(?:([A-Za-z0-9\-._~%!$&'()*+,;=:]*)@)?/;
const hostRegex = /((?:\[::\d?\])|(?:[^\s\/:]*))/;
const portRegex = /(?::([\d]+))?/;
const pathRegex = /(\/[^#?]*)?/;
const queryRegex = /(?:\?([^#]*))?/;
const fragmentRegex = /(?:#(.*))?/;

const urlRegex = new RegExp(
    '^(' + schemeRegex.source + userRegex.source + hostRegex.source + portRegex.source + ')' + pathRegex.source +
    queryRegex.source + fragmentRegex.source + '$');

const trimEndWithMaxLength = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) {
    return String(str);
  }
  return str.substr(0, maxLength - 1) + '…';
}


export function completeURL(url: string) {
  let isValid = false;
  let scheme = '';
  let user = '';
  let host = '';
  let port = '';
  let path = '';
  let lastPathComponent = '';
  let displayNameInternal = '';
  let dataURLDisplayNameInternal = '';
  let blobInnerScheme = '';
  const isBlobUrl = url.startsWith('blob:');
  const urlToMatch = isBlobUrl ? url.substring(5) : url;
  const match = urlToMatch.match(urlRegex);

  const domain = (): string => {
    if (scheme === 'data') {
      return 'data:';
    }
    return host + (port ? ':' + port : '');
  }

  const securityOrigin = (): string => {
    if (scheme === 'data') {
      return 'data:';
    }
    const _scheme = isBlobUrl ? blobInnerScheme : scheme;
    return _scheme + '://' + domain();
  }

  const dataURLDisplayName = (): string => {
    if (dataURLDisplayNameInternal) {
      return dataURLDisplayNameInternal;
    }
    if (scheme !== 'data') {
      return '';
    }
    dataURLDisplayNameInternal = trimEndWithMaxLength(url, 20);
    return dataURLDisplayNameInternal;
  }

  const displayName = (): string => {
  if (displayNameInternal) {
    return displayNameInternal;
  }

  if (scheme === 'data') {
    return dataURLDisplayName();
  }
  if (isBlobUrl) {
    return url;
  }
  if (scheme === 'about') {
    return url;
  }

  displayNameInternal = lastPathComponent;
  if (!displayNameInternal) {
    displayNameInternal = (host || '') + '/';
  }
  if (displayNameInternal === '/') {
    displayNameInternal = url;
  }
  return displayNameInternal;
}

  if (match) {
    isValid = true;
    if (isBlobUrl) {
      blobInnerScheme = match[2].toLowerCase();
      scheme = 'blob';
    } else {
      scheme = match[2].toLowerCase();
    }
    user = match[3] ?? '';
    host = match[4] ?? '';
    port = match[5] ?? '';
    path = match[6] ?? '/';
  } else {
    if (url.startsWith('data:')) {
      scheme = 'data';
    }
    if (url.startsWith('blob:')) {
      scheme = 'blob';
    }
    if (url === 'about:blank') {
      scheme = 'about';
    }
    path = url;

    return {
      isValid,
      scheme,
      user,
      host,
      port,
      displayName: displayName(),
      securityOrigin,
    };
  }

  const lastSlashExceptTrailingIndex = path.lastIndexOf('/', path.length - 2);
  if (lastSlashExceptTrailingIndex !== -1) {
    lastPathComponent = path.substring(lastSlashExceptTrailingIndex + 1);
  } else {
    lastPathComponent = path;
  }

  return {
    isValid,
    scheme,
    user,
    host,
    port,
    displayName: displayName(),
    securityOrigin
  };
}

const UIStrings = {
  /**
   *@description Text shown for an entry in the flame chart that has no explicit name.
   */
  anonymous: '(anonymous)',
  /**
   *@description Text used to show an EventDispatch event which has a type associated with it
   *@example {click} PH1
   */
  eventDispatchS: 'Event: {PH1}',
  /**
   *@description Text shown for an entry in the flame chart that represents a frame.
   */
  frame: 'Frame',
  /**
   *@description Text in Timeline Flame Chart Data Provider of the Performance panel
   */
  wsConnectionOpened: 'WebSocket opened',
  /**
   *@description Text in Timeline Flame Chart Data Provider of the Performance panel
   *@example {ws://example.com} PH1
   */
  wsConnectionOpenedWithUrl: 'WebSocket opened: {PH1}',
  /**
   *@description Text in Timeline Flame Chart Data Provider of the Performance panel
   */
  wsConnectionClosed: 'WebSocket closed',
  /**
   *@description Text in Timeline Flame Chart Data Provider of the Performance panel
   */
  layoutShift: 'Layout shift',
} as const;

const str_ = i18n.i18n.registerUIStrings('panels/timeline/utils/EntryName.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);

/**
 * Calculates the display name for a given entry.
 * @param parsedTrace - If the trace data is provided
 * as the second argument it can be used to find source map resolved names for
 * profile calls.
 * Use this function to customize the user visible name for an entry. If no
 * custom name is found, we will fallback to the `name` property in the trace
 * entry.
 */
export function nameForEntry(
    entry: Trace.Types.Events.Event,
    parsedTrace?: Trace.Handlers.Types.ParsedTrace,
    ): string {
  if (Trace.Types.Events.isProfileCall(entry)) {
    if (parsedTrace) {
      const potentialCallName =
          Trace.Handlers.ModelHandlers.Samples.getProfileCallFunctionName(parsedTrace.Samples, entry);
      // We need this extra check because the call name could be the empty
      // string. If it is, we want to fallback.
      if (potentialCallName) {
        return potentialCallName;
      }
    }
    return entry.callFrame.functionName || i18nString(UIStrings.anonymous);
  }

  if (Trace.Types.Events.isLegacyTimelineFrame(entry)) {
    return i18n.i18n.lockedString(UIStrings.frame);
  }

  if (Trace.Types.Events.isDispatch(entry)) {
    // EventDispatch represent user actions such as clicks, so in this case
    // rather than show the event title (which is always just "Event"), we
    // add the type ("click") to help the user understand the event.
    return i18nString(UIStrings.eventDispatchS, {PH1: entry.args.data.type});
  }
  if (Trace.Types.Events.isSyntheticNetworkRequest(entry)) {
    const parsedURL = completeURL(entry.args.data.url);
    const text =
        parsedURL.isValid ? `${parsedURL.displayName} (${parsedURL.host})` : entry.args.data.url || 'Network request';
    return text;
  }

  if (Trace.Types.Events.isWebSocketCreate(entry)) {
    if (entry.args.data.url) {
      return i18nString(UIStrings.wsConnectionOpenedWithUrl, {PH1: entry.args.data.url});
    }

    return i18nString(UIStrings.wsConnectionOpened);
  }

  if (Trace.Types.Events.isWebSocketDestroy(entry)) {
    return i18nString(UIStrings.wsConnectionClosed);
  }

  if (Trace.Types.Events.isSyntheticInteraction(entry)) {
    return nameForInteractionEvent(entry);
  }

  if (Trace.Types.Events.isSyntheticLayoutShift(entry)) {
    return i18nString(UIStrings.layoutShift);
  }

  if (Trace.Types.Events.isSyntheticAnimation(entry) && entry.args.data.beginEvent.args.data.displayName) {
    return entry.args.data.beginEvent.args.data.displayName;
  }

  const eventStyleCustomName = getEventStyle(entry.name as Trace.Types.Events.Name)?.title;

  return eventStyleCustomName || entry.name;
}

function nameForInteractionEvent(event: Trace.Types.Events.SyntheticInteractionPair): string {
  const category = Trace.Handlers.ModelHandlers.UserInteractions.categoryOfInteraction(event);
  // Because we hide nested interactions, we do not want to show the
  // specific type of the interaction that was not hidden, so instead we
  // show just the category of that interaction.
  if (category === 'OTHER') {
    return 'Other';
  }
  if (category === 'KEYBOARD') {
    return 'Keyboard';
  }
  if (category === 'POINTER') {
    return 'Pointer';
  }
  return event.type;
}
