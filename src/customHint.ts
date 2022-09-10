/**
 * If that fails, it looks for a "hintWords" helper to fetch a list of completable words
 * for the mode, and uses CodeMirror.hint.fromList to complete from those.
 */
import * as CodeMirror from 'codemirror';
import * as matchSorter from 'match-sorter';
import * as _ from 'lodash';

// const hintList = [
//   'auto insurance',
//   'Happy to explain what happened here',
//   'Hello Rishi,',
//   'Hi Rishi -',
//   'homeowner insurance',
//   'homeowner',
//   'How can we help?',
//   'I think I see what happened here.',
//   'insurance',
//   'Let us know if you have any further questions.',
//   'life insurance',
//   'Thanks for sending that information',
//   'Upon further review, it looks like',
//   'Yo what up Rishi -',
//   // "Let our geniuses review your financial profile and think through some options for you. We'll come back to you with next steps.",
//   "Let us know if there's anything else we can do for you",
//   "We'd be happy to help you think about this!",
//   "You're welcome!"
// ];

const hintList = [
  {
    prefix: 'rab',
    body: 'restaurant and bars'
  },
  {
    prefix: 'tsp',
    body: 'top spending categories'
  },
  {
    prefix: 'ai',
    body: 'auto insurance'
  },
  {
    prefix: 'htewhh',
    body: 'Happy to explain what happened here'
  },
  {
    prefix: 'he',
    body: 'Hello Rishi -'
  },
  {
    prefix: 'hi',
    body: 'Hi Rishi -'
  },
  {
    prefix: 'homeowner insurance',
    body: 'homeowner insurance'
  },
  {
    prefix: 'homeowner',
    body: 'homeowner'
  },
  {
    prefix: 'hcwh',
    body: 'How can we help?'
  },
  {
    prefix: 'Sure thing -',
    body: 'Sure thing -'
  },
  {
    prefix: 'iswhh',
    body: 'I think I see what happened here.'
  },
  {
    prefix: 'insurance',
    body: 'insurance'
  },
  {
    prefix: 'lukiq',
    body: 'Let us know if you have any further questions.'
  },
  {
    prefix: 'life insurance',
    body: 'life insurance'
  },
  {
    prefix: 'tfst',
    body: 'Thanks for sending that information'
  },
  {
    prefix: 'ufr',
    body: 'Upon further review, it looks like'
  },
  {
    prefix: 'Yo what up Rishi -',
    body: 'Yo what up Rishi -'
  },
  {
    prefix: 'logr',
    body:
      "Let our geniuses review your financial profile and think through some options for you. We'll come back to you with next steps."
  },
  {
    prefix: 'lukid',
    body: "let us know if there's anything else we can do for you"
  },
  {
    prefix: 'wbhth',
    body: "We'd be happy to help you think about this!"
  },
  {
    prefix: 'hth',
    body: 'happy to help'
  },
  {
    prefix: 'yw',
    body: "You're welcome!"
  }
];

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const albertHintingFunc = (codeMirror, options) => {
  /**
   * returns a {list, from, to, [selectedHint]}
   * list: array of strings or objects (the completions)
   * from, to: start and end of the token that is being completed as {line, ch} objects
   * selectedHint:  integer, control the initially selected hint
   *
   */
  let Pos = CodeMirror.Pos;

  let curPos = codeMirror.getCursor();
  let curLine = codeMirror.getLine(curPos.line);
  let token = codeMirror.getTokenAt(curPos);
  token.end = curPos.ch;

  let prevToken = null;
  if (token.start > 0) {
    let prevPos = { ...curPos, ch: token.start - 1 };
    prevToken = codeMirror.getTokenAt(prevPos);
  }

  // let matchesList = matchSorter(hintList, token.string);
  let matchesList = matchSorter(hintList, token.string, {
    // keys: ['prefix']
    keys: ['prefix', 'body']
  });

  // add a trailing space to it all
  matchesList = matchesList.map((hint: any): any => {
    let spacedHint = { ...hint };
    spacedHint.body = spacedHint.body + ' ';
    return spacedHint;
  });

  // Capitalize if at start of sentence.
  matchesList = matchesList.map(hint => {
    let newHint = { ...hint };
    if (prevToken && prevToken.type === 'sentence-end') {
      newHint.body = capitalize(newHint.body);
      return newHint;
    }

    if (token.start === 0) {
      newHint.body = capitalize(newHint.body);
      return newHint;
    }

    return newHint;
  });

  let fromPos = Pos(curPos.line, token.start);
  let toPos = Pos(curPos.line, token.end);

  let completionsList = matchesList.map(hint => {
    let displayText =
      hint.prefix.toLowerCase().trim() === hint.body.toLowerCase().trim()
        ? hint.prefix
        : `${hint.prefix} - ${hint.body}`;

    let completion = {
      _prefix: hint.prefix,
      _body: hint.body,
      text: hint.body,
      displayText: displayText,
      render: (Element, self, data) => {
        var itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', 'al-completion-item');

        var prefixSpan = document.createElement('span');
        prefixSpan.setAttribute('class', 'al-completion-prefix');
        prefixSpan.textContent = data._prefix;

        var bodySpan = document.createElement('span');
        bodySpan.setAttribute('class', 'al-completion-body');
        bodySpan.textContent = data._body;

        itemDiv.appendChild(prefixSpan);
        itemDiv.appendChild(bodySpan);
        Element.appendChild(itemDiv);
      }
    };
    return completion;
  });
  return {
    list: completionsList,
    from: Pos(curPos.line, token.start),
    to: Pos(curPos.line, token.end),
    selectedHint: 0
  };
};

export default albertHintingFunc;
