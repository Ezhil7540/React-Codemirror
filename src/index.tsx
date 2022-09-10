/**
 * Autocomplete implementation was taken from this issue:
 * 1) Add to react-codemirror
 * https://github.com/JedWatson/react-codemirror/issues/52#issuecomment-304043799
 * 2) Show on all typing
 * https://github.com/JedWatson/react-codemirror/issues/52#issuecomment-271069881
 * 3) Limiting keys
 * https://github.com/JedWatson/react-codemirror/issues/52#issuecomment-304043799
 * https://stackoverflow.com/a/51282151/4068507
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as CodeMirror from 'codemirror';
import { Controlled as ReactCodeMirror } from 'react-codemirror2';
import * as _ from 'lodash';

var codeMirrorTypo = require('codemirror-typo');

// import * as CodeMirrorSpellChecker from 'codemirror-spell-checker';

import customHint from './customHint';

// language modes
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/mode/simple';
// keymap
import 'codemirror/keymap/sublime';
// editor styling
import 'codemirror/lib/codemirror.css';
// autocomplete related
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/addon/hint/show-hint.css';
// custom styles
import './styles.scss';

type Props = {};

type State = {
  code: string;
};

class App extends React.Component<Props, State> {
  codeMirror: any;
  autoCompleteDebounce: any;
  AUTOCOMPLETE_TIMEOUT: number;

  constructor(props) {
    super(props);

    this.state = {
      code: [
        // '',
         'Helllo this is a romp $20.00 but sucks ass. But maybe for $20. I has cheesburger.'
         'console.log("This is the code!");',
         '## This is markdown',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         '// This is even **deeper** formatting.',
         'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using "Content here, content here", making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for "lorem ipsum" will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
        // ''
      ].join('\n\n')
    };

    this.AUTOCOMPLETE_TIMEOUT = 500;

    this.codeMirror = null;

    // Number regex taken from here:
    // https://stackoverflow.com/questions/5917082/regular-expression-to-match-numbers-with-or-without-commas-and-decimals-in-text
    CodeMirror.defineSimpleMode('albert-mode', {
      // The start state contains the rules that are intially used
      start: [
        // Matche any word with letters, numbers or dollarsign
        //
        {
          // regex: /\$\d+\.?\d+/,
          regex: /\$?\d{1,3}(,\d{3})*(\.\d+)?/,
          token: 'dollar'
        },
        {
          regex: /\d+\.?\d+/,
          token: 'number'
        },
        {
          regex: /([A-za-z0-9$][\w$]*)/,
          token: 'word'
        },
        {
          regex: /[.?!][\s\n]/,
          token: 'sentence-end'
        }
      ]
    });

    this.autoCompleteDebounce = _.debounce(
      this.autoComplete,
      this.AUTOCOMPLETE_TIMEOUT
    );
  }

  editorDidMount = editor => {
    this.codeMirror = editor;
    this.codeMirror.on('change', this.handleCodeMirrorChange);
  };

  onBeforeChange = (editor, data, value) => {
    this.setState({ code: value });
  };

  onChange = (editor, data, value) => {
    // console.log('change!', data, value);
  };

  handleCodeMirrorChange = (codeMirror, change) => {
    /**
     * Operates at the internal CodeMirror instance, used to trigger the snippets widget
     */

    var cur = codeMirror.getCursor();
    var token = codeMirror.getTokenAt(cur);

    // cancel previous debounced call on every keystroke and call it again if appropriate
    this.autoCompleteDebounce.cancel();
    if (
      token.string.length >= 1 &&
      token.type === 'word' &&
      token.string !== ' '
    ) {
      // this.autoComplete(codeMirror);
      this.autoCompleteDebounce(codeMirror);
    }
  };

  autoComplete = cm => {
    // const codeMirror = this.refs['CodeMirror'].getCodeMirrorInstance();

    // hint options for specific plugin & general show-hint
    // Other general hint config, like 'completeSingle' and 'completeOnSingleClick'
    // should be specified here and will be honored
    const hintOptions = {
      completeSingle: false,
      completeOnSingleClick: true,
      closeOnUnfocus: false,
      hint: customHint
    };

    // codeMirror.hint.javascript is defined when importing codemirror/addon/hint/javascript-hint
    // (this is mentioned in codemirror addon documentation)
    // Reference the hint function imported here when including other hint addons
    // or supply your own
    // codeMirror.showHint(cm, codeMirror.hint.javascript, hintOptions);
    // this.codeMirror.showHint(cm, customHint, hintOptions);
    this.codeMirror.showHint(hintOptions);
  };

  handleTestClick = e => {
    this.codeMirror.doc.setCursor(16)
    this.codeMirror.focus();
    // console.log(this._codeMirror.current.codeMirror.doc.getValue());
  };

  handleGetValueClick = e => {
    console.log(this.codeMirror.doc.getValue());
  };

  handleSetValueClick = e => {
    console.log(this.codeMirror.doc.setValue('This the set value!'));
  };

  render() {
    var options = {
      mode: 'albert-mode',
      // mode: 'javascript',
      lineNumbers: true,
      lineWrapping: true,
      showCursorWhenSelecting: true,
      keyMap: 'sublime',
      // allowDropFileTypes: ['image/png']
      // hintOptions related keys
      alignWithWord: true,
      spellcheck: true,
      extraKeys: {
        'Ctrl-Space': this.autoComplete,
        Tab: this.autoComplete,
        'Shift-Cmd-P': this.autoComplete,
        'Shift-Ctrl-P': this.autoComplete,
        'Cmd-Enter': this.autoComplete
      }
    };

    return (
      <div className="al-container">
        <h1>React-codemirror2 Example</h1>
        <ReactCodeMirror
          className="al-chat-composer-codemirror"
          value={this.state.code}
          options={options}
          editorDidMount={this.editorDidMount}
          onBeforeChange={this.onBeforeChange}
          onChange={this.onChange}
        />
        <button onClick={this.handleTestClick}>Test</button>
        <button onClick={this.handleGetValueClick}>Get value</button>
        <button onClick={this.handleSetValueClick}>Set value</button>
      </div>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
