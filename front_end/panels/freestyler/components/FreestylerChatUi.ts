// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '../../../ui/components/spinners/spinners.js';
import './ProvideFeedback.js';

import * as Common from '../../../core/common/common.js';
import * as Host from '../../../core/host/host.js';
import * as i18n from '../../../core/i18n/i18n.js';
import type * as Platform from '../../../core/platform/platform.js';
import type * as SDK from '../../../core/sdk/sdk.js';
import * as Trace from '../../../models/trace/trace.js';
import type * as Workspace from '../../../models/workspace/workspace.js';
import * as Marked from '../../../third_party/marked/marked.js';
import * as Buttons from '../../../ui/components/buttons/buttons.js';
import type * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as MarkdownView from '../../../ui/components/markdown_view/markdown_view.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import {PanelUtils} from '../../utils/utils.js';
import {type ContextDetail, ErrorType} from '../AiAgent.js';

import freestylerChatUiStyles from './freestylerChatUi.css.js';
import type {ProvideFeedbackProps} from './ProvideFeedback.js';

const {html, Directives: {ifDefined}} = LitHtml;

const UIStrings = {
  /**
   * @description The error message when the user is not logged in into Chrome.
   */
  notLoggedIn: 'This feature is only available when you are signed into Chrome with your Google account',
  /**
   * @description Message shown when the user is offline.
   */
  offline: 'Check your internet connection and try again',
  /**
   *@description Disclaimer text right after the chat input.
   */
  inputDisclaimerForEmptyState: 'This is an experimental AI feature and won\'t always get it right.',
  /**
   * @description Text for a link to Chrome DevTools Settings.
   */
  settingsLink: 'AI assistance in Settings',
  /**
   * @description Placeholder text for an inactive text field. When active, it's used for the user's input to the GenAI assistance.
   */
  followTheSteps: 'Follow the steps above to ask a question',
  /**
   *@description Text for asking the user to turn the AI assistance feature in settings first before they are able to use it.
   *@example {AI assistance in Settings} PH1
   */
  turnOnForStyles: 'Turn on {PH1} to get help with understanding CSS styles',
  /**
   *@description Text for asking the user to turn the AI assistance feature in settings first before they are able to use it.
   *@example {AI assistance in Settings} PH1
   */
  turnOnForStylesAndRequests: 'Turn on {PH1} to get help with styles and network requests',
  /**
   *@description The footer disclaimer that links to more information about the AI feature.
   */
  learnAbout: 'Learn about AI in DevTools',
};

/*
* Strings that don't need to be translated at this time.
*/
const UIStringsNotTranslate = {
  /**
   *@description Disclaimer text right after the chat input.
   */
  inputDisclaimerForFreestylerAgent:
      'Chat messages and any data the inspected page can access via Web APIs are sent to Google and may be seen by human reviewers to improve this feature. This is an experimental AI feature and won’t always get it right.',
  /**
   *@description Disclaimer text right after the chat input.
   */
  inputDisclaimerForDrJonesNetworkAgent:
      'Chat messages and the selected network request are sent to Google and may be seen by human reviewers to improve this feature. This is an experimental AI feature and won’t always get it right.',
  /**
   *@description Disclaimer text right after the chat input.
   */
  inputDisclaimerForDrJonesFileAgent:
      'Chat messages and the selected file are sent to Google and may be seen by human reviewers to improve this feature. This is an experimental AI feature and won\'t always get it right.',
  /**
   *@description Disclaimer text right after the chat input.
   */
  inputDisclaimerForDrJonesPerformanceAgent:
      'Chat messages and the selected call stack are sent to Google and may be seen by human reviewers to improve this feature. This is an experimental AI feature and won\'t always get it right.',
  /**
   *@description Placeholder text for the chat UI input.
   */
  inputPlaceholderForFreestylerAgent: 'Ask a question about the selected element',
  /**
   *@description Placeholder text for the chat UI input.
   */
  inputPlaceholderForDrJonesNetworkAgent: 'Ask a question about the selected network request',
  /**
   *@description Placeholder text for the chat UI input.
   */
  inputPlaceholderForDrJonesFileAgent: 'Ask a question about the selected file',
  /**
   *@description Placeholder text for the chat UI input.
   */
  inputPlaceholderForDrJonesPerformanceAgent: 'Ask a question about the selected stack trace',
  /**
   *@description Title for the send icon button.
   */
  sendButtonTitle: 'Send',
  /**
   *@description Title for the cancel icon button.
   */
  cancelButtonTitle: 'Cancel',
  /**
   *@description Label for the "select an element" button.
   */
  selectAnElement: 'Select an element',
  /**
   *@description Label for the "select an element" button.
   */
  noElementSelected: 'No element selected',
  /**
   *@description Text for the empty state of the AI assistance panel.
   */
  emptyStateText: 'How can I help you?',
  /**
   * @description The error message when the LLM loop is stopped for some reason (Max steps reached or request to LLM failed)
   */
  systemError:
      'Something unforeseen happened and I can no longer continue. Try your request again and see if that resolves the issue.',
  /**
   * @description The error message when the LLM loop is stopped for some reason (Max steps reached or request to LLM failed)
   */
  maxStepsError: 'Seems like I am stuck with the investigation. It would be better if you start over.',
  /**
   *@description Displayed when the user stop the response
   */
  stoppedResponse: 'You stopped this response',
  /**
   * @description Prompt for user to confirm code execution that may affect the page.
   */
  sideEffectConfirmationDescription: 'This code may modify page content. Continue?',
  /**
   * @description Button text that confirm code execution that may affect the page.
   */
  positiveSideEffectConfirmation: 'Continue',
  /**
   * @description Button text that cancels code execution that may affect the page.
   */
  negativeSideEffectConfirmation: 'Cancel',
  /**
   *@description The generic name of the AI agent (do not translate)
   */
  ai: 'AI',
  /**
   *@description The fallback text when we can't find the user full name
   */
  you: 'You',
  /**
   *@description The fallback text when a step has no title yet
   */
  investigating: 'Investigating',
  /**
   *@description Prefix to the title of each thinking step of a user action is required to continue
   */
  paused: 'Paused',
  /**
   *@description Heading text for the code block that shows the executed code.
   */
  codeExecuted: 'Code executed',
  /**
   *@description Heading text for the code block that shows the code to be executed after side effect confirmation.
   */
  codeToExecute: 'Code to execute',
  /**
   *@description Heading text for the code block that shows the returned data.
   */
  dataReturned: 'Data returned',
  /**
   *@description Aria label for the check mark icon to be read by screen reader
   */
  completed: 'Completed',
  /**
   *@description Aria label for the loading icon to be read by screen reader
   */
  inProgress: 'In progress',
  /**
   *@description Aria label for the cancel icon to be read by screen reader
   */
  canceled: 'Canceled',
};

const str_ = i18n.i18n.registerUIStrings('panels/freestyler/components/FreestylerChatUi.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const lockedString = i18n.i18n.lockedString;

function getInputPlaceholderString(agentType: AgentType, state: State): Platform.UIString.LocalizedString {
  if (state === State.CONSENT_VIEW) {
    return i18nString(UIStrings.followTheSteps);
  }
  switch (agentType) {
    case AgentType.FREESTYLER:
      return lockedString(UIStringsNotTranslate.inputPlaceholderForFreestylerAgent);
    case AgentType.DRJONES_FILE:
      return lockedString(UIStringsNotTranslate.inputPlaceholderForDrJonesFileAgent);
    case AgentType.DRJONES_NETWORK_REQUEST:
      return lockedString(UIStringsNotTranslate.inputPlaceholderForDrJonesNetworkAgent);
    case AgentType.DRJONES_PERFORMANCE:
      return lockedString(UIStringsNotTranslate.inputPlaceholderForDrJonesPerformanceAgent);
  }
}

export interface Step {
  isLoading: boolean;
  thought?: string;
  title?: string;
  code?: string;
  output?: string;
  canceled?: boolean;
  sideEffect?: ConfirmSideEffectDialog;
  contextDetails?: [ContextDetail, ...ContextDetail[]];
}

interface ConfirmSideEffectDialog {
  onAnswer: (result: boolean) => void;
}

export const enum ChatMessageEntity {
  MODEL = 'model',
  USER = 'user',
}

export interface UserChatMessage {
  entity: ChatMessageEntity.USER;
  text: string;
}
export interface ModelChatMessage {
  entity: ChatMessageEntity.MODEL;
  steps: Step[];
  suggestions?: [string, ...string[]];
  answer?: string;
  error?: ErrorType;
  rpcId?: number;
}

export type ChatMessage = UserChatMessage|ModelChatMessage;

export const enum State {
  CONSENT_VIEW = 'consent-view',
  CHAT_VIEW = 'chat-view',
}

export const enum AgentType {
  FREESTYLER = 'freestyler',
  DRJONES_FILE = 'drjones-file',
  DRJONES_NETWORK_REQUEST = 'drjones-network-request',
  DRJONES_PERFORMANCE = 'drjones-performance',
}

export interface Props {
  onTextSubmit: (text: string) => void;
  onInspectElementClick: () => void;
  onFeedbackSubmit: (rpcId: number, rate: Host.AidaClient.Rating, feedback?: string) => void;
  onCancelClick: () => void;
  onSelectedNetworkRequestClick: () => void | Promise<void>;
  onSelectedFileRequestClick: () => void | Promise<void>;
  inspectElementToggled: boolean;
  state: State;
  aidaAvailability: Host.AidaClient.AidaAccessPreconditions;
  messages: ChatMessage[];
  selectedElement: SDK.DOMModel.DOMNode|null;
  selectedFile: Workspace.UISourceCode.UISourceCode|null;
  selectedNetworkRequest: SDK.NetworkRequest.NetworkRequest|null;
  selectedStackTrace: Trace.Helpers.TreeHelpers.TraceEntryNodeForAI|null;
  isLoading: boolean;
  canShowFeedbackForm: boolean;
  userInfo: Pick<Host.InspectorFrontendHostAPI.SyncInformation, 'accountImage'|'accountFullName'>;
  agentType: AgentType;
}

// The model returns multiline code blocks in an erroneous way with the language being in new line.
// This renderer takes that into account and correctly updates the parsed multiline token with the language
// correctly identified and stripped from the content.
// Example:
// ```
// css <-- This should have been on the first line.
// * {
//   color: red;
// }
// ```
class MarkdownRendererWithCodeBlock extends MarkdownView.MarkdownView.MarkdownInsightRenderer {
  override templateForToken(token: Marked.Marked.MarkedToken): LitHtml.TemplateResult|null {
    if (token.type === 'code') {
      const lines = (token.text as string).split('\n');
      if (lines[0]?.trim() === 'css') {
        token.lang = 'css';
        token.text = lines.slice(1).join('\n');
      }
    }

    return super.templateForToken(token);
  }
}

export class FreestylerChatUi extends HTMLElement {
  readonly #shadow = this.attachShadow({mode: 'open'});
  readonly #markdownRenderer = new MarkdownRendererWithCodeBlock();
  #scrollTop?: number;
  #props: Props;

  constructor(props: Props) {
    super();
    this.#props = props;
  }

  set props(props: Props) {
    this.#props = props;
    this.#render();
  }

  connectedCallback(): void {
    this.#shadow.adoptedStyleSheets = [freestylerChatUiStyles];
    this.#render();
  }

  focusTextInput(): void {
    const textArea = this.#shadow.querySelector('.chat-input') as HTMLTextAreaElement;
    if (!textArea) {
      return;
    }

    textArea.focus();
  }

  restoreScrollPosition(): void {
    if (this.#scrollTop === undefined) {
      return;
    }

    const scrollContainer = this.#shadow.querySelector('.messages-scroll-container') as HTMLElement;
    if (!scrollContainer) {
      return;
    }

    scrollContainer.scrollTop = this.#scrollTop;
  }

  scrollToLastMessage(): void {
    const message = this.#shadow.querySelector('.chat-message:last-child') as HTMLDivElement;
    if (!message) {
      return;
    }
    message.scrollIntoViewIfNeeded();
  }

  #setInputText(text: string): void {
    const textArea = this.#shadow.querySelector('.chat-input') as HTMLTextAreaElement;
    if (!textArea) {
      return;
    }

    textArea.value = text;
  }

  #isTextInputDisabled = (): boolean => {
    const isAidaAvailable = this.#props.aidaAvailability === Host.AidaClient.AidaAccessPreconditions.AVAILABLE;
    const isConsentView = this.#props.state === State.CONSENT_VIEW;
    const showsSideEffects = this.#props.messages.some(message => {
      return message.entity === ChatMessageEntity.MODEL && message.steps.some(step => {
        return Boolean(step.sideEffect);
      });
    });

    const isInputDisabledCheckForFreestylerAgent = !Boolean(this.#props.selectedElement) || showsSideEffects;
    const isInputDisabledCheckForDrJonesNetworkAgent = !Boolean(this.#props.selectedNetworkRequest);
    const isInputDisabledCheckForDrJonesFileAgent =
        !Boolean(this.#props.selectedFile) || !this.#props.selectedFile?.contentType().isTextType();

    return (this.#props.agentType === AgentType.FREESTYLER && isInputDisabledCheckForFreestylerAgent) ||
        (this.#props.agentType === AgentType.DRJONES_NETWORK_REQUEST && isInputDisabledCheckForDrJonesNetworkAgent) ||
        (this.#props.agentType === AgentType.DRJONES_FILE && isInputDisabledCheckForDrJonesFileAgent) ||
        !isAidaAvailable || isConsentView;
  };

  #handleScroll = (ev: Event): void => {
    if (!ev.target || !(ev.target instanceof HTMLElement)) {
      return;
    }

    this.#scrollTop = ev.target.scrollTop;
  };

  #handleSubmit = (ev: SubmitEvent): void => {
    ev.preventDefault();
    const textArea = this.#shadow.querySelector('.chat-input') as HTMLTextAreaElement;
    if (!textArea || !textArea.value) {
      return;
    }
    this.#props.onTextSubmit(textArea.value);
    textArea.value = '';
  };

  #handleTextAreaKeyDown = (ev: KeyboardEvent): void => {
    if (!ev.target || !(ev.target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (ev.key === 'Enter' && !ev.shiftKey) {
      // Do not go to a new line whenver Shift + Enter is pressed.
      ev.preventDefault();
      // Only submit the text when there isn't a request already in flight.
      if (!this.#props.isLoading) {
        this.#props.onTextSubmit(ev.target.value);
        ev.target.value = '';
      }
    }
  };

  #handleCancel = (ev: SubmitEvent): void => {
    ev.preventDefault();

    if (!this.#props.isLoading) {
      return;
    }

    this.#props.onCancelClick();
  };

  #handleSuggestionClick = (suggestion: string): void => {
    this.#setInputText(suggestion);
    this.focusTextInput();
  };

  #renderRateButtons(rpcId: number): LitHtml.TemplateResult {
    // clang-format off
    return html`<devtools-provide-feedback
      .props=${{
        onFeedbackSubmit: (rating, feedback) => {
          this.#props.onFeedbackSubmit(rpcId, rating, feedback);
        },
        canShowFeedbackForm: this.#props.canShowFeedbackForm,
      } as ProvideFeedbackProps}
      ></devtools-provide-feedback>`;
    // clang-format on
  }

  #renderTextAsMarkdown(text: string): LitHtml.TemplateResult {
    let tokens = [];
    try {
      tokens = Marked.Marked.lexer(text);
      for (const token of tokens) {
        // Try to render all the tokens to make sure that
        // they all have a template defined for them. If there
        // isn't any template defined for a token, we'll fallback
        // to rendering the text as plain text instead of markdown.
        this.#markdownRenderer.renderToken(token);
      }
    } catch (err) {
      // The tokens were not parsed correctly or
      // one of the tokens are not supported, so we
      // continue to render this as text.
      return html`${text}`;
    }

    // clang-format off
    return html`<devtools-markdown-view
      .data=${{tokens, renderer: this.#markdownRenderer} as MarkdownView.MarkdownView.MarkdownViewData}>
    </devtools-markdown-view>`;
    // clang-format on
  }

  #renderTitle(step: Step): LitHtml.LitTemplate {
    const paused = step.sideEffect ? html`<span class="paused">${lockedString(UIStringsNotTranslate.paused)}: </span>` :
                                     LitHtml.nothing;
    const actionTitle = step.title ?? `${lockedString(UIStringsNotTranslate.investigating)}…`;

    return html`<span class="title">${paused}${actionTitle}</span>`;
  }

  #renderStepCode(step: Step): LitHtml.LitTemplate {
    if (!step.code && !step.output) {
      return LitHtml.nothing;
    }

    // If there is no "output" yet, it means we didn't execute the code yet (e.g. maybe it is still waiting for confirmation from the user)
    // thus we show "Code to execute" text rather than "Code executed" text on the heading of the code block.
    const codeHeadingText = (step.output && !step.canceled) ? lockedString(UIStringsNotTranslate.codeExecuted) :
                                                              lockedString(UIStringsNotTranslate.codeToExecute);

    // If there is output, we don't show notice on this code block and instead show
    // it in the data returned code block.
    // clang-format off
    const code = step.code ? html`<div class="action-result">
        <devtools-code-block
          .code=${step.code.trim()}
          .codeLang=${'js'}
          .displayNotice=${!Boolean(step.output)}
          .header=${codeHeadingText}
          .showCopyButton=${true}
        ></devtools-code-block>
    </div>` :
                             LitHtml.nothing;
    const output = step.output ? html`<div class="js-code-output">
      <devtools-code-block
        .code=${step.output}
        .codeLang=${'js'}
        .displayNotice=${true}
        .header=${lockedString(UIStringsNotTranslate.dataReturned)}
        .showCopyButton=${false}
      ></devtools-code-block>
    </div>` :
                                 LitHtml.nothing;

    return html`<div class="step-code">${code}${output}</div>`;
    // clang-format on
  }

  #renderStepDetails(step: Step, options: {isLast: boolean}): LitHtml.LitTemplate {
    const sideEffects =
        options.isLast && step.sideEffect ? this.#renderSideEffectConfirmationUi(step) : LitHtml.nothing;
    const thought = step.thought ? html`<p>${this.#renderTextAsMarkdown(step.thought)}</p>` : LitHtml.nothing;

    // clang-format off
    const contextDetails = step.contextDetails ?
    html`${LitHtml.Directives.repeat(
      step.contextDetails,
        contextDetail => {
          return html`<div class="context-details">
        <devtools-code-block
          .code=${contextDetail.text}
          .codeLang=${contextDetail.codeLang || ''}
          .displayNotice=${false}
          .header=${contextDetail.title}
          .showCopyButton=${true}
        ></devtools-code-block>
      </div>`;
        },
      )}` : LitHtml.nothing;

    return html`<div class="step-details">
      ${thought}
      ${this.#renderStepCode(step)}
      ${sideEffects}
      ${contextDetails}
    </div>`;
    // clang-format on
  }

  #renderStepBadge(step: Step, options: {isLast: boolean}): LitHtml.LitTemplate {
    if (this.#props.isLoading && options.isLast && !step.sideEffect) {
      return html`<devtools-spinner></devtools-spinner>`;
    }

    let iconName: string = 'checkmark';
    let ariaLabel: string|undefined = lockedString(UIStringsNotTranslate.completed);
    let role: 'button'|undefined = 'button';
    if (options.isLast && step.sideEffect) {
      role = undefined;
      ariaLabel = undefined;
      iconName = 'pause-circle';
    } else if (step.canceled) {
      ariaLabel = lockedString(UIStringsNotTranslate.canceled);
      iconName = 'cross';
    }

    return html`<devtools-icon
        class="indicator"
        role=${ifDefined(role)}
        aria-label=${ifDefined(ariaLabel)}
        .name=${iconName}
      ></devtools-icon>`;
  }

  #renderStep(step: Step, options: {isLast: boolean}): LitHtml.LitTemplate {
    const stepClasses = LitHtml.Directives.classMap({
      step: true,
      empty: !step.thought && !step.code && !step.contextDetails,
      paused: Boolean(step.sideEffect),
      canceled: Boolean(step.canceled),
    });
    // clang-format off
    return html`
      <details class=${stepClasses}
        jslog=${VisualLogging.section('step')}
        .open=${Boolean(step.sideEffect)}>
        <summary>
          <div class="summary">
            ${this.#renderStepBadge(step, options)}
            ${this.#renderTitle(step)}
            <devtools-icon
              class="arrow"
              .name=${'chevron-down'}
            ></devtools-icon>
          </div>
        </summary>
        ${this.#renderStepDetails(step, {
          isLast: options.isLast,
        })}
      </details>`;
    // clang-format on
  }

  #renderSideEffectConfirmationUi(step: Step): LitHtml.LitTemplate {
    if (!step.sideEffect) {
      return LitHtml.nothing;
    }
    const sideEffectAction = step.sideEffect.onAnswer;

    // clang-format off
    return html`<div
      class="side-effect-confirmation"
      jslog=${VisualLogging.section('side-effect-confirmation')}
    >
      <p>${lockedString(UIStringsNotTranslate.sideEffectConfirmationDescription)}</p>
      <div class="side-effect-buttons-container">
        <devtools-button
          .data=${
            {
              variant: Buttons.Button.Variant.OUTLINED,
              jslogContext: 'decline-execute-code',
            } as Buttons.Button.ButtonData
          }
          @click=${() => sideEffectAction(false)}
        >${lockedString(
          UIStringsNotTranslate.negativeSideEffectConfirmation,
        )}</devtools-button>
        <devtools-button
          .data=${
            {
              variant: Buttons.Button.Variant.PRIMARY,
              jslogContext: 'accept-execute-code',
              iconName: 'play',
            } as Buttons.Button.ButtonData
          }
          @click=${() => sideEffectAction(true)}
        >${
            lockedString(UIStringsNotTranslate.positiveSideEffectConfirmation)
        }</devtools-button>
      </div>
    </div>`;
    // clang-format on
  }

  #renderError(message: ModelChatMessage): LitHtml.LitTemplate {
    if (message.error) {
      let errorMessage;
      switch (message.error) {
        case ErrorType.UNKNOWN:
          errorMessage = UIStringsNotTranslate.systemError;
          break;
        case ErrorType.MAX_STEPS:
          errorMessage = UIStringsNotTranslate.maxStepsError;
          break;
        case ErrorType.ABORT:
          return html`<p class="aborted" jslog=${VisualLogging.section('aborted')}>${
              lockedString(UIStringsNotTranslate.stoppedResponse)}</p>`;
      }

      return html`<p class="error" jslog=${VisualLogging.section('error')}>${lockedString(errorMessage)}</p>`;
    }

    return LitHtml.nothing;
  }

  #renderChatMessage = (message: ChatMessage, {isLast}: {isLast: boolean}): LitHtml.TemplateResult => {
    if (message.entity === ChatMessageEntity.USER) {
      const name = this.#props.userInfo.accountFullName || lockedString(UIStringsNotTranslate.you);
      const image = this.#props.userInfo.accountImage ?
          html`<img src="data:image/png;base64, ${this.#props.userInfo.accountImage}" alt="Account avatar" />` :
          html`<devtools-icon
            .name=${'profile'}
          ></devtools-icon>`;
      // clang-format off
      return html`<section
        class="chat-message query"
        jslog=${VisualLogging.section('question')}
      >
        <div class="message-info">
          ${image}
          <div class="message-name">
            <h2>${name}</h2>
          </div>
        </div>
        <div class="message-content">${this.#renderTextAsMarkdown(message.text)}</div>
      </section>`;
      // clang-format on
    }

    const shouldShowSuggestions = (isLast && !this.#props.isLoading && message.suggestions);
    // clang-format off
    return html`
      <section class="chat-message answer" jslog=${VisualLogging.section('answer')}>
        <div class="message-info">
          <devtools-icon
            name="smart-assistant"
          ></devtools-icon>
          <div class="message-name">
            <h2>${lockedString(UIStringsNotTranslate.ai)}</h2>
          </div>
        </div>
        ${LitHtml.Directives.repeat(
          message.steps,
          (_, index) => index,
          step => {
            return this.#renderStep(step, {
              isLast: [...message.steps.values()].at(-1) === step && isLast,
            });
          },
        )}
        ${
          message.answer
            ? html`<p>${this.#renderTextAsMarkdown(message.answer)}</p>`
            : LitHtml.nothing
        }
        ${this.#renderError(message)}
        <div class="actions">
          ${
            message.rpcId !== undefined
              ? this.#renderRateButtons(message.rpcId)
              : LitHtml.nothing
          }
          ${shouldShowSuggestions ?
            html`<div class="suggestions">
              ${message.suggestions?.map(suggestion => html`<devtools-button
                  .data=${{
                      variant: Buttons.Button.Variant.OUTLINED,
                      title: suggestion,
                      jslogContext: 'suggestion',
                  } as Buttons.Button.ButtonData}
                  @click=${() => this.#handleSuggestionClick(suggestion)}
                >${suggestion}</devtools-button>`)}
            </div>` : LitHtml.nothing}
        </div>
      </section>
    `;
    // clang-format on
  };

  #renderSelection(): LitHtml.TemplateResult {
    switch (this.#props.agentType) {
      case AgentType.FREESTYLER:
        return this.#renderSelectAnElement();
      case AgentType.DRJONES_FILE:
        return this.#renderSelectedFileName();
      case AgentType.DRJONES_NETWORK_REQUEST:
        return this.#renderSelectedNetworkRequest();
      case AgentType.DRJONES_PERFORMANCE:
        return this.#renderSelectedTask();
    }
  }

  #renderSelectedFileName(): LitHtml.TemplateResult {
    const resourceClass = LitHtml.Directives.classMap({
      'not-selected': !this.#props.selectedFile,
      'resource-link': true,
    });

    if (!this.#props.selectedFile) {
      return html`${LitHtml.nothing}`;
    }

    const icon = PanelUtils.getIconForSourceFile(this.#props.selectedFile);

    // clang-format off
    return html`<div class="select-element">
    <div role=button class=${resourceClass}
    @click=${this.#props.onSelectedFileRequestClick}>
      ${icon}${this.#props.selectedFile?.displayName()}
    </div></div>`;
    // clang-format on
  }

  #renderSelectedNetworkRequest = (): LitHtml.TemplateResult => {
    const resourceClass = LitHtml.Directives.classMap({
      'not-selected': !this.#props.selectedNetworkRequest,
      'resource-link': true,
    });

    if (!this.#props.selectedNetworkRequest) {
      return html`${LitHtml.nothing}`;
    }

    const icon = PanelUtils.getIconForNetworkRequest(this.#props.selectedNetworkRequest);
    // clang-format off
    return html`<div class="select-element">
    <div role=button class=${resourceClass}
    @click=${this.#props.onSelectedNetworkRequestClick}>
      ${icon}${this.#props.selectedNetworkRequest?.name()}
    </div></div>`;
    // clang-format on
  };

  #renderSelectAnElement = (): LitHtml.TemplateResult => {
    const resourceClass = LitHtml.Directives.classMap({
      'not-selected': !this.#props.selectedElement,
      'resource-link': true,
    });

    // clang-format off
    return html`
      <div class="select-element">
        <devtools-button
          .data=${{
              variant: Buttons.Button.Variant.ICON_TOGGLE,
              size: Buttons.Button.Size.REGULAR,
              iconName: 'select-element',
              toggledIconName: 'select-element',
              toggleType: Buttons.Button.ToggleType.PRIMARY,
              toggled: this.#props.inspectElementToggled,
              title: lockedString(UIStringsNotTranslate.selectAnElement),
              jslogContext: 'select-element',
          } as Buttons.Button.ButtonData}
          @click=${this.#props.onInspectElementClick}
        ></devtools-button>
        <div class=${resourceClass}>${
          this.#props.selectedElement
            ? LitHtml.Directives.until(
                  Common.Linkifier.Linkifier.linkify(this.#props.selectedElement),
                )
            : html`<span>${
              lockedString(UIStringsNotTranslate.noElementSelected)
            }</span>`
        }</div>
      </div>`;
    // clang-format on
  };

  #renderSelectedTask = (): LitHtml.TemplateResult => {
    const resourceClass = LitHtml.Directives.classMap({
      'not-selected': !this.#props.selectedStackTrace,
      'resource-task': true,
    });

    if (!this.#props.selectedStackTrace) {
      return html`${LitHtml.nothing}`;
    }

    const selectedNode = Trace.Helpers.TreeHelpers.TraceEntryNodeForAI.getSelectedNodeForTraceEntryTreeForAI(
        this.#props.selectedStackTrace);

    if (!selectedNode) {
      return html`${LitHtml.nothing}`;
    }

    let displayName = selectedNode.type;
    if (selectedNode.type === 'ProfileCall' && selectedNode.function) {
      displayName = selectedNode.function;
    }

    const iconData = {
      iconName: 'performance',
      color: 'var(--sys-color-on-surface-subtle)',
    };
    const icon = PanelUtils.createIconElement(iconData, 'Performance');
    icon.classList.add('icon');

    // TODO(b/371118936): Make the div clickable
    // clang-format off
    return html`<div class="select-element">
    <div class=${resourceClass}>
      ${icon}${displayName}
    </div></div>`;
    // clang-format on
  };

  #renderMessages = (): LitHtml.TemplateResult => {
    // clang-format off
    return html`
      <div class="messages-scroll-container" @scroll=${this.#handleScroll}>
        <div class="messages-container">
          ${this.#props.messages.map((message, _, array) =>
            this.#renderChatMessage(message, {
              isLast: array.at(-1) === message,
            }),
          )}
        </div>
      </div>
    `;
    // clang-format on
  };

  #renderEmptyState = (): LitHtml.TemplateResult => {
    const suggestions = this.#getEmptyStateSuggestions();

    // clang-format off
    return html`<div class="empty-state-container messages-scroll-container">
      <div class="header">
        <div class="icon">
          <devtools-icon
            name="smart-assistant"
          ></devtools-icon>
        </div>
        <h1>${lockedString(UIStringsNotTranslate.emptyStateText)}</h1>
      </div>
      <div class="suggestions">
        ${suggestions.map(suggestion => {
          return html`<devtools-button
            class="suggestion"
            @click=${() => this.#handleSuggestionClick(suggestion)}
            .data=${
              {
                variant: Buttons.Button.Variant.OUTLINED,
                size: Buttons.Button.Size.REGULAR,
                title: suggestion,
                jslogContext: 'suggestion',
                disabled: this.#isTextInputDisabled(),
              } as Buttons.Button.ButtonData
            }
          >${suggestion}</devtools-button>`;
        })}
      </div>
    </div>`;
    // clang-format on
  };

  #getEmptyStateSuggestions = (): string[] => {
    switch (this.#props.agentType) {
      case AgentType.FREESTYLER:
        return [
          'What can you help me with?',
          'Why isn’t this element visible?',
          'How do I center this element?',
        ];
      case AgentType.DRJONES_FILE:
        return [
          'What are the key functions in this file and what are they doing?',
        ];
      case AgentType.DRJONES_NETWORK_REQUEST:
        return [
          'Why is this network request taking longer to complete?',
        ];
      case AgentType.DRJONES_PERFORMANCE:
        return [
          'Is this item on the critical rendering path?',
        ];
    }
  };

  #renderChatInput = (): LitHtml.TemplateResult => {
    // clang-format off
    return html`
      <div class="chat-input-container">
        <textarea class="chat-input"
          .disabled=${this.#isTextInputDisabled()}
          wrap="hard"
          @keydown=${this.#handleTextAreaKeyDown}
          placeholder=${getInputPlaceholderString(this.#props.agentType, this.#props.state)}
          jslog=${VisualLogging.textField('query').track({ keydown: 'Enter' })}></textarea>
          ${this.#props.isLoading
            ? html`<devtools-button
              class="chat-input-button"
              aria-label=${lockedString(UIStringsNotTranslate.cancelButtonTitle)}
              @click=${this.#handleCancel}
              .data=${
                {
                  variant: Buttons.Button.Variant.ICON,
                  size: Buttons.Button.Size.REGULAR,
                  disabled: this.#isTextInputDisabled(),
                  iconName: 'record-stop',
                  title: lockedString(UIStringsNotTranslate.cancelButtonTitle),
                  jslogContext: 'stop',
                } as Buttons.Button.ButtonData
              }
            ></devtools-button>`
            : html`<devtools-button
              class="chat-input-button"
              aria-label=${lockedString(UIStringsNotTranslate.sendButtonTitle)}
              .data=${
                {
                  type: 'submit',
                  variant: Buttons.Button.Variant.ICON,
                  size: Buttons.Button.Size.REGULAR,
                  disabled: this.#isTextInputDisabled(),
                  iconName: 'send',
                  title: lockedString(UIStringsNotTranslate.sendButtonTitle),
                  jslogContext: 'send',
                } as Buttons.Button.ButtonData
              }
            ></devtools-button>`}
      </div>`;
    // clang-format on
  };

  #getDisclaimerText = (): Platform.UIString.LocalizedString => {
    if (this.#props.state === State.CONSENT_VIEW) {
      return i18nString(UIStrings.inputDisclaimerForEmptyState);
    }
    switch (this.#props.agentType) {
      case AgentType.FREESTYLER:
        return lockedString(UIStringsNotTranslate.inputDisclaimerForFreestylerAgent);
      case AgentType.DRJONES_FILE:
        return lockedString(UIStringsNotTranslate.inputDisclaimerForDrJonesFileAgent);
      case AgentType.DRJONES_NETWORK_REQUEST:
        return lockedString(UIStringsNotTranslate.inputDisclaimerForDrJonesNetworkAgent);
      case AgentType.DRJONES_PERFORMANCE:
        return lockedString(UIStringsNotTranslate.inputDisclaimerForDrJonesPerformanceAgent);
    }
  };

  #getConsentViewContents(): LitHtml.TemplateResult {
    const settingsLink = document.createElement('button');
    settingsLink.textContent = i18nString(UIStrings.settingsLink);
    settingsLink.classList.add('link');
    UI.ARIAUtils.markAsLink(settingsLink);
    settingsLink.addEventListener('click', () => {
      void UI.ViewManager.ViewManager.instance().showView('chrome-ai');
    });
    settingsLink.setAttribute('jslog', `${VisualLogging.action('open-ai-settings').track({click: true})}`);
    const config = Common.Settings.Settings.instance().getHostConfig();
    return html`${
        config.devToolsExplainThisResourceDogfood?.enabled ?
            i18n.i18n.getFormatLocalizedString(str_, UIStrings.turnOnForStylesAndRequests, {PH1: settingsLink}) :
            i18n.i18n.getFormatLocalizedString(str_, UIStrings.turnOnForStyles, {PH1: settingsLink})}`;
  }

  #getUnavailableAidaAvailabilityContents(
      aidaAvailability:
          Exclude<Host.AidaClient.AidaAccessPreconditions, Host.AidaClient.AidaAccessPreconditions.AVAILABLE>):
      LitHtml.TemplateResult {
    switch (aidaAvailability) {
      case Host.AidaClient.AidaAccessPreconditions.NO_ACCOUNT_EMAIL:
      case Host.AidaClient.AidaAccessPreconditions.SYNC_IS_PAUSED: {
        return html`${i18nString(UIStrings.notLoggedIn)}`;
      }
      case Host.AidaClient.AidaAccessPreconditions.NO_INTERNET: {
        return html`${i18nString(UIStrings.offline)}`;
      }
    }
  }

  #renderDisabledState(contents: LitHtml.TemplateResult): LitHtml.TemplateResult {
    // clang-format off
    return html`
      <div class="empty-state-container messages-scroll-container">
        <div class="disabled-view">
          <div class="disabled-view-icon-container">
            <devtools-icon .data=${{
              iconName: 'smart-assistant',
              width: 'var(--sys-size-8)',
              height: 'var(--sys-size-8)',
            } as IconButton.Icon.IconData}>
            </devtools-icon>
          </div>
          <div>
            ${contents}
          </div>
        </div>
      </div>
    `;
    // clang-format on
  }

  #renderMainContents(): LitHtml.TemplateResult {
    if (this.#props.state === State.CONSENT_VIEW) {
      return this.#renderDisabledState(this.#getConsentViewContents());
    }

    if (this.#props.aidaAvailability !== Host.AidaClient.AidaAccessPreconditions.AVAILABLE) {
      return this.#renderDisabledState(this.#getUnavailableAidaAvailabilityContents(this.#props.aidaAvailability));
    }

    if (this.#props.messages.length > 0) {
      return this.#renderMessages();
    }

    return this.#renderEmptyState();
  }

  #render(): void {
    // clang-format off
    LitHtml.render(html`
      <div class="chat-ui">
        <main>
          ${this.#renderMainContents()}
          <form class="input-form" @submit=${this.#handleSubmit}>
            ${this.#props.state !== State.CONSENT_VIEW ? html`
              <div class="input-header">
                <div class="header-link-container">
                  ${this.#renderSelection()}
                </div>
              </div>
            ` : LitHtml.nothing}
            ${this.#renderChatInput()}
          </form>
        </main>
        <footer class="disclaimer">
          <p class="disclaimer-text">
            ${this.#getDisclaimerText()}
            <x-link
              class="link"
              jslog=${VisualLogging.link('open-ai-settings').track({
                click: true,
              })}
              @click=${(event: Event) => {
                event.preventDefault();
                void UI.ViewManager.ViewManager.instance().showView(
                  'chrome-ai',
                );
              }}
            >${i18nString(UIStrings.learnAbout)}</x-link>
          </p>
        </footer>
      </div>
    `, this.#shadow, {host: this});
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'devtools-freestyler-chat-ui': FreestylerChatUi;
  }
}

export const FOR_TEST = {
  MarkdownRendererWithCodeBlock,
};

customElements.define('devtools-freestyler-chat-ui', FreestylerChatUi);
