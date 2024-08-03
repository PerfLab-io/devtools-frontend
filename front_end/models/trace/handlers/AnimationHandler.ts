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

const eventSulfixes: Array<string> = [];
let currentGroupingEventSulfix: string | null = null;

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
      currentGroupingEventSulfix = `${event.ts}`;
    }

    // INFO: Add a sulfix to each event to correctly pair AnimationFrame nestable groupings.
    // Since we can have multiple script and instant entries in the same animation frame.
    if (isStartEvent && event.name !== Types.TraceEvents.KnownEventName.AnimationFrame) {
      const currentBeginEventSulfix = `${event.ts}`;
      eventSulfixes.push(currentBeginEventSulfix);
    }

    if (event.name === Types.TraceEvents.KnownEventName.AnimationFrame) {
      event.id2 = { local: `${event.id2?.local}-${currentGroupingEventSulfix}` };
    } else {
      // INFO: Hack to correctly pair AnimationFrame nestable groupings. Since the current
      // Has to be unique for each event but correclty match the begining and end events to form
      // the pairs.
      const currentBeginEventSulfix = !isStartEvent ? eventSulfixes.pop() : eventSulfixes.at(-1);
      event.id2 = { local: `${event.id2?.local}-${currentGroupingEventSulfix}-${currentBeginEventSulfix}` };
    }

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
