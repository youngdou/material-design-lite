/**
 * Base class for all MDL components.
 * @export
 */
export default class MaterialComponent {
  /**
   * Initialize component from a DOM node.
   * @param {Element} root The element being upgraded.
   */
  constructor(root) {
    this.refreshFrame_ = 0;
    this.root_ = root;
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * CSS classes used in this component.
   *
   * @protected
   * @return {Object<string, string>} The CSS classes used in this component.
   */
  static get cssClasses_() {
    // Empty in base class. Throw error if not correctly overriden.
    throw new Error('Should have ROOT and JS keys with the style class names,' +
      ' e.g. mdl-button and mdl-js-button.');
  }

  /**
   * Number constants used in this component.
   *
   * @protected
   * @return {Object<string, number>} The numbers used in this component.
   */
  static get numbers_() {
    // Empty in base class.
    return {};
  }

  /**
   * String constants used in this component.
   *
   * @protected
   * @return {Object<string, string>} The strings used in this component.
   */
  static get strings_() {
    // Empty in base class.
    return {};
  }

  /**
   * Initialize component by running common tasks.
   *
   * @protected
   */
  init_() {
    // Attach event listeners to the DOM.
    this.addEventListeners();

    // Refresh component.
    this.refresh();

    // Add CSS marker that component upgrade is finished.
    // Useful, but beware flashes of unstyled content when relying on this.
    this.root_.classList.add(
        `${this.constructor.cssClasses_.ROOT}--is-upgraded`);
  }

  /**
   * Optional function that can be overriden if additional work needs to be done on refresh.
   * @protected
   */
  refresh_() {
    // Can be overridden in sub-component.
  }

  /**
   * Attach all listeners to the DOM.
   *
   * @export
   */
  addEventListeners() {
    // Empty in base class. Throw error if not correctly overriden.
    throw new Error('Should be implemented in components.');
  }

  /**
   * Remove all listeners from the DOM.
   *
   * @export
   */
  removeEventListeners() {
    // Empty in base class. Throw error if not correctly overriden.
    throw new Error('Should be implemented in components.');
  }

  /**
   * Run a visual refresh on the component, in case it's gone out of sync.
   * Ensures a refresh on the browser render loop.
   * @export
   */
  refresh() {
    if (this.refreshFrame_) {
      cancelAnimationFrame(this.refreshFrame_);
    }
    this.refreshFrame_ = requestAnimationFrame(() => {
      this.refresh_();
      this.refreshFrame_ = 0;
    });
  }

  /**
   * Kills a component, removing all event listeners and deleting the node from
   * the DOM.
   *
   * @export
   */
  kill() {
    this.removeEventListeners();

    if (this.root_.parentNode) {
      this.root_.parentNode.removeChild(this.root_);
    }
  }
}
