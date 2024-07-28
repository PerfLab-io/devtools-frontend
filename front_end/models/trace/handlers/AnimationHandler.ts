// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';

import {HandlerState} from './types.js';

const animations: Types.TraceEvents.TraceEventAnimation[] = [];
const animationsSyntheticEvents: Types.TraceEvents.SyntheticAnimationPair[] = [];
const animationFrames: Array<
                        Types.TraceEvents.TraceEventAnimationFrameGroupingEvent |
                        Types.TraceEvents.TraceEventAnimationFrameInstantEvent |
                        Types.TraceEvents.TraceEventAnimationFramePaintGroupingEvent |
                        Types.TraceEvents.TraceEventAnimationFrameScriptGroupingEvent
                        > = [];
const animationFramesSyntheticEvents: Types.TraceEvents.SyntheticAnimationFramePair[] = [];

export interface AnimationData {
  animations: readonly Types.TraceEvents.SyntheticAnimationPair[];
  animationFrames: readonly Types.TraceEvents.SyntheticAnimationFramePair[];
}
let handlerState = HandlerState.UNINITIALIZED;

export function reset(): void {
  animations.length = 0;
  animationsSyntheticEvents.length = 0;
}

function isAnimationFrameGrouping(event: Types.TraceEvents.TraceEventData): event is
  Types.TraceEvents.TraceEventAnimationFrameGroupingEvent |
  Types.TraceEvents.TraceEventAnimationFrameInstantEvent |
  Types.TraceEvents.TraceEventAnimationFramePaintGroupingEvent |
  Types.TraceEvents.TraceEventAnimationFrameScriptGroupingEvent {
  return Types.TraceEvents.isTraceEventAnimationFrame(event) ||
    Types.TraceEvents.isTraceEventAnimationFramePaint(event) ||
    Types.TraceEvents.isTraceEventAnimationFrameScript(event) ||
    Types.TraceEvents.isTraceEventAnimationFrameInstant(event);
}

let currentBeginEventSulfix: string | null = null;

export function handleEvent(event: Types.TraceEvents.TraceEventData): void {
  if (Types.TraceEvents.isTraceEventAnimation(event)) {
    animations.push(event);
    return;
  }

  if (isAnimationFrameGrouping(event)) {
    // INFO: Hack to correctly pair AnimationFrame nestable groupings. Since the current
    // local id is not correctly set.
    const isStartEvent = event.ph === Types.TraceEvents.Phase.ASYNC_NESTABLE_START;

    if (isStartEvent && event.name === Types.TraceEvents.KnownEventName.AnimationFrame) {
      currentBeginEventSulfix = `${event.ts}`;
    }

    event.id2 = { local: `${event.id2?.local}-${currentBeginEventSulfix}` };

    animationFrames.push(event);

    return;
  }
}

export async function finalize(): Promise<void> {
  const syntheticEvents = Helpers.Trace.createMatchedSortedSyntheticEvents(animations);
  animationsSyntheticEvents.push(...syntheticEvents);

  const afSyntheticEvents = Helpers.Trace.createMatchedSortedSyntheticEvents(animationFrames) as Types.TraceEvents.SyntheticAnimationFramePair[];
  animationFramesSyntheticEvents.push(...afSyntheticEvents);

  handlerState = HandlerState.FINALIZED;
}

export function data(): AnimationData {
  if (handlerState !== HandlerState.FINALIZED) {
    throw new Error('Animation handler is not finalized');
  }

  return {
    animations: animationsSyntheticEvents,
    animationFrames: animationFramesSyntheticEvents,
  };
}
