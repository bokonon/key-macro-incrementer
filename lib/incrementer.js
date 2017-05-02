'use babel';

export default class Incrementer {

  constructor() {

  }

  // increment number
  createIncrementedArray(rawKeyEventArray, keyEventArray) {
    // copy only key
    for(var event of rawKeyEventArray) {
      keyEventArray.push(event.key);
    }
    // do first increment
    this.increment(keyEventArray);
  }

  increment(keyEventArray) {
    var offset = 0;
    while(true) {
      var index = this.getIncrementeNumberIndex(offset, keyEventArray);
      console.log('index : '+index);
      if(index == -1) return;
      var stringNumber = this.getTargetStringNumber(index, keyEventArray);
      var number = this.getTargetNumber(stringNumber);
      this.spliceArrayIfNeed(index, stringNumber, number, keyEventArray);
      offset = index + String(number).length;
    }
  }

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
  }

  // for zero start
  getTargetStringNumber(index, keyEventArray) {
    var stringNum = '';
    for(var i = index; i < keyEventArray.length; i++) {
      if(keyEventArray[i].match(/\d/) != null) {
        stringNum += keyEventArray[i];
        continue;
      }
      break;
    }
    console.log('stringNum : '+stringNum);
    return stringNum;
  }

  // get int original number
  getTargetNumber(stringNum) {
    var num = Number(stringNum);
    console.log('num : '+num);
    return num;
  }

  // increment number and insert array if need
  spliceArrayIfNeed(index, stringNumber, number, keyEventArray) {

    var numberDigits = String(number).length;
    number++;
    console.log('incremented number : '+number);
    var incrementedNumberDigits = String(number).length;
    // for zero start
    var stringNumberDigits = stringNumber.length;
    var zeroStartOffset = 0;
    if (stringNumberDigits > incrementedNumberDigits) zeroStartOffset = stringNumberDigits - incrementedNumberDigits;
    console.log('zeroStartOffset : '+zeroStartOffset);
    if(zeroStartOffset > 0) {
      for(var i = 0; i < zeroStartOffset; i++) {
        keyEventArray[index+i] = String(0);
      }
    }
    // for increased digit
    else if(incrementedNumberDigits > numberDigits) {
      keyEventArray.splice(index, 0, '');
    }
    var maxDigits = stringNumberDigits > incrementedNumberDigits ? stringNumberDigits : incrementedNumberDigits;
    console.log('maxDigit : '+maxDigits);
    for(var i = zeroStartOffset; i < maxDigits; i++) {
      keyEventArray[index+i] = String(number).substr(i - zeroStartOffset, 1);
    }

  }

  isIncrementMark(position, keyEventArray) {
    if(keyEventArray[position] != '%') return false;
    if(position >= keyEventArray.length - 2) return false;
    if(keyEventArray[position+1] != 'd') return false;
    if(keyEventArray[position+2].match(/\d/) == null) return false;

    return true;
  }

};
