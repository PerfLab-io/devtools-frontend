/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as VisualLogging from '../../../visual_logging/visual_logging.js';
import * as UI from '../../legacy.js';
import * as ObjectUI from '../object_ui/object_ui.js';

import jsonViewStyles from './jsonView.css.js';

const UIStrings = {
  /**
   *@description Text to find an item
   */
  find: 'Find',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/source_frame/JSONView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class JSONView extends UI.Widget.VBox implements UI.SearchableView.Searchable {
  private initialized: boolean;
  private readonly parsedJSON: ParsedJSON;
  private startCollapsed: boolean;
  private searchableView!: UI.SearchableView.SearchableView|null;
  private treeOutline!: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection;
  private currentSearchFocusIndex: number;
  private currentSearchTreeElements: ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement[];
  private searchRegex: RegExp|null;
  constructor(parsedJSON: ParsedJSON, startCollapsed?: boolean) {
    super();
    this.initialized = false;
    this.registerRequiredCSS(jsonViewStyles);
    this.parsedJSON = parsedJSON;
    this.startCollapsed = Boolean(startCollapsed);
    this.element.classList.add('json-view');
    this.element.setAttribute('jslog', `${VisualLogging.section('json-view')}`);
    this.currentSearchFocusIndex = 0;
    this.currentSearchTreeElements = [];
    this.searchRegex = null;
  }

  static async createView(content: string): Promise<UI.SearchableView.SearchableView|null> {
    // We support non-strict JSON parsing by parsing an AST tree which is why we offload it to a worker.
    const parsedJSON = await JSONView.parseJSON(content);
    if (!parsedJSON || typeof parsedJSON.data !== 'object') {
      return null;
    }

    const jsonView = new JSONView(parsedJSON);
    const searchableView = new UI.SearchableView.SearchableView(jsonView, null);
    searchableView.setPlaceholder(i18nString(UIStrings.find));
    jsonView.searchableView = searchableView;
    jsonView.show(searchableView.element);
    return searchableView;
  }

  static createViewSync(obj: Object|null): UI.SearchableView.SearchableView {
    const jsonView = new JSONView(new ParsedJSON(obj, '', ''));
    const searchableView = new UI.SearchableView.SearchableView(jsonView, null);
    searchableView.setPlaceholder(i18nString(UIStrings.find));
    jsonView.searchableView = searchableView;
    jsonView.show(searchableView.element);
    jsonView.element.tabIndex = 0;
    return searchableView;
  }

  private static parseJSON(text: string|null): Promise<ParsedJSON|null> {
    let returnObj: (ParsedJSON|null)|null = null;
    if (text) {
      returnObj = JSONView.extractJSON((text as string));
    }
    if (!returnObj) {
      return Promise.resolve(null);
    }
    try {
      const json = JSON.parse(returnObj.data);
      if (!json) {
        return Promise.resolve(null);
      }
      returnObj.data = json;
    } catch {
      returnObj = null;
    }

    return Promise.resolve(returnObj);
  }

  private static extractJSON(text: string): ParsedJSON|null {
    // Do not treat HTML as JSON.
    if (text.startsWith('<')) {
      return null;
    }
    let inner = JSONView.findBrackets(text, '{', '}');
    const inner2 = JSONView.findBrackets(text, '[', ']');
    inner = inner2.length > inner.length ? inner2 : inner;

    // Return on blank payloads or on payloads significantly smaller than original text.
    if (inner.length === -1 || text.length - inner.length > 80) {
      return null;
    }

    const prefix = text.substring(0, inner.start);
    const suffix = text.substring(inner.end + 1);
    text = text.substring(inner.start, inner.end + 1);

    // Only process valid JSONP.
    if (suffix.trim().length && !(suffix.trim().startsWith(')') && prefix.trim().endsWith('('))) {
      return null;
    }

    return new ParsedJSON(text, prefix, suffix);
  }

  private static findBrackets(text: string, open: string, close: string): {
    start: number,
    end: number,
    length: number,
  } {
    const start = text.indexOf(open);
    const end = text.lastIndexOf(close);
    let length: -1|number = end - start - 1;
    if (start === -1 || end === -1 || end < start) {
      length = -1;
    }
    return {start, end, length};
  }

  override wasShown(): void {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    const obj = SDK.RemoteObject.RemoteObject.fromLocalObject(this.parsedJSON.data);
    const title = this.parsedJSON.prefix + obj.description + this.parsedJSON.suffix;
    this.treeOutline =
        new ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection(obj, title, undefined, true /* showOverflow */);
    this.treeOutline.enableContextMenu();
    this.treeOutline.setEditable(false);
    if (!this.startCollapsed) {
      this.treeOutline.expand();
    }
    this.element.appendChild(this.treeOutline.element);
    const firstChild = this.treeOutline.firstChild();
    if (firstChild) {
      firstChild.select(true /* omitFocus */, false /* selectedByUser */);
    }
  }

  private jumpToMatch(index: number): void {
    if (!this.searchRegex) {
      return;
    }
    const previousFocusElement = this.currentSearchTreeElements[this.currentSearchFocusIndex];
    if (previousFocusElement) {
      previousFocusElement.setSearchRegex(this.searchRegex);
    }

    const newFocusElement = this.currentSearchTreeElements[index];
    if (newFocusElement) {
      this.updateSearchIndex(index);
      newFocusElement.setSearchRegex(this.searchRegex, UI.UIUtils.highlightedCurrentSearchResultClassName);
      newFocusElement.reveal();
    } else {
      this.updateSearchIndex(0);
    }
  }

  private updateSearchCount(count: number): void {
    if (!this.searchableView) {
      return;
    }
    this.searchableView.updateSearchMatchesCount(count);
  }

  private updateSearchIndex(index: number): void {
    this.currentSearchFocusIndex = index;
    if (!this.searchableView) {
      return;
    }
    this.searchableView.updateCurrentMatchIndex(index);
  }

  onSearchCanceled(): void {
    this.searchRegex = null;
    this.currentSearchTreeElements = [];

    let element: UI.TreeOutline.TreeElement|null;
    for (element = this.treeOutline.rootElement(); element; element = element.traverseNextTreeElement(false)) {
      if (!(element instanceof ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement)) {
        continue;
      }
      element.revertHighlightChanges();
    }
    this.updateSearchCount(0);
    this.updateSearchIndex(0);
  }

  performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void {
    let newIndex: number = this.currentSearchFocusIndex;
    const previousSearchFocusElement = this.currentSearchTreeElements[newIndex];
    this.onSearchCanceled();
    this.searchRegex = searchConfig.toSearchRegex(true).regex;

    let element: UI.TreeOutline.TreeElement|null;
    for (element = this.treeOutline.rootElement(); element; element = element.traverseNextTreeElement(false)) {
      if (!(element instanceof ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement)) {
        continue;
      }
      const hasMatch = element.setSearchRegex(this.searchRegex);
      if (hasMatch) {
        this.currentSearchTreeElements.push(element);
      }
      if (previousSearchFocusElement === element) {
        const currentIndex = this.currentSearchTreeElements.length - 1;
        if (hasMatch || jumpBackwards) {
          newIndex = currentIndex;
        } else {
          newIndex = currentIndex + 1;
        }
      }
    }
    this.updateSearchCount(this.currentSearchTreeElements.length);

    if (!this.currentSearchTreeElements.length) {
      this.updateSearchIndex(-1);
      return;
    }
    newIndex = Platform.NumberUtilities.mod(newIndex, this.currentSearchTreeElements.length);

    this.jumpToMatch(newIndex);
  }

  jumpToNextSearchResult(): void {
    if (!this.currentSearchTreeElements.length) {
      return;
    }
    const newIndex =
        Platform.NumberUtilities.mod(this.currentSearchFocusIndex + 1, this.currentSearchTreeElements.length);
    this.jumpToMatch(newIndex);
  }

  jumpToPreviousSearchResult(): void {
    if (!this.currentSearchTreeElements.length) {
      return;
    }
    const newIndex =
        Platform.NumberUtilities.mod(this.currentSearchFocusIndex - 1, this.currentSearchTreeElements.length);
    this.jumpToMatch(newIndex);
  }

  supportsCaseSensitiveSearch(): boolean {
    return true;
  }

  supportsRegexSearch(): boolean {
    return true;
  }
}

export class ParsedJSON {
  // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  prefix: string;
  suffix: string;

  // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: any, prefix: string, suffix: string) {
    this.data = data;
    this.prefix = prefix;
    this.suffix = suffix;
  }
}
