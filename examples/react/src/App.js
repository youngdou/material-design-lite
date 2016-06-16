/* eslint-disable */

import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Set as ImmutableSet} from 'immutable';
// lol super hack
import MDLCheckbox from '../../../packages/mdl-checkbox';
import '../../../packages/mdl-checkbox/mdl-checkbox.scss';

class Checkbox extends Component {
  static propTypes = {
    checked: PropTypes.bool,
    indeterminate: PropTypes.bool,
    onChange: PropTypes.func,
    labelId: PropTypes.string
  }

  static defaultProps = {
    checked: false,
    indeterminate: false,
    onChange: () => {}
  }

  state = {
    classes: new ImmutableSet(),
    checkedInternal: false,
    indeterminateInternal: false
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

  render() {
    return (
      <div ref="root" className={`md-checkbox ${this.state.classes.toJS().join(' ')}`}>
        <input ref="nativeCb"
               type="checkbox"
               className="md-checkbox__native-control"
               ariaLabelledBy={this.props.labelId}
               checked={this.state.checkedInternal}
               onChange={evt => {
                 this.setState({
                   checkedInternal: this.refs.nativeCb.checked,
                   indeterminateInternal: false
                 });
                 this.props.onChange(evt);
               }}/>
        <div className="md-checkbox__frame"></div>
        <div className="md-checkbox__background">
          <svg version="1.1"
               className="md-checkbox__checkmark"
               xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 24 24">
            <path className="md-checkbox__checkmark__path"
                  fill="none"
                  stroke="white"
                  d="M4.1,12.7 9,17.6 20.3,6.3"/>
          </svg>
          <div className="md-checkbox__mixedmark"></div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.initMdlCheckbox_();
  }

  componentWillUnmount() {
    // From MDLCheckboxMixin
    this.removeEventListeners();
  }

  componentWillReceiveProps(props) {
    const classesToAdd = [];
    const classesToRemove = [];
    if (props.checked !== this.props.checked) {
      if (props.checked) {
        classesToAdd.push(MDLCheckbox.cssClasses.CHECKED);
      } else {
        classesToRemove.push(MDLCheckbox.cssClasses.CHECKED);
        classesToRemove.push(MDLCheckbox.cssClasses.INDETERMINATE);
      }
      this.setState({checkedInternal: props.checked, indeterminateInternal: false});
    }
    if (props.indeterminate !== this.props.indeterminate) {
      if (props.indeterminate) {
        classesToAdd.push(MDLCheckbox.cssClasses.INDETERMINATE);
      } else {
        classesToRemove.push(MDLCheckbox.cssClasses.INDETERMINATE);
      }
      this.setState({indeterminateInternal: props.indeterminate});
    }

    if (classesToAdd.length || classesToRemove.length) {
      this.setState({
        classes: this.state.classes.merge(classesToAdd).subtract(classesToRemove)
      });
    }
  }

  componentDidUpdate() {
    if (this.refs.nativeCb) {
      this.refs.nativeCb.indeterminate = this.state.indeterminateInternal;
    }
  }
}
MDLCheckbox.mixInto(Checkbox, {
  addClass(className) {
    this.setState({
      classes: this.state.classes.add(className)
    });
  },
  removeClass(className) {
    this.setState({
      classes: this.state.classes.remove(className)
    });
  },
  addEventListener(type, listener) {
    if (this.refs.root) {
      this.refs.root.addEventListener(type, listener);
    }
  },
  removeEventListener(type, listener) {
    if (this.refs.root) {
      this.refs.root.removeEventListener(type, listener);
    }
  },
  addNativeCheckboxListener(type, listener) {
    if (this.refs.nativeCb) {
      this.refs.nativeCb.addEventListener(type, listener);
    }
  },
  removeNativeCheckboxListener(type, listener) {
    if (this.refs.nativeCb) {
      this.refs.nativeCb.removeEventListener(type, listener);
    }
  },
  getNativeCheckbox() {
    if (!this.refs.nativeCb) {
      throw new Error('Invalid state for operation');
    }
    return this.refs.nativeCb;
  },
  forceLayout() {
    if (this.refs.nativeCb) {
      this.refs.nativeCb.offsetWidth;
    }
  },
  isAttachedToDOM() {
    // Return true??
    return Boolean(this.refs.nativeCb);
  }
});

const CheckboxLabel = ({id, children}) => (
  <label className="md-checkbox-label" id={id}>{children}</label>
);

const CheckboxWrapper = ({children}) => (
  <div className="md-checkbox-wrapper">
    <div className="md-checkbox-wrapper__layout">
      {children}
    </div>
  </div>
)

export default class App extends Component {
  state = {
    checked: false,
    indeterminate: false,
    changeEventCount: 0
  }
  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)

  render() {
    const {checked, indeterminate, status, changeEventCount} = this.state;
    return (
      <main>
        <h1>Hello, world.</h1>
        <CheckboxWrapper>
          <Checkbox indeterminate={indeterminate}
                    onChange={({target}) => this.setState({
                      changeEventCount: changeEventCount + 1,
                      checked: target.checked,
                      indeterminate: false
                    })}/>
          <CheckboxLabel>The checkbox is currently {this.status()}</CheckboxLabel>
        </CheckboxWrapper>
        <div style={{paddingTop: '12px'}}>
          <button onClick={() => this.setState({indeterminate: true})}>Make Indeterminate</button>
        </div>
        <p>{changeEventCount} change events so far</p>
      </main>
    );
  }

  status() {
    if (this.state.indeterminate) {
      return 'indeterminate';
    }
    return this.state.checked ? 'checked' : 'unchecked';
  }
}
