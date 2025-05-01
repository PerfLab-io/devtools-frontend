// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import * as i18n from '../../../core/i18n/i18n.js';
import type * as Platform from '../../../core/platform/platform.js';
import * as Trace from '../../../models/trace/trace.js';
// import * as ThemeSupport from '../../../ui/legacy/theme_support/theme_support.js';

const UIStrings = {
  /**
   *@description Category in the Summary view of the Performance panel to indicate time spent to load resources
   */
  loading: 'Loading',
  /**
   *@description Text in Timeline for the Experience title
   */
  experience: 'Experience',
  /**
   *@description Category in the Summary view of the Performance panel to indicate time spent in script execution
   */
  scripting: 'Scripting',
  /**
   *@description Category in the Summary view of the Performance panel to indicate time spent in rendering the web page
   */
  rendering: 'Rendering',
  /**
   *@description Category in the Summary view of the Performance panel to indicate time spent to visually represent the web page
   */
  painting: 'Painting',
  /**
   *@description Event category in the Performance panel for time spent in the GPU
   */
  gpu: 'GPU',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  async: 'Async',
  /**
   *@description Category in the Summary view of the Performance panel to indicate time spent in the rest of the system
   */
  system: 'System',
  /**
   *@description Category in the Summary view of the Performance panel to indicate idle time
   */
  idle: 'Idle',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  task: 'Task',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  consoleTaskRun: 'Run console task',
  /**
   *@description Text for other types of items
   */
  other: 'Other',
  /**
   *@description Text that refers to the animation of the web page
   */
  animation: 'Animation',
  /**
   *@description Text that refers to some events
   */
  event: 'Event',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  requestMainThreadFrame: 'Request main thread frame',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  frameStart: 'Frame start',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  onMessage: 'On message',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  schedulePostMessage: 'Schedule postMessage',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  messaging: 'Messaging',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  frameStartMainThread: 'Frame start (main thread)',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  drawFrame: 'Draw frame',
  /**
   *@description Noun for an event in the Performance panel. This marks time
    spent in an operation that only happens when the profiler is active.
   */
  profilingOverhead: 'Profiling overhead',
  /**
   *@description The process the browser uses to determine a target element for a
   *pointer event. Typically, this is determined by considering the pointer's
   *location and also the visual layout of elements on the screen.
   */
  hitTest: 'Hit test',
  /**
   *@description Noun for an event in the Performance panel. The browser has decided
   *that the styles for some elements need to be recalculated and scheduled that
   *recalculation process at some time in the future.
   */
  scheduleStyleRecalculation: 'Schedule style recalculation',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  recalculateStyle: 'Recalculate style',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  invalidateLayout: 'Invalidate Layout',
  /**
   *@description Noun for an event in the Performance panel. Layerize is a step
   *where we calculate which layers to create.
   */
  layerize: 'Layerize',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  layout: 'Layout',
  /**
   *@description Noun for an event in the Performance panel. Paint setup is a
   *step before the 'Paint' event. A paint event is when the browser draws pixels
   *to the screen. This step is the setup beforehand.
   */
  paintSetup: 'Paint setup',
  /**
   *@description Noun for a paint event in the Performance panel, where an image
   *was being painted. A paint event is when the browser draws pixels to the
   *screen, in this case specifically for an image in a website.
   */
  paintImage: 'Paint image',
  /**
   *@description Noun for an event in the Performance panel. Pre-paint is a
   *step before the 'Paint' event. A paint event is when the browser records the
   *instructions for drawing the page. This step is the setup beforehand.
   */
  prePaint: 'Pre-paint',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  updateLayer: 'Update layer',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  updateLayerTree: 'Update layer tree',
  /**
   *@description Noun for a paint event in the Performance panel. A paint event is when the browser draws pixels to the screen.
   */
  paint: 'Paint',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  rasterizePaint: 'Rasterize paint',
  /**
   *@description The action to scroll
   */
  scroll: 'Scroll',
  /**
   *@description Noun for an event in the Performance panel. Commit is a step
   *where we send (also known as "commit") layers to the compositor thread. This
   *step follows the "Layerize" step which is what calculates which layers to
   *create.
   */
  commit: 'Commit',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  compositeLayers: 'Composite layers',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  computeIntersections: 'Compute intersections',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  parseHtml: 'Parse HTML',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  parseStylesheet: 'Parse stylesheet',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  installTimer: 'Install timer',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  removeTimer: 'Remove timer',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  timerFired: 'Timer fired',
  /**
   *@description Text for an event. Shown in the timeline in the Performance panel.
   * XHR refers to XmlHttpRequest, a Web API. This particular Web API has a property
   * named 'readyState' (https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState). When
   * the 'readyState' property changes the text is shown.
   */
  xhrReadyStateChange: '`XHR` `readyState` change',
  /**
   * @description Text for an event. Shown in the timeline in the Performance panel.
   * XHR refers to XmlHttpRequest, a Web API. (see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
   * The text is shown when a XmlHttpRequest load event happens on the inspected page.
   */
  xhrLoad: '`XHR` load',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  compileScript: 'Compile script',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  cacheScript: 'Cache script code',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  compileCode: 'Compile code',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  optimizeCode: 'Optimize code',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  evaluateScript: 'Evaluate script',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  compileModule: 'Compile module',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  cacheModule: 'Cache module code',
  /**
   * @description Text for an event. Shown in the timeline in the Performance panel.
   * "Module" refers to JavaScript modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
   * JavaScript modules are a way to organize JavaScript code.
   * "Evaluate" is the phase when the JavaScript code of a module is executed.
   */
  evaluateModule: 'Evaluate module',
  /**
   *@description Noun indicating that a compile task (type: streaming) happened.
   */
  streamingCompileTask: 'Streaming compile task',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  waitingForNetwork: 'Waiting for network',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  parseAndCompile: 'Parse and compile',
  /**
   * @description Text in Timeline UIUtils of the Performance panel.
   * "Code Cache" refers to JavaScript bytecode cache: https://v8.dev/blog/code-caching-for-devs
   * "Deserialize" refers to the process of reading the code cache.
   */
  deserializeCodeCache: 'Deserialize code cache',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  streamingWasmResponse: 'Streaming Wasm response',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  compiledWasmModule: 'Compiled Wasm module',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  cachedWasmModule: 'Cached Wasm module',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  wasmModuleCacheHit: 'Wasm module cache hit',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  wasmModuleCacheInvalid: 'Wasm module cache invalid',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  frameStartedLoading: 'Frame started loading',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  onloadEvent: 'Onload event',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  domcontentloadedEvent: 'DOMContentLoaded event',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  firstPaint: 'First Paint',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  firstContentfulPaint: 'First Contentful Paint',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  largestContentfulPaint: 'Largest Contentful Paint',
  /**
   *@description Text for timestamps of items
   */
  timestamp: 'Timestamp',
  /**
   *@description Noun for a 'time' event that happens in the Console (a tool in
   * DevTools). The user can trigger console time events from their code, and
   * they will show up in the Performance panel. Time events are used to measure
   * the duration of something, e.g. the user will emit two time events at the
   * start and end of some interesting task.
   */
  consoleTime: 'Console time',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  userTiming: 'User timing',
  /**
   * @description Name for an event shown in the Performance panel. When a network
   * request is about to be sent by the browser, the time is recorded and DevTools
   * is notified that a network request will be sent momentarily.
   */
  willSendRequest: 'Will send request',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  sendRequest: 'Send request',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  receiveResponse: 'Receive response',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  finishLoading: 'Finish loading',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  receiveData: 'Receive data',
  /**
   *@description Event category in the Performance panel for time spent to execute microtasks in JavaScript
   */
  runMicrotasks: 'Run microtasks',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  functionCall: 'Function call',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  gcEvent: 'GC event',
  /**
   *@description Event category in the Performance panel for time spent to perform a full Garbage Collection pass
   */
  majorGc: 'Major GC',
  /**
   *@description Event category in the Performance panel for time spent to perform a quick Garbage Collection pass
   */
  minorGc: 'Minor GC',
  /**
   *@description Text for the request animation frame event
   */
  requestAnimationFrame: 'Request animation frame',
  /**
   *@description Text to cancel the animation frame
   */
  cancelAnimationFrame: 'Cancel animation frame',
  /**
   *@description Text for the event that an animation frame is fired
   */
  animationFrameFired: 'Animation frame fired',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  requestIdleCallback: 'Request idle callback',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  cancelIdleCallback: 'Cancel idle callback',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  fireIdleCallback: 'Fire idle callback',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  createWebsocket: 'Create WebSocket',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  sendWebsocketHandshake: 'Send WebSocket handshake',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  receiveWebsocketHandshake: 'Receive WebSocket handshake',
  /**
   *@description Text in Timeline Flame Chart Data Provider of the Performance panel
   */
  wsMessageReceived: 'Receive WebSocket message',
  /**
   *@description Text in Timeline Flame Chart Data Provider of the Performance panel
   */
  wsMessageSent: 'Send WebSocket message',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  destroyWebsocket: 'Destroy WebSocket',
  /**
   *@description Event category in the Performance panel for time spent in the embedder of the WebView
   */
  embedderCallback: 'Embedder callback',
  /**
   *@description Event category in the Performance panel for time spent decoding an image
   */
  imageDecode: 'Image decode',
  /**
   *@description Event category in the Performance panel for time spent to perform Garbage Collection for the Document Object Model
   */
  domGc: 'DOM GC',
  /**
   *@description Event category in the Performance panel for time spent to perform Garbage Collection for C++: https://chromium.googlesource.com/v8/v8/+/main/include/cppgc/README.md
   */
  cppGc: 'CPP GC',
  /**
   *@description Event category in the Performance panel for time spent to perform encryption
   */
  encrypt: 'Encrypt',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  encryptReply: 'Encrypt reply',
  /**
   *@description Event category in the Performance panel for time spent to perform decryption
   */
  decrypt: 'Decrypt',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  decryptReply: 'Decrypt reply',
  /**
   * @description Noun phrase meaning 'the browser was preparing the digest'.
   * Digest: https://developer.mozilla.org/en-US/docs/Glossary/Digest
   */
  digest: 'Digest',
  /**
   *@description Noun phrase meaning 'the browser was preparing the digest
   *reply'. Digest: https://developer.mozilla.org/en-US/docs/Glossary/Digest
   */
  digestReply: 'Digest reply',
  /**
   *@description The 'sign' stage of a web crypto event. Shown when displaying what the website was doing at a particular point in time.
   */
  sign: 'Sign',
  /**
   * @description Noun phrase for an event of the Web Crypto API. The event is recorded when the signing process is concluded.
   * Signature: https://developer.mozilla.org/en-US/docs/Glossary/Signature/Security
   */
  signReply: 'Sign reply',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  verify: 'Verify',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  verifyReply: 'Verify reply',
  /**
   *@description Text in Timeline UIUtils of the Performance panel
   */
  asyncTask: 'Async task',
  /**
   *@description Text in Timeline for Layout Shift records
   */
  layoutShift: 'Layout shift',
  /**
   *@description Text in Timeline for Layout Shift records
   */
  layoutShiftCluster: 'Layout shift cluster',
  /**
   *@description Text in Timeline for an Event Timing record
   */
  eventTiming: 'Event timing',
  /**
   *@description Event category in the Performance panel for JavaScript nodes in CPUProfile
   */
  jsFrame: 'JS frame',
  /**
   *@description Text in UIDevtools Utils of the Performance panel
   */
  rasterizing: 'Rasterizing',
  /**
   *@description Text in UIDevtools Utils of the Performance panel
   */
  drawing: 'Drawing',
  /**
   * @description Label for an event in the Performance panel indicating that a
   * callback function has been scheduled to run at a later time using the
   * postTask API.
   */
  schedulePostTaskCallback: 'Schedule postTask',
  /**
   * @description Label for an event in the Performance panel indicating that a
   * callback function that was scheduled to run using the postTask API was
   * fired (invoked).
   */
  runPostTaskCallback: 'Fire postTask',
  /**
   * @description Label for an event in the Performance panel indicating that a
   * callback function that was scheduled to run at a later time using the
   * postTask API was cancelled, so will no longer run.
   */
  abortPostTaskCallback: 'Cancel postTask',
} as const;

export enum EventCategory {
  DRAWING = 'drawing',
  RASTERIZING = 'rasterizing',
  LAYOUT = 'layout',
  LOADING = 'loading',
  EXPERIENCE = 'experience',
  SCRIPTING = 'scripting',
  MESSAGING = 'messaging',
  RENDERING = 'rendering',
  PAINTING = 'painting',
  GPU = 'gpu',
  ASYNC = 'async',
  OTHER = 'other',
  IDLE = 'idle',
}

let mainEventCategories: EventCategory[];

// const str_ = i18n.i18n.registerUIStrings('panels/timeline/utils/EntryStyles.ts', UIStrings);
// const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const getLocalizedString = (str: string) => str as Platform.UIString.LocalizedString;

export class TimelineRecordStyle {
  title: string;
  category: TimelineCategory;
  hidden: boolean;

  constructor(title: string, category: TimelineCategory, hidden: boolean|undefined = false) {
    this.title = title;
    this.category = category;
    this.hidden = hidden;
  }
}
export class TimelineCategory {
  name: EventCategory;
  title: Platform.UIString.LocalizedString;
  visible: boolean;
  childColor: string;
  colorInternal: string;
  #hidden?: boolean;

  constructor(
      name: EventCategory, title: Platform.UIString.LocalizedString, visible: boolean, childColor: string,
      color: string) {
    this.name = name;
    this.title = title;
    this.visible = visible;
    this.childColor = childColor;
    this.colorInternal = color;
    this.hidden = false;
  }

  get hidden(): boolean {
    return Boolean(this.#hidden);
  }

  get color(): string {
    return this.getComputedColorValue();
  }
  getCSSValue(): string {
    return `var(${this.colorInternal})`;
  }

  getComputedColorValue(): string {
    // return ThemeSupport.ThemeSupport.instance().getComputedValue(this.colorInternal);
    return this.colorInternal;
  }

  set hidden(hidden: boolean) {
    this.#hidden = hidden;
  }
}

export type CategoryPalette = {
  [c in EventCategory]: TimelineCategory
};

type EventStylesMap = {
  [key in Trace.Types.Events.Name]?: TimelineRecordStyle;
};

/**
 * This object defines the styles for the categories used in the
 * timeline (loading, rendering, scripting, etc.).
 */
let categoryStyles: CategoryPalette|null;

/**
 * This map defines the styles for events shown in the panel. This
 * includes its color (which on the event's category, the label it's
 * displayed with and flag to know weather it's visible in the flamechart
 * or not).
 * The thread appenders use this map to determine if an event should be
 * shown in the flame chart. If an event is not in the map, then it
 * won't be shown, but it also won't be shown if it's marked as "hidden"
 * in its styles.
 *
 * The map is also used in other places, like the event's details view.
 */
let eventStylesMap: EventStylesMap|null;

export function getEventStyle(eventName: Trace.Types.Events.Name): TimelineRecordStyle|undefined {
  return maybeInitSylesMap()[eventName];
}

export function stringIsEventCategory(it: string): it is EventCategory {
  return (Object.values(EventCategory) as string[]).includes(it);
}

export function getCategoryStyles(): CategoryPalette {
  if (categoryStyles) {
    return categoryStyles;
  }
  categoryStyles = {
    loading: new TimelineCategory(
        EventCategory.LOADING, getLocalizedString(UIStrings.loading), true, '--app-color-loading-children',
        '--app-color-loading'),
    experience: new TimelineCategory(
        EventCategory.EXPERIENCE, getLocalizedString(UIStrings.experience), false, '--app-color-rendering-children',
        '--app-color-rendering'),
    messaging: new TimelineCategory(
        EventCategory.MESSAGING, getLocalizedString(UIStrings.messaging), true, '--app-color-messaging-children',
        '--app-color-messaging'),
    scripting: new TimelineCategory(
        EventCategory.SCRIPTING, getLocalizedString(UIStrings.scripting), true, '--app-color-scripting-children',
        '--app-color-scripting'),
    rendering: new TimelineCategory(
        EventCategory.RENDERING, getLocalizedString(UIStrings.rendering), true, '--app-color-rendering-children',
        '--app-color-rendering'),
    painting: new TimelineCategory(
        EventCategory.PAINTING, getLocalizedString(UIStrings.painting), true, '--app-color-painting-children',
        '--app-color-painting'),
    gpu: new TimelineCategory(
        EventCategory.GPU, getLocalizedString(UIStrings.gpu), false, '--app-color-painting-children', '--app-color-painting'),
    async: new TimelineCategory(
        EventCategory.ASYNC, getLocalizedString(UIStrings.async), false, '--app-color-async-children', '--app-color-async'),
    other: new TimelineCategory(
        EventCategory.OTHER, getLocalizedString(UIStrings.system), false, '--app-color-system-children', '--app-color-system'),
    idle: new TimelineCategory(
        EventCategory.IDLE, getLocalizedString(UIStrings.idle), false, '--app-color-idle-children', '--app-color-idle'),
    layout: new TimelineCategory(
        EventCategory.LAYOUT, getLocalizedString(UIStrings.layout), false, '--app-color-loading-children',
        '--app-color-loading'),
    rasterizing: new TimelineCategory(
        EventCategory.RASTERIZING, getLocalizedString(UIStrings.rasterizing), false, '--app-color-children',
        '--app-color-scripting'),
    drawing: new TimelineCategory(
        EventCategory.DRAWING, getLocalizedString(UIStrings.drawing), false, '--app-color-rendering-children',
        '--app-color-rendering'),
  };
  return categoryStyles;
}

export function maybeInitSylesMap(): EventStylesMap {
  if (eventStylesMap) {
    return eventStylesMap;
  }
  const defaultCategoryStyles = getCategoryStyles();

  eventStylesMap = {
    [Trace.Types.Events.Name.RUN_TASK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.task), defaultCategoryStyles.other),

    [Trace.Types.Events.Name.PROFILE_CALL]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.jsFrame), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.JS_SAMPLE]:
        new TimelineRecordStyle(Trace.Types.Events.Name.JS_SAMPLE, defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.PROGRAM]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.other), defaultCategoryStyles.other),

    [Trace.Types.Events.Name.START_PROFILING]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.profilingOverhead), defaultCategoryStyles.other),

    [Trace.Types.Events.Name.ANIMATION]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.animation), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.EVENT_DISPATCH]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.event), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.REQUEST_MAIN_THREAD_FRAME]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.requestMainThreadFrame),
        defaultCategoryStyles.rendering,
        true,
        ),

    [Trace.Types.Events.Name.BEGIN_FRAME]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.frameStart),
        defaultCategoryStyles.rendering,
        true,
        ),

    [Trace.Types.Events.Name.BEGIN_MAIN_THREAD_FRAME]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.frameStartMainThread),
        defaultCategoryStyles.rendering,
        true,
        ),

    [Trace.Types.Events.Name.DRAW_FRAME]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.drawFrame),
        defaultCategoryStyles.rendering,
        true,
        ),

    [Trace.Types.Events.Name.HIT_TEST]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.hitTest), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.SCHEDULE_STYLE_RECALCULATION]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.scheduleStyleRecalculation),
        defaultCategoryStyles.rendering,
        ),

    [Trace.Types.Events.Name.UPDATE_LAYOUT_TREE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.recalculateStyle), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.INVALIDATE_LAYOUT]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.invalidateLayout),
        defaultCategoryStyles.rendering,
        true,
        ),

    [Trace.Types.Events.Name.LAYERIZE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.layerize), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.LAYOUT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.layout), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.PAINT_SETUP]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.paintSetup), defaultCategoryStyles.painting),

    [Trace.Types.Events.Name.PAINT_IMAGE]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.paintImage),
        defaultCategoryStyles.painting,
        true,
        ),

    [Trace.Types.Events.Name.UPDATE_LAYER]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.updateLayer),
        defaultCategoryStyles.painting,
        true,
        ),

    [Trace.Types.Events.Name.UPDATE_LAYER_TREE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.updateLayerTree), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.PAINT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.paint), defaultCategoryStyles.painting),

    [Trace.Types.Events.Name.PRE_PAINT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.prePaint), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.RASTER_TASK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.rasterizePaint), defaultCategoryStyles.painting),

    [Trace.Types.Events.Name.SCROLL_LAYER]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.scroll), defaultCategoryStyles.rendering),

    [Trace.Types.Events.Name.COMMIT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.commit), defaultCategoryStyles.painting),

    [Trace.Types.Events.Name.COMPOSITE_LAYERS]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.compositeLayers), defaultCategoryStyles.painting),

    [Trace.Types.Events.Name.COMPUTE_INTERSECTION]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.computeIntersections),
        defaultCategoryStyles.rendering,
        ),

    [Trace.Types.Events.Name.PARSE_HTML]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.parseHtml), defaultCategoryStyles.loading),

    [Trace.Types.Events.Name.PARSE_AUTHOR_STYLE_SHEET]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.parseStylesheet), defaultCategoryStyles.loading),

    [Trace.Types.Events.Name.TIMER_INSTALL]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.installTimer), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.TIMER_REMOVE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.removeTimer), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.TIMER_FIRE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.timerFired), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.XHR_READY_STATE_CHANGED]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.xhrReadyStateChange),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.XHR_LOAD]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.xhrLoad), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.COMPILE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.compileScript), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CACHE_SCRIPT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.cacheScript), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.COMPILE_CODE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.compileCode), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.OPTIMIZE_CODE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.optimizeCode), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.EVALUATE_SCRIPT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.evaluateScript), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.COMPILE_MODULE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.compileModule), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CACHE_MODULE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.cacheModule), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.EVALUATE_MODULE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.evaluateModule), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.STREAMING_COMPILE_SCRIPT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.streamingCompileTask), defaultCategoryStyles.other),

    [Trace.Types.Events.Name.STREAMING_COMPILE_SCRIPT_WAITING]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.waitingForNetwork), defaultCategoryStyles.idle),

    [Trace.Types.Events.Name.STREAMING_COMPILE_SCRIPT_PARSING]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.parseAndCompile), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.BACKGROUND_DESERIALIZE]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.deserializeCodeCache),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.FINALIZE_DESERIALIZATION]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.profilingOverhead), defaultCategoryStyles.other),

    [Trace.Types.Events.Name.WASM_STREAM_FROM_RESPONSE_CALLBACK]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.streamingWasmResponse),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.WASM_COMPILED_MODULE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.compiledWasmModule), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.WASM_CACHED_MODULE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.cachedWasmModule), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.WASM_MODULE_CACHE_HIT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.wasmModuleCacheHit), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.WASM_MODULE_CACHE_INVALID]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.wasmModuleCacheInvalid),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.FRAME_STARTED_LOADING]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.frameStartedLoading),
        defaultCategoryStyles.loading,
        true,
        ),

    [Trace.Types.Events.Name.MARK_LOAD]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.onloadEvent),
        defaultCategoryStyles.scripting,
        true,
        ),

    [Trace.Types.Events.Name.MARK_DOM_CONTENT]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.domcontentloadedEvent),
        defaultCategoryStyles.scripting,
        true,
        ),

    [Trace.Types.Events.Name.MARK_FIRST_PAINT]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.firstPaint),
        defaultCategoryStyles.painting,
        true,
        ),

    [Trace.Types.Events.Name.MARK_FCP]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.firstContentfulPaint),
        defaultCategoryStyles.rendering,
        true,
        ),

    [Trace.Types.Events.Name.MARK_LCP_CANDIDATE]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.largestContentfulPaint),
        defaultCategoryStyles.rendering,
        true,
        ),

    [Trace.Types.Events.Name.TIME_STAMP]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.timestamp), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CONSOLE_TIME]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.consoleTime), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.USER_TIMING]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.userTiming), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.RESOURCE_WILL_SEND_REQUEST]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.willSendRequest), defaultCategoryStyles.loading),

    [Trace.Types.Events.Name.RESOURCE_SEND_REQUEST]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.sendRequest), defaultCategoryStyles.loading),

    [Trace.Types.Events.Name.RESOURCE_RECEIVE_RESPONSE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.receiveResponse), defaultCategoryStyles.loading),

    [Trace.Types.Events.Name.RESOURCE_FINISH]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.finishLoading), defaultCategoryStyles.loading),

    [Trace.Types.Events.Name.RESOURCE_RECEIVE_DATA]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.receiveData), defaultCategoryStyles.loading),

    [Trace.Types.Events.Name.RUN_MICROTASKS]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.runMicrotasks), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.FUNCTION_CALL]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.functionCall), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.GC]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.gcEvent), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.MAJOR_GC]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.majorGc), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.MINOR_GC]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.minorGc), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CPPGC_SWEEP]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.cppGc), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.REQUEST_ANIMATION_FRAME]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.requestAnimationFrame),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.CANCEL_ANIMATION_FRAME]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.cancelAnimationFrame),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.FIRE_ANIMATION_FRAME]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.animationFrameFired),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.REQUEST_IDLE_CALLBACK]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.requestIdleCallback),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.CANCEL_IDLE_CALLBACK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.cancelIdleCallback), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.FIRE_IDLE_CALLBACK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.fireIdleCallback), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.WEB_SOCKET_CREATE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.createWebsocket), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.WEB_SOCKET_SEND_HANDSHAKE_REQUEST]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.sendWebsocketHandshake),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.WEB_SOCKET_RECEIVE_HANDSHAKE_REQUEST]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.receiveWebsocketHandshake),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.WEB_SOCKET_DESTROY]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.destroyWebsocket), defaultCategoryStyles.scripting),
    [Trace.Types.Events.Name.WEB_SOCKET_SEND]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.wsMessageSent),
        defaultCategoryStyles.scripting,
        ),
    [Trace.Types.Events.Name.WEB_SOCKET_RECEIVE]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.wsMessageReceived),
        defaultCategoryStyles.scripting,
        ),

    [Trace.Types.Events.Name.EMBEDDER_CALLBACK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.embedderCallback), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.DECODE_IMAGE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.imageDecode), defaultCategoryStyles.painting),

    [Trace.Types.Events.Name.GPU_TASK]: new TimelineRecordStyle(getLocalizedString(UIStrings.gpu), defaultCategoryStyles.gpu),

    [Trace.Types.Events.Name.GC_COLLECT_GARBARGE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.domGc), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_ENCRYPT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.encrypt), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_ENCRYPT_REPLY]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.encryptReply), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_DECRYPT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.decrypt), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_DECRYPT_REPLY]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.decryptReply), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_DIGEST]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.digest), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_DIGEST_REPLY]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.digestReply), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_SIGN]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.sign), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_SIGN_REPLY]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.signReply), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_VERIFY]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.verify), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.CRYPTO_DO_VERIFY_REPLY]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.verifyReply), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.ASYNC_TASK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.asyncTask), defaultCategoryStyles.async),

    [Trace.Types.Events.Name.LAYOUT_SHIFT]: new TimelineRecordStyle(
        getLocalizedString(UIStrings.layoutShift), defaultCategoryStyles.experience,
        /* Mark LayoutShifts as hidden; in the timeline we render
        * SyntheticLayoutShifts so those are the ones visible to the user */
        true),

    [Trace.Types.Events.Name.SYNTHETIC_LAYOUT_SHIFT]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.layoutShift), defaultCategoryStyles.experience),

    [Trace.Types.Events.Name.SYNTHETIC_LAYOUT_SHIFT_CLUSTER]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.layoutShiftCluster), defaultCategoryStyles.experience),

    [Trace.Types.Events.Name.EVENT_TIMING]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.eventTiming), defaultCategoryStyles.experience),

    [Trace.Types.Events.Name.HANDLE_POST_MESSAGE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.onMessage), defaultCategoryStyles.messaging),

    [Trace.Types.Events.Name.SCHEDULE_POST_MESSAGE]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.schedulePostMessage), defaultCategoryStyles.messaging),

    [Trace.Types.Events.Name.SCHEDULE_POST_TASK_CALLBACK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.schedulePostTaskCallback), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.RUN_POST_TASK_CALLBACK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.runPostTaskCallback), defaultCategoryStyles.scripting),

    [Trace.Types.Events.Name.ABORT_POST_TASK_CALLBACK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.abortPostTaskCallback), defaultCategoryStyles.scripting),
    [Trace.Types.Events.Name.V8_CONSOLE_RUN_TASK]:
        new TimelineRecordStyle(getLocalizedString(UIStrings.consoleTaskRun), defaultCategoryStyles.scripting),
  };

  // TODO(crbug.com/410884528): remove assertion after deduped eventStylesMap for VISIBLE_TRACE_EVENT_TYPES.
  const visibleEventStyles =
      Object.entries(eventStylesMap).filter(([, style]) => style.hidden === false).map(([
                                                                                         key,
                                                                                       ]) => key);
  const visibleTraceEventsComplete = visibleEventStyles.every(eventType => {
    return Trace.Helpers.Trace.VISIBLE_TRACE_EVENT_TYPES.has(eventType as Trace.Types.Events.Name);
  });

  const eventStylesMapKeys = Object.keys(eventStylesMap) as Trace.Types.Events.Name[];
  const eventStylesComplete = Array.from(Trace.Helpers.Trace.VISIBLE_TRACE_EVENT_TYPES).every(eventType => {
    return eventStylesMapKeys.includes(eventType);
  });

  if (!visibleTraceEventsComplete || !eventStylesComplete) {
    throw new Error('eventStylesMap and VISIBLE_TRACE_EVENT_TYPES are out of sync!');
  }
  return eventStylesMap;
}

export function setEventStylesMap(eventStyles: EventStylesMap): void {
  eventStylesMap = eventStyles;
}

export function setCategories(cats: CategoryPalette): void {
  categoryStyles = cats;
}

export function visibleTypes(): string[] {
  const eventStyles = maybeInitSylesMap();
  const result = [];
  for (const name in eventStyles) {
    // Typescript cannot infer that `name` is a key of eventStyles
    const nameAsKey = name as keyof typeof eventStyles;
    if (!eventStyles[nameAsKey]?.hidden) {
      result.push(name);
    }
  }
  return result;
}

export function getTimelineMainEventCategories(): EventCategory[] {
  if (mainEventCategories) {
    return mainEventCategories;
  }
  mainEventCategories = [
    EventCategory.IDLE,
    EventCategory.LOADING,
    EventCategory.PAINTING,
    EventCategory.RENDERING,
    EventCategory.SCRIPTING,
    EventCategory.OTHER,
  ];
  return mainEventCategories;
}

export function setTimelineMainEventCategories(categories: EventCategory[]): void {
  mainEventCategories = categories;
}

export function markerDetailsForEvent(event: Trace.Types.Events.Event): {
  color: string,
  title: string,
} {
  let title = '';
  let color = 'var(--color-text-primary)';
  if (Trace.Types.Events.isFirstContentfulPaint(event)) {
    color = 'var(--sys-color-green-bright)';
    title = Trace.Handlers.ModelHandlers.PageLoadMetrics.MetricName.FCP;
  }
  if (Trace.Types.Events.isLargestContentfulPaintCandidate(event)) {
    color = 'var(--sys-color-green)';
    title = Trace.Handlers.ModelHandlers.PageLoadMetrics.MetricName.LCP;
  }
  if (Trace.Types.Events.isNavigationStart(event)) {
    color = 'var(--color-text-primary)';
    title = Trace.Handlers.ModelHandlers.PageLoadMetrics.MetricName.NAV;
  }
  if (Trace.Types.Events.isMarkDOMContent(event)) {
    color = 'var(--color-text-disabled)';
    title = Trace.Handlers.ModelHandlers.PageLoadMetrics.MetricName.DCL;
  }
  if (Trace.Types.Events.isMarkLoad(event)) {
    color = 'var(--color-text-disabled)';
    title = Trace.Handlers.ModelHandlers.PageLoadMetrics.MetricName.L;
  }
  return {color, title};
}
