'use strict';

var assert = chai.assert;
const tabWidth = 2;

function extract_text(e) {
  let text = "";
  for (let child of e.childNodes) {
    if (child.nodeName === "SPAN") {
      text += extract_text(child);
    } else if (child.nodeName === "#text") {
      text += child.wholeText;
    } else {
      // ??? unexpected kind of node in the code
      console.log("Unexpected contents: ");
      console.log(child);
    }
  }
  return text;
}

function fiddler() {
  let codes = document.querySelectorAll('section pre>code');
  for (let code of codes) {
    let pre = code.parentElement;
    assert(pre.nodeName === 'PRE');
//     console.log(String(code.classList));
    let existing = pre.lastChild;
    if (existing.nodeName !== '#text' && existing.classList.contains('fiddler')) {
      // console.log("already made a button here ");
    } else {
      let newForm = document.createElement("form");
//       console.log("need a button here");
      let newButton = document.createElement("button");
      newForm.className = "fiddler";
      newForm.method = "POST";
      newForm.action = "https://jsfiddle.net/api/post/library/pure";
      if (code.classList.contains('javascript')) {
        newButton.name = "js";
      } else if (
        code.classList.contains('html') 
        || code.classList.contains('xml') 
      ) {
        newButton.name = "html";
      } else if (code.classList.contains('css')) {
        newButton.name = "css";
      } else {
//         console.log(String("What's this: " + code.classList));
        continue;
      }
      let text = extract_text(code);
      newButton.value = text;
      newButton.type = "submit";
      newButton.appendChild(
        document.createTextNode("Fiddle!")
        );
      newForm.appendChild(newButton);
      pre.insertBefore(newForm, null);
      setTimeout( () => {
        newButton.style.marginBottom = (newButton.clientHeight * -1) + 'px';
      }, 0);
    }
  }
}

function stripPreIndentation( options ) {
  let codes = document.querySelectorAll('pre>code');
  for (let code of codes) {
    let pre = code.parentElement;
    assert(pre.nodeName === 'PRE');
    let guts = code.innerHTML;
    let lines = guts.split(/[\r\n]+/); // https://stackoverflow.com/a/5035058 2019-02-13
//     console.log(lines);
    if (lines[0].match(/^[\s]*$/)) {
      lines.shift();
    }
    if (lines[lines.length-1].match(/^[\s]*$/)) {
      lines.pop();
    }
    let minIndent = Infinity;
    for (let line of lines) {
      line = line.replace(/\t/g, ' '.repeat(tabWidth));
//       console.log(line);
      let indented = (line.match(/^ *[^ ]+/));
      if (indented) {
        indented = indented[0];
        let indent = (indented.match(/^ */))[0].length;
        if (indent < minIndent) {
          minIndent = indent;
        }
      }
    }
    if (minIndent === Infinity) {
      minIndent = 0;
    }
    let indentRegex = RegExp('^' + ' '.repeat(minIndent));
    let newLines = [];
    for (let line of lines) {
      let newLine = line.replace(indentRegex, '');
      newLines.push(newLine);
    }
    let newGuts = newLines.join("\n");
    code.innerHTML = newGuts;
  }
}
