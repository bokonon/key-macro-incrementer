'use babel';

import KeyMacroIncrementerView from './key-macro-incrementer-view';
import { CompositeDisposable } from 'atom';

export default {

  keyMacroIncrementerView: null,
  modalPanel: null,
  subscriptions: null,

  editor: null,
  rawKeyEventArray: null,
  addKeyEvent: null,
  keyEventArray: null,

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
      'key-macro:load': () => this.load()
    }));
    this.editor = atom.workspace.getActiveTextEditor();
    this.rawKeyEventArray = [];
    this.keyEventArray = [];
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
    this.createIncrementedArray(this.rawKeyEventArray, this.keyEventArray);
  },

  // remove end key event
  removeEndEventKey() {
    var lastChar = this.rawKeyEventArray[this.rawKeyEventArray.length - 1].key;
    console.log(lastChar);
    if(lastChar == "Dead") {
      this.rawKeyEventArray.pop();
    }
  },

  // increment number
  createIncrementedArray(rawKeyEventArray, keyEventArray) {
    // copy only key
    for(var event of rawKeyEventArray) {
      keyEventArray.push(event.key);
    }
    // do first increment
    this.increment(keyEventArray);
  },

  increment(keyEventArray) {
    var offset = 0;
    while(true) {
      var index = this.getIncrementeNumberIndex(offset, keyEventArray);
      console.log('index : '+index);
      if(index == -1) return;
      var number = this.getTargetNumber(index, keyEventArray);
      this.spliceArrayIfNeed(index, number, keyEventArray);
      offset = index + String(number).length;
    }
  },

  // return -1 if no increment number
  getIncrementeNumberIndex(offset, keyEventArray) {
    // search increment mark
    for(var i = offset; i < keyEventArray.length; i++) {
      if(keyEventArray[i] != '%') continue;
      if(i >= keyEventArray.length - 2) break;
      if(keyEventArray[i+1] != 'd') continue;
      if(keyEventArray[i+2].match(/\d/) == null) continue;

      // found incremented number
      return i+2;
    }
    return -1;
  },

  // get int original number
  getTargetNumber(index, keyEventArray) {
    var stringNum = '';
    for(var i = index; i < keyEventArray.length; i++) {
      if(keyEventArray[i].match(/\d/) != null) {
        stringNum += keyEventArray[i];
        continue;
      }
      break;
    }
    var num = Number(stringNum);
    console.log('num : '+num);
    return num;
  },

  // increment number and insert array if need
  spliceArrayIfNeed(index, number, keyEventArray) {
    var srcNumberDigits = String(number).length;
    number++;
    var incrementedNumberDigits = String(number).length;
    if(incrementedNumberDigits > srcNumberDigits) {
      keyEventArray.splice(index, 0, '');
    }
    for(var i = 0; i < incrementedNumberDigits; i++) {
      keyEventArray[index+i] = String(number).substr(i, 1);
    }
  },

  // ctrl-alt-l
  load() {
    console.log('load');
    workspaceElement = atom.views.getView(atom.workspace);
    workspaceElement.focus();

    console.log(this.keyEventArray.length);
    for(var i = 0; i < this.keyEventArray.length; i++) {
      if(this.isIncrementMark(i, this.keyEventArray)) {
        i++;
        continue;
      };
      this.input(this.keyEventArray[i]);
    }
    // increment every load
    this.increment(this.keyEventArray);
  },

  isIncrementMark(position, keyEventArray) {
    if(keyEventArray[position] != '%') return false;
    if(position >= keyEventArray.length - 2) return false;
    if(keyEventArray[position+1] != 'd') return false;
    if(keyEventArray[position+2].match(/\d/) == null) return false;

    return true;
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
  }

};
