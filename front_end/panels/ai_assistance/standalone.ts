import * as Trace from '../../models/trace/trace.js';
import { completeURL, nameForEntry } from '../timeline/utils/EntryName.js';
import * as TimelineUtils from '../timeline/utils/utils.js';

/**
 * Preamble clocks in at ~950 tokens.
 *   The prose is around 4.5 chars per token.
 * The data can be as bad as 1.8 chars per token
 *
 * Check token length in https://aistudio.google.com/
 */
export const preamble = `You are a performance expert.
You specialize in analyzing web application behavior captured by Chrome DevTools Performance Panel and Chrome tracing.
You will be provided a text representation of a call tree of native and JavaScript callframes selected by the user from a performance trace's flame chart.
This tree originates from the root task of a specific callframe.

The format of each callframe is:

    Node: $id – $name
    Selected: true
    dur: $duration
    self: $self
    URL #: $url_number
    Children:
      * $child.id – $child.name

The fields are:

* name:  A short string naming the callframe (e.g. 'Evaluate Script' or the JS function name 'InitializeApp')
* id:  A numerical identifier for the callframe
* Selected:  Set to true if this callframe is the one the user wants analyzed.
* url_number:  The number of the URL referenced in the "All URLs" list
* dur:  The total duration of the callframe (includes time spent in its descendants), in milliseconds.
* self:  The self duration of the callframe (excludes time spent in its descendants), in milliseconds. If omitted, assume the value is 0.
* children:  An list of child callframes, each denoted by their id and name

Your task is to analyze this callframe and its surrounding context within the performance recording. Your analysis may include:
* Clearly state the name and purpose of the selected callframe based on its properties (e.g., name, URL). Explain what the task is broadly doing.
* Describe its execution context:
  * Ancestors: Trace back through the tree to identify the chain of parent callframes that led to the execution of the selected callframe. Describe this execution path.
  * Descendants:  Analyze the children of the selected callframe. What tasks did it initiate? Did it spawn any long-running or resource-intensive sub-tasks?
* Quantify performance:
    * Duration
    * Relative Cost:  How much did this callframe contribute to the overall duration of its parent tasks and the entire recorded trace?
    * Potential Bottlenecks: Analyze the total and self duration of the selected callframe and its children to identify any potential performance bottlenecks. Are there any excessively long tasks or periods of idle time?
4. Based on your analysis, provide specific and actionable suggestions for improving the performance of the selected callframe and its related tasks.  Are there any resources being acquired or held for longer than necessary? Only provide if you have specific suggestions.

# Considerations
* Keep your analysis concise and focused, highlighting only the most critical aspects for a software engineer.
* Do not mention id of the callframe or the URL number in your response.

## Example session

All URL #s:

* 0 – app.js

Call tree:

Node: 1 – main
dur: 500
self: 100
Children:
  * 2 – update

Node: 2 – update
dur: 200
self: 50
Children:
  * 3 – animate

Node: 3 – animate
Selected: true
dur: 150
self: 20
URL #: 0
Children:
  * 4 – calculatePosition
  * 5 – applyStyles

Node: 4 – calculatePosition
dur: 80
self: 80

Node: 5 – applyStyles
dur: 50
self: 50

Explain the selected task.


The relevant event is an animate function, which is responsible for animating elements on the page.
This function took a total of 150ms to execute, but only 20ms of that time was spent within the animate function itself.
The remaining 130ms were spent in its child functions, calculatePosition and applyStyles.
It seems like a significant portion of the animation time is spent calculating the position of the elements.
Perhaps there's room for optimization there. You could investigate whether the calculatePosition function can be made more efficient or if the number of calculations can be reduced.
`;

export abstract class StandaloneConversationContext<T> {
  abstract getOrigin(): string;
  abstract getItem(): T;
  abstract getIcon(): HTMLElement;
  abstract getTitle(): string;

  isOriginAllowed(agentOrigin: string|undefined): boolean {
    if (!agentOrigin) {
      return true;
    }
    // Currently does not handle opaque origins because they
    // are not available to DevTools, instead checks
    // that serialization of the origin is the same
    // https://html.spec.whatwg.org/#ascii-serialisation-of-an-origin.
    return this.getOrigin() === agentOrigin;
  }

  /**
   * This method is called at the start of `AiAgent.run`.
   * It will be overridden in subclasses to fetch data related to the context item.
   */
  async refresh(): Promise<void> {
    return;
  }
}

export class StandaloneCallTreeContext extends StandaloneConversationContext<TimelineUtils.AICallTree.AICallTree> {
  #callTree: TimelineUtils.AICallTree.AICallTree;

  constructor(callTree: TimelineUtils.AICallTree.AICallTree) {
    super();
    this.#callTree = callTree;
  }

  override getOrigin(): string {
    const selectedEvent = this.#callTree.selectedNode?.event;
    if (!selectedEvent) {
      return 'unknown';
    }
    // Get the non-resolved (ignore sourcemaps) URL for the event. We use the
    // non-resolved URL as in the context of the AI Assistance panel, we care
    // about the origin it was served on.
    const nonResolvedURL = Trace.Handlers.Helpers.getNonResolvedURL(selectedEvent, this.#callTree.parsedTrace);
    if (nonResolvedURL) {
      const url = completeURL(nonResolvedURL.toString());
      const origin = url.isValid ? url.securityOrigin() : '';
      if (origin) {  // origin could be the empty string.
        return origin;
      }
    }
    // Generate a random "origin". We do this rather than return an empty
    // string or some "unknown" string so that each event without a definite
    // URL is considered a new, standalone origin. This is safer from a privacy
    // & security perspective, else we risk bucketing events together that
    // should not be. We also don't want to make it entirely random so we
    // cannot calculate it deterministically.
    const uuid = `${selectedEvent.name}_${selectedEvent.pid}_${selectedEvent.tid}_${selectedEvent.ts}`;
    return uuid;
  }

  override getItem(): TimelineUtils.AICallTree.AICallTree {
    return this.#callTree;
  }

  override getIcon(): HTMLElement {
    return document.createElement('div');
  }

  override getTitle(): string {
    const {event} = this.#callTree.selectedNode ?? {};
    if (!event) {
      return 'unknown';
    }

    return nameForEntry(event);
  }
}
