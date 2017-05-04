'use babel';

import KeyMacroIncrementerView from './key-macro-incrementer-view';
import { CompositeDisposable } from 'atom';
import Incrementer from './incrementer';

export default {

  keyMacroIncrementerView: null,
  modalPanel: null,
  subscriptions: null,

  editor: null,
  rawKeyEventArray: null,
  addKeyEvent: null,
  keyEventArray: null,
  incrementer: null,
  pasteCounter: 0,

  activate(state) {
    this.keyMacroIncrementerView = new KeyMacroIncrementerView(state.keyMacroIncrementerViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.keyMacroIncrementerView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'key-macro-incrementer:toggle': () => this.toggle(),

      // my action
      'key-macro:startKeyMacro': () => this.startKeyMacro(),
      'key-macro:endKeyMacro': () => this.endKeyMacro(),
      'key-macro:load': () => this.load(),
      'key-macro:incrementCopy': () => this.incrementCopy(),
      'key-macro:pasteWithEnter': () => this.pasteWithEnter()
    }));
    this.editor = atom.workspace.getActiveTextEditor();
    this.rawKeyEventArray = [];
    this.keyEventArray = [];
    this.incrementer = new Incrementer();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.keyMacroIncrementerView.destroy();
  },

  serialize() {
    return {
      keyMacroIncrementerViewState: this.keyMacroIncrementerView.serialize()
    };
  },

  toggle() {
    console.log('KeyMacroIncrementer was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  // ctrl-alt-s
  startKeyMacro() {
    console.log('Start KeyMacro');
    // clear array
    this.rawKeyEventArray.splice(0, this.rawKeyEventArray.length);
    this.keyEventArray.splice(0, this.keyEventArray.length);
    this.keyMacroIncrementerView.setText('Start KeyMacro');
    this.addEventListener();
    // reset counter
    pasteCounter = 0;
  },

  // keyboard listener
  addEventListener() {
    var array = this.rawKeyEventArray;
    this.addKeyEvent = function() {
      console.log(event);
      if(event.key.match(/Control|Shift|Alt|Meta|Cmd/)) {
        return;
      }
      array.push(event);
    }
    window.addEventListener('keydown', this.addKeyEvent, true);
  },

  // ctrl-alt-e
  endKeyMacro() {
    console.log('End KeyMacro');
    this.keyMacroIncrementerView.setText('End KeyMacro');
    window.removeEventListener('keydown', this.addKeyEvent, true);
    this.removeEndEventKey();
    this.incrementer.createIncrementedArray(this.rawKeyEventArray, this.keyEventArray);
  },

  // remove end key event
  removeEndEventKey() {
    var lastChar = this.rawKeyEventArray[this.rawKeyEventArray.length - 1].key;
    console.log(lastChar);
    if(lastChar == "Dead") {
      this.rawKeyEventArray.pop();
    }
  },

  // ctrl-alt-l
  load() {
    console.log('Load');
    this.keyMacroIncrementerView.setText('Load');
    workspaceElement = atom.views.getView(atom.workspace);
    workspaceElement.focus();

    console.log(this.keyEventArray.length);
    for(var i = 0; i < this.keyEventArray.length; i++) {
      if(this.incrementer.isIncrementMark(i, this.keyEventArray)) {
        i++;
        continue;
      };
      this.input(this.keyEventArray[i]);
    }
    // increment every load
    this.incrementer.increment(this.keyEventArray);
  },

  // input text
  input(key) {
    // Tab key
    if(key == 'Tab') {
      this.editor.insertText('\t');
      return;
    }
    // Enter
    if(key == 'Enter') {
      this.editor.insertText('\n');
      return;
    }
    // Backspace
    if(key == 'Backspace') {
      this.editor.backspace();
      return;
    }
    // Arrow key
    if(key == 'ArrowLeft') {
      this.editor.moveLeft(1);
      return;
    }
    if(key == 'ArrowRight') {
      this.editor.moveRight(1);
      return;
    }
    if(key == 'ArrowUp') {
      this.editor.moveUp(1);
      return;
    }
    if(key == 'ArrowDown') {
      this.editor.moveDown(1);
      return;
    }
    // other char
    this.editor.insertText(key);
  },

  incrementCopy() {
    this.keyMacroIncrementerView.setText('Increment Copy');
    // clear array
    this.rawKeyEventArray.splice(0, this.rawKeyEventArray.length);
    this.keyEventArray.splice(0, this.keyEventArray.length);
    // remove key event when there is a listener
    window.removeEventListener('keydown', this.addKeyEvent, true);
    // reset counter
    pasteCounter = 0;

    var selectedText = this.editor.getSelectedText();
    console.log('selectedText : '+selectedText);
    // split selected text
    this.keyEventArray = selectedText.split('');
    this.incrementer.increment(this.keyEventArray);
  },

  // paste with last enter
  pasteWithEnter() {
    this.keyMacroIncrementerView.setText('Increment Paste');
    if (pasteCounter == 0) {
      this.keyEventArray.push('Enter');
    }
    this.load();
    pasteCounter++;
  }

};
