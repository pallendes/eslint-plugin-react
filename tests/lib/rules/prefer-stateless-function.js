/**
 * @fileoverview Enforce stateless components to be written as a pure function
 * @author Yannick Croissant
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-stateless-function');
const RuleTester = require('eslint').RuleTester;

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
  ecmaFeatures: {
    experimentalObjectRestSpread: true,
    jsx: true
  }
};

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({parserOptions});
ruleTester.run('prefer-stateless-function', rule, {

  valid: [
    {
      // Already a stateless function
      code: [
        'const Foo = function(props) {',
        '  return <div>{props.foo}</div>;',
        '};'
      ].join('\n')
    }, {
      // Already a stateless (arrow) function
      code: 'const Foo = ({foo}) => <div>{foo}</div>;'
    }, {
      // Extends from PureComponent and uses props
      code: [
        'class Foo extends React.PureComponent {',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      options: [{
        ignorePureComponents: true
      }]
    }, {
      // Extends from PureComponent and uses context
      code: [
        'class Foo extends React.PureComponent {',
        '  render() {',
        '    return <div>{this.context.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      options: [{
        ignorePureComponents: true
      }]
    }, {
      // Extends from PureComponent in an expression context.
      code: [
        'const Foo = class extends React.PureComponent {',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '};'
      ].join('\n'),
      parserOptions: parserOptions,
      options: [{
        ignorePureComponents: true
      }]
    }, {
      // Has a lifecyle method
      code: [
        'class Foo extends React.Component {',
        '  shouldComponentUpdate() {',
        '    return false;',
        '  }',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n')
    }, {
      // Has a state
      code: [
        'class Foo extends React.Component {',
        '  changeState() {',
        '    this.setState({foo: "clicked"});',
        '  }',
        '  render() {',
        '    return <div onClick={this.changeState.bind(this)}>{this.state.foo || "bar"}</div>;',
        '  }',
        '}'
      ].join('\n')
    }, {
      // Use refs
      code: [
        'class Foo extends React.Component {',
        '  doStuff() {',
        '    this.refs.foo.style.backgroundColor = "red";',
        '  }',
        '  render() {',
        '    return <div ref="foo" onClick={this.doStuff}>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n')
    }, {
      // Has an additional method
      code: [
        'class Foo extends React.Component {',
        '  doStuff() {}',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n')
    }, {
      // Has an empty (no super) constructor
      code: [
        'class Foo extends React.Component {',
        '  constructor() {}',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n')
    }, {
      // Has a constructor
      code: [
        'class Foo extends React.Component {',
        '  constructor() {',
        '    doSpecialStuffs();',
        '  }',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n')
    }, {
      // Has a constructor (2)
      code: [
        'class Foo extends React.Component {',
        '  constructor() {',
        '    foo;',
        '  }',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n')
    }, {
      // Use this.bar
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this.bar}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Use this.bar (destructuring)
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    let {props:{foo}, bar} = this;',
        '    return <div>{foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Use this[bar]
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this[bar]}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Use this['bar']
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this[\'bar\']}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Can return null (ES6, React 0.14.0)
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    if (!this.props.foo) {',
        '      return null;',
        '    }',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      settings: {
        react: {
          version: '0.14.0'
        }
      }
    }, {
      // Can return null (ES5, React 0.14.0)
      code: [
        'var Foo = createReactClass({',
        '  render: function() {',
        '    if (!this.props.foo) {',
        '      return null;',
        '    }',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '});'
      ].join('\n'),
      settings: {
        react: {
          version: '0.14.0'
        }
      }
    }, {
      // Can return null (shorthand if in return, React 0.14.0)
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return true ? <div /> : null;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      settings: {
        react: {
          version: '0.14.0'
        }
      }
    }, {
      code: [
        'export default (Component) => (',
        '  class Test extends React.Component {',
        '    componentDidMount() {}',
        '    render() {',
        '      return <Component />;',
        '    }',
        '  }',
        ');'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Has childContextTypes
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this.props.children}</div>;',
        '  }',
        '}',
        'Foo.childContextTypes = {',
        '  color: PropTypes.string',
        '};'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Uses a decorator
      code: [
        '@foo',
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Uses a called decorator
      code: [
        '@foo("bar")',
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint'
    }, {
      // Uses multiple decorators
      code: [
        '@foo',
        '@bar()',
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint'
    }
  ],

  invalid: [
    {
      // Only use this.props
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Only use this[\'props\']
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return <div>{this[\'props\'].foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Only extend PureComponent without use of props or context
      code: [
        'class Foo extends React.PureComponent {',
        '  render() {',
        '    return <div>foo</div>;',
        '  }',
        '}'
      ].join('\n'),
      options: [{
        ignorePureComponents: true
      }],
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Extends from PureComponent but no ignorePureComponents option
      code: [
        'class Foo extends React.PureComponent {',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Has only displayName (method) and render
      code: [
        'class Foo extends React.Component {',
        '  static get displayName() {',
        '    return \'Foo\';',
        '  }',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Has only displayName (property) and render
      code: [
        'class Foo extends React.Component {',
        '  static displayName = \'Foo\';',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Has only propTypes (method) and render
      code: [
        'class Foo extends React.Component {',
        '  static get propTypes() {',
        '    return {',
        '      name: PropTypes.string',
        '    };',
        '  }',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Has only propTypes (property) and render
      code: [
        'class Foo extends React.Component {',
        '  static propTypes = {',
        '    name: PropTypes.string',
        '  };',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Has only props (type annotation) and render
      code: [
        'class Foo extends React.Component {',
        '  props: {',
        '    name: string;',
        '  };',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Has only useless constructor and render
      code: [
        'class Foo extends React.Component {',
        '  constructor() {',
        '    super();',
        '  }',
        '  render() {',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Only use this.props and this.context (destructuring)
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    let {props:{foo}, context:{bar}} = this;',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Can return null (ES6)
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    if (!this.props.foo) {',
        '      return null;',
        '    }',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Can return null (ES5)
      code: [
        'var Foo = createReactClass({',
        '  render: function() {',
        '    if (!this.props.foo) {',
        '      return null;',
        '    }',
        '    return <div>{this.props.foo}</div>;',
        '  }',
        '});'
      ].join('\n'),
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }, {
      // Can return null (shorthand if in return)
      code: [
        'class Foo extends React.Component {',
        '  render() {',
        '    return true ? <div /> : null;',
        '  }',
        '}'
      ].join('\n'),
      parser: 'babel-eslint',
      errors: [{
        message: 'Component should be written as a pure function'
      }]
    }
  ]
});
