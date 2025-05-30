// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const tsParser = require('@typescript-eslint/parser');

const rule = require('../lib/no-bound-component-methods.js');
const ruleTester = new (require('eslint').RuleTester)({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: tsParser,
  },
});

ruleTester.run('no-bound-component-methods', rule, {
  valid: [
    {
      code: `export class FeedbackButton extends SomeOtherNonElementThing {
  readonly #boundClick = this.onClick.bind(this);
}`,
      filename: 'front_end/components/test.ts',
    },
    {
      code: `export class FeedbackButton extends HTMLElement {
  readonly #boundRender = this.render.bind(this);
  private readonly shadow = this.attachShadow({mode: 'open'});
  private frame?: SDK.ResourceTreeModel.ResourceTreeFrame;
}`,
      filename: 'front_end/components/test.ts',
    },
    {
      code: `export class FeedbackButton extends HTMLElement {
  readonly #boundRender = this.render.bind(this);
  #globalBoundThing = this.someEvent.bind(this);
  private readonly shadow = this.attachShadow({mode: 'open'});

  constructor() {
    window.addEventListener('click', this.#globalBoundThing);
  }
}`,
      filename: 'front_end/components/test.ts',
    },
    {
      code: `export class FeedbackButton extends HTMLElement {
  readonly #boundRender = this.render.bind(this);
  private globalBoundThing = this.someEvent.bind(this);
  private readonly shadow = this.attachShadow({mode: 'open'});

  constructor() {
    window.addEventListener('click', this.globalBoundThing);
  }
}`,
      filename: 'front_end/components/test.ts',
    },
    {
      // Incomplete listener, treat it as valid to not cause noise to developer in the middle of them typing!
      code: `export class FeedbackButton extends HTMLElement {
  constructor() {
    window.addEventListener('click');
  }
}`,
      filename: 'front_end/components/test.ts',
    },
  ],
  invalid: [
    {
      code: `export class FeedbackButton extends HTMLElement {
  static readonly litTagName = Lit.literal\`devtools-feedback-button\`;
  readonly #boundRender = this.render.bind(this);
  readonly #boundClick = this.onClick.bind(this);
}`,
      filename: 'front_end/components/test.ts',
      errors: [
        {
          messageId: 'nonRenderBindFound',
          data: {componentName: 'FeedbackButton', methodName: 'onClick'},
        },
      ],
    },
    {
      code: `export class FeedbackButton extends HTMLElement {
  static readonly litTagName = Lit.literal\`devtools-feedback-button\`;
  private readonly boundClick = this.onClick.bind(this);
}`,
      filename: 'front_end/components/test.ts',
      errors: [
        {
          messageId: 'nonRenderBindFound',
          data: {componentName: 'FeedbackButton', methodName: 'onClick'},
        },
      ],
    },
    {
      code: `export class FeedbackButton extends HTMLElement {
  static readonly litTagName = Lit.literal\`devtools-feedback-button\`;
  private readonly boundClick = this.onClick.bind(this);
  private readonly boundFocus = this.onFocus.bind(this);

  constructor() {
    this.addEventListener('click', this.boundClick);
  }
}`,
      filename: 'front_end/components/test.ts',
      errors: [
        {
          messageId: 'nonRenderBindFound',
          data: {componentName: 'FeedbackButton', methodName: 'onFocus'},
        },
      ],
    },
  ],
});
