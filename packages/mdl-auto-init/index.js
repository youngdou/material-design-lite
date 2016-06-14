/**
 * Auto-initializes all mdl components on a page.
 */
export default function mdlAutoInit() {
  for (let node of document.querySelectorAll('[data-mdl-auto-init]')) {
    const ctorName = node.dataset.mdlAutoInit;
    if (!ctorName) {
      throw new Error('(mdl-auto-init) Constructor name must be given.');
    }

    const Ctor = global[ctorName];
    if (typeof Ctor !== 'function') {
      throw new Error(
        `(mdl-auto-init) Could not find constructor for ${ctorName}`);
    }

    if (node[ctorName]) {
      console.warn(`Component already initialized for ${node}. Skipping...`);
      continue;
    }

    // TODO: Should we make a rule for an attachTo() static method?
    const component = Ctor.attachTo(node);
    node[ctorName] = component;
  }
}
