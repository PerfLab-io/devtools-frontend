// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as i18n from '../../core/i18n/i18n.js';
import * as i18nRaw from '../../third_party/i18n/i18n.js';

import * as LitHtml from './lit-html.js';

const {html} = LitHtml;

const templateArray = (value: string[]) => {
  // We assume here it's okay to lose the `raw` value from the TemplateStringsArray
  // for the purposes of testing.
  return value as unknown as TemplateStringsArray;
};

describe('Static', () => {
  describe('flattenTemplate', () => {
    it('does not flatten template strings with no statics or values', () => {
      const content = LitHtml.flattenTemplate`No update needed`;
      assert.deepEqual(content.strings, templateArray(['No update needed']));
      assert.deepEqual(content.valueMap, []);
    });

    it('does not flatten template strings with just values', () => {
      const content = LitHtml.flattenTemplate`Just ${1} value`;
      assert.deepEqual(content.strings, templateArray(['Just ', ' value']));
      assert.deepEqual(content.valueMap, [true]);
    });

    it('does flatten template strings with statics', () => {
      const tag = LitHtml.literal`div`;
      const content = LitHtml.flattenTemplate`<${tag}>Foo</${tag}>`;
      assert.deepEqual(content.strings, templateArray(['<div>Foo</div>']));
      assert.deepEqual(content.valueMap, [false, false]);
    });

    it('does flatten template strings with statics but leaves values alone', () => {
      const tag = LitHtml.literal`div`;
      const name = 'Everyone!';
      const content = LitHtml.flattenTemplate`<${tag}>Hello, ${name}!</${tag}>`;
      assert.deepEqual(content.strings, templateArray(['<div>Hello, ', '!</div>']));
      assert.deepEqual(content.valueMap, [false, true, false]);
    });

    it('ignores data values', () => {
      const tag = LitHtml.literal`div`;
      const name = 'everyone!';
      const content = LitHtml.flattenTemplate`<${tag} .data={{x: 1}}>Hello, ${name}!</${tag}>`;
      assert.deepEqual(content.strings, templateArray(['<div .data={{x: 1}}>Hello, ', '!</div>']));
      assert.deepEqual(content.valueMap, [false, true, false]);
    });

    it('flattens multiple values', () => {
      const tag = LitHtml.literal`div`;
      const message = 'Hello, everyone!';
      const content = LitHtml.flattenTemplate`<${tag}>${1}${2}${3}, ${message}! ${'Static value'}!</${tag}>`;
      assert.deepEqual(content.strings, templateArray(['<div>', '', '', ', ', '! ', '!</div>']));
      assert.deepEqual(content.valueMap, [false, true, true, true, true, true, false]);
    });
  });

  describe('rendering', () => {
    it('renders non-statics', () => {
      const tmpl = html`Hello, world ${123}!`;
      const target = document.createElement('div');
      LitHtml.render(tmpl, target, {host: this});

      assert.strictEqual(target.innerText, 'Hello, world 123!');
    });

    it('renders static tags', () => {
      const tag = LitHtml.literal`div`;
      const tmpl = html`<${tag}>Hello, world!</${tag}>`;
      const target = document.createElement('section');
      LitHtml.render(tmpl, target, {host: this});

      assert.strictEqual(target.innerText, 'Hello, world!');
      assert.isNotNull(target.querySelector('div'));
    });

    it('renders multiple', () => {
      const tag = LitHtml.literal`div`;
      const message = 'Hello, everyone!';
      const tmpl = html`<${tag} .data={{x: 1}}>${1}${2}${3}, ${message}! ${'Static value'}!</${tag}>`;

      const target = document.createElement('div');
      LitHtml.render(tmpl, target, {host: this});

      assert.strictEqual(target.innerText, '123, Hello, everyone!! Static value!');
      assert.isNotNull(target.querySelector('div'));
    });

    it('renders dynamic literals', () => {
      const tag1 = LitHtml.literal`div`;
      const tag2 = LitHtml.literal`p`;
      const tmpls = [tag1, tag2].map(tag => {
        return html`<${tag}>I am ${tag.value}</${tag}>`;
      });

      const target = document.createElement('div');
      LitHtml.render(tmpls, target, {host: this});

      assert.strictEqual(target.innerText, 'I am divI am p');
      assert.isNotNull(target.querySelector('div'));
      assert.isNotNull(target.querySelector('p'));
    });
  });

  describe('i18nTemplate', () => {
    const uiStrings = {placeholder: 'a message with a {string} and {template} placeholder'};
    let i18nInstance: i18nRaw.I18n.I18n;

    beforeEach(() => {
      i18nInstance = new i18nRaw.I18n.I18n(['en-US'], 'en-US');
      i18nInstance.registerLocaleData('en-US', {});
    });

    function setLocale(locale: string) {
      i18n.DevToolsLocale.DevToolsLocale.instance({
        create: true,
        data: {
          settingLanguage: locale,
          navigatorLanguage: locale,
          lookupClosestDevToolsLocale: l => l,
        },
      });
    }

    it('localizes lit templates', () => {
      const strings = i18nInstance.registerFileStrings('test.ts', uiStrings);
      setLocale('en-US');

      const result = LitHtml.i18nTemplate(strings, uiStrings.placeholder, {string: 'STRING', template: html`TEMPLATE`});
      const element = LitHtml.render(result, document.createElement('div'), {host: this});
      assert.deepEqual(
          (element.parentNode as HTMLDivElement).innerText, 'a message with a STRING and TEMPLATE placeholder');
    });

    it('localizes lit templates with translations', () => {
      i18nInstance.registerLocaleData(
          'de', {'test.ts | placeholder': {message: 'a message with a {template} and {string} placeholder'}});
      const strings = i18nInstance.registerFileStrings('test.ts', uiStrings);
      setLocale('de');

      const result = LitHtml.i18nTemplate(strings, uiStrings.placeholder, {string: 'STRING', template: html`TEMPLATE`});
      const element = LitHtml.render(result, document.createElement('div'), {host: this});
      assert.deepEqual(
          (element.parentNode as HTMLDivElement).innerText, 'a message with a TEMPLATE and STRING placeholder');
    });
  });
});
