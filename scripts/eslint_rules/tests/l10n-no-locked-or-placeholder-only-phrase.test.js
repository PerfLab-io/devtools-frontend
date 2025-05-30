// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const tsParser = require('@typescript-eslint/parser');

const rule = require('../lib/l10n-no-locked-or-placeholder-only-phrase.js');
const ruleTester = new (require('eslint').RuleTester)({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: tsParser,
  },
});

ruleTester.run('l10n-no-locked-or-placeholder-only-phrase', rule, {
  valid: [
    {
      code: 'const UIStrings = { foo: \'No locked part\' };',
    },
    {
      code: 'const UIStrings = { foo: \'Some `locked` part\' };',
    },
    {
      code: 'const UIStrings = { foo: \'One {PH} placeholder\' };',
    },
    {
      code: 'const UIStrings = { foo: \'{PH} two {PH} placeholders\' };',
    },
    {
      code: 'const variableNotNamedUIStrings = { foo: \'`whole phrase is locked`\' };',
    },
  ],
  invalid: [
    {
      code: 'const UIStrings = { foo: \'`whole phrase is locked`\'};',
      errors: [
        {
          message: 'Locking whole phrases is not allowed. Use i18n.i18n.lockedString instead.',
        },
      ],
    },
    {
      code: 'const UIStrings = { foo: \'{PH}\'};',
      errors: [
        {
          message: 'Single placeholder-only phrases are not allowed. Use i18n.i18n.lockedString instead.',
        },
      ],
    },
  ],
});
