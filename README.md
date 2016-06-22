# Material Design Lite - Experimental V2 Architecture POC

## TL;DR

Setup the repo:

```
git clone https://github.com/google/material-design-lite.git && cd material-design-lite
git checkout experimental/v2-architecture-poc
npm i
$(npm bin)/lerna bootstrap
```

Run the development server (served out of `demos/`):

```
cd /path/to/material-design-lite
npm run dev
open http://localhost:3000
```

Run the React example:

```
cd /path/to/material-design-lite
cd examples/react
npm i
npm start
open http://localhost:3000
```

Run the Angular2 example:

```
cd /path/to/material-design-lite
cd examples/angular2
npm i
npm start
open http://localhost:3000
```

## Overview

This branch proposes a modular and flexible architecture for Material Design Lite v2. The work in this branch serves as a concrete example of the ideas presented in this document. Furthermore, examples of how a component can be wrapped by frameworks/libraries are given by both a React (in `examples/react`) and Angular2 (in `examples/angular2`) proof of concept. The hope is that this work can be used as a launchpad for realizing MDL v2's architecture.

## Motivation

Material Design Lite was originally conceived as a way for web developers to add a material look and feel to their sites without having to opt into a framework and without having to worry about graceful degredation. Our next version of Material Design Lite has wider ambitions: **we want to be the canonical implementation of the Material Design system for the web platform.** This means that framework or no framework, client or server, plain DOM or virtual (or incremental), you can use Material Design Lite to easily create beautiful products.

In order to meet this goal, we must satisfy the following requirements:

- MDL must be **easy to use out of the box**.
- MDL must be able to **easily and idiomatically integrate with host frameworks/libraries.**

The nature of the web means that there are many fragmented tools and technologies to choose from, and in order to provide an implementation of a design system for the _entire_ web platform, usage of MDL should be viable in all of those places.

There are a few issues with our current architecture that preclude us from accomplishing our primary goal:

- **We opaquely handle component lifecycle management** - Many frameworks and libraries have their own way of managing the lifecycles of their UI components, and ours may conflict with theirs.
- **We dynamically render DOM on the client side** - This prevents things such as server-side rendering, or using virtual / incremental DOM.
- **We distribute MDL as one monolithic library** - While this works for use cases where people need the whole kitchen sink, the lack of modularity also prevents us from being integrated into environments where users do not want to buy into all of MDL, and/or they can't get it to play nicely with their bundling system. Furthermore, it can lead to unnecessary bloat since users may only want to use a small sample of components rather than all of them.

This POC seeks to address these issues.

## Design

### Repository Structure

The preference of the JS community is that of [small, single-purpose modules](http://thenodeway.io/introduction/#build-small-single-purpose-modules). Traditionally this means keeping each module in a separate repository and versioning/publishing it independently to npm. While this works well for standalone packages, it unfortunately doesn't scale for larger projects consisting of many related modules. Issue tracking, versioning, and housekeeping all become massive undertakings. Tooling must be replicated across every repo, or refactored out into some sort of "CLI" tool that all contributors must buy into, and that must also be maintained. Project-wide changes become extremely difficult to implement and update. Regression - which may involve bisecting over numerous repos at once - is insanity.

The ideal scenario would be to have one repository which colocates all packages within the project, but also allows for independent versioning and publishing of each. Thankfully, we are not the first team to run into this issue. The [babel](https://babeljs.io/) team experienced this exact issue, and built [lernajs](https://lernajs.io/) to solve it.

Lerna makes you put all subpackages in a top-level `packages/` folder. When you clone the repo for the first time, you run `lerna bootstrap`, which installs all subpackage dependencies and _symlinks_ any project cross-dependencies. This is what's used in this POC.

* Every MDL component is its own package under the `packages` directory, independently versioned. All scripts and styles needed for the component are kept under that component's subdirectory (e.g., no more `_variables.scss` or `_mixins.scss` mega-files that are needed across all components).
* The MDL library which encompasses all the components also is a subpackage, under `packages/material-design-lite`. 
* Lerna takes care of symlinking dependent sibling packages in development.
* All tooling is done in one place, within the top-level repo.

The reasoning and justification for this structure is thoroughly explained in Babel's [monorepo design doc](https://github.com/babel/babel/blob/master/doc/design/monorepo.md). The thinking is: because our project is structured very similarly to Babel's, this architecture makes sense for MDL. Furthermore, by leveraging the infrastructure used by the community we can piggyback off the excellent work done there and build upon the lessons learned coming up with this.

### Tooling

For our build tooling, we need something that can:

* Bundle all of the sass for all of our components together
* Bundle the JS for all of our components together
* Split the bundles into per-component distributions
* Provide a productive development environment (incremental compilation, source maps, live reloading, etc.)

This POC uses [webpack](http://webpack.github.io/docs/what-is-webpack.html). Not only does webpack seem to be the current [most popular build tool](http://sotagtrends.com/?tags=[webpack,gulp,gruntjs]) in the community, but - when combined with [webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html) - it accomplishes all of the above goals perfectly.

The setup in this POC is modeled after webpack's [multi-part library](https://github.com/webpack/webpack/tree/master/examples/multi-part-library) example:

* JS is written in ES2015 and transpiled using babel.
* CSS is written in SASS (scss). Vendor prefixes are automatically added via autoprefixer.
* A single entry point (`js-all`) is given for the overall Material Design Lite library JS, which bundles all of the MDL components together and distributes it as a UMD Module.
* All MDL components are given to webpack as entry points (`js-components`). Each is independently bundled by webpack and exported as a UMD library. When no module system is used, each component is exposed as `mdl.$COMPONENT_NAME` (e.g. `mdl.Checkbox`).
* All component styles are built into one overall library as well as individually built per-component css.
* All files are output to a top-level `build/` folder. These files can then be copied over to `dist/` folders for the overall library as well as for each component (e.g. `packages/checkbox/dist`). The `dist/` folders can be ignored by git but published with the package on npm.
* Development is done via webpack-dev-server, which includes support for sourcemaps, incremental compilation, and [hot module replacement](http://webpack.github.io/docs/hot-module-replacement.html) that can apply source changes without even requiring a full page reload (for those unfamiliar, think JVM hot-swapping).

To build the MDL library, as well as individual distributions for all components, type `npm run dist`. Here is the result of running `tree build` after running `npm run dist`.

```
build
├── material-design-lite-theme.css
├── material-design-lite-theme.css-entry
├── material-design-lite-theme.min.css
├── material-design-lite-theme.min.css-entry
├── material-design-lite.css
├── material-design-lite.css-entry
├── material-design-lite.js
├── material-design-lite.min.css
├── material-design-lite.min.css-entry
├── material-design-lite.min.js
├── mdl-animation.css
├── mdl-animation.css-entry
├── mdl-animation.min.css
├── mdl-animation.min.css-entry
├── mdl-checkbox-theme.css
├── mdl-checkbox-theme.css-entry
├── mdl-checkbox-theme.min.css
├── mdl-checkbox-theme.min.css-entry
├── mdl-checkbox.css
├── mdl-checkbox.css-entry
├── mdl-checkbox.min.css
├── mdl-checkbox.min.css-entry
├── mdl.BaseComponent.js
├── mdl.BaseComponent.min.js
├── mdl.Checkbox.js
├── mdl.Checkbox.min.js
├── mdl.autoInit.js
└── mdl.autoInit.min.js
```

<small>_Note: those weird-looking `.css-entry` files are build artifacts output for use by webpack's ExtractTextPlugin._</small>

The whole process from a clean workspace takes about 5 seconds on a Mid-2015 Macbook Pro with 16G RAM. Also note the size of `webpack.config.js`. It is ~80 SLOC, a **~10x reduction in code size compared to our current gulpfile** (although this isn't an entirely fair comparison given that the gulpfile is doing more than just bundling the project, yet the majority of the gulpfile seems to be doing so).

To run the development server, type `npm run dev`. The development server uses `demos/` as its base dir, and serves MDL via webpack-dev-server.

### Component Architecture

While many ideas for the component architecture are taken from the component model that MDL is currently migrating to, in order to easily integrate with modern JS frameworks/libraries, we must consider the following:

* **Frameworks/libraries have their own platform abstractions** - We cannot always assume that libraries wrapping our components will be rendering their DOM on a web browser. They could be rendered server-side or using a Virtual DOM representation. [React](https://facebook.github.io/react/) is the canonical example of this, but there is also [Angular Universal](https://github.com/angular/universal), as well as [Closure Templates](https://developers.google.com/closure/templates/), which supports server-side rendering in Java.
* **Frameworks/Libraries have their own component lifecycles** - This includes hydration, destruction, performing DOM updates, event handling, etc. We cannot assume that when a component's constructor is called, its underlying DOM will be ready.

In order to be able to successfully integrate into these frameworks/libraries, we must take these points into consideration.

In order to effectively solve this problem, this POC presents an architecture based a combination of the [functional mixin pattern](http://raganwald.com/2015/06/17/functional-mixins.html) (essentially Aspect-Oriented Programming, Javascript Style. Popularized by [angus croll](https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/) and his work at Twitter on [FlightJS](https://github.com/flightjs/flight/blob/master/doc/mixin_api.md)) and the [adapter pattern](https://en.wikipedia.org/wiki/Adapter_pattern). It works as follows:

* Each MDL Component provides a **mixin** (e.g. `packages/mdl-checkbox/mixin.js`), which assigns the implementation of its component to the given prototype. For example, the `mdl-checkbox` mixin provides mechanisms for applying the correct animation classes given the previous and current state of the checkbox.
* Each mixin takes an argument representing an **adapter**. The adapter tells the component how to interface with its host platform. For example, the `mdl-checkbox` mixin takes an adapter that instructs it on how to add/remove classes, add/remove events, etc. 
* Mixin code _always_ communicates with its host platform through its adapter. 
* Adapter methods are _always_ called with the target prototype as the receiver.
* Every mixin exposes an **initialization** method which can be used at the proper place within the Framework/Library's component lifecycle to bootstrap the MDL portion of this component.

To see this pattern in action, compare the following 3 files, each which use mixins:

1. `packages/mdl-checkbox/index.js` - Our Vanilla MDL component that can be used on sites without any other frameworks/libraries. Initialization is done in the constructor. Here we use a vanilla adapter:

    ```javascript
    MDLCheckboxMixin.call(MDLCheckbox, {
      addClass(className) {
        this.root_.classList.add(className);
      },
      // ...
    });
    ```
      
2. `examples/react/src/Checkbox.js` - A React checkbox component that wraps our checkbox. Initialization is done within `componentWillMount()`. Our components and its adapter make use of [immutable-js](https://facebook.github.io/immutable-js/) and [PureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html) efficiently implement MDLCheckbox functionality:

    ```javascript
    MDLCheckbox.mixInto(Checkbox, {
      addClass(className) {
	    this.setState(prevState => ({
    	  classes: prevState.classes.add(className) // classes is an instance of immutable.Set
	    }));
      }
    });
    ```


3. `examples/angular2/src/app/components/checkbox.ts` - An Angular2 component that wraps our checkbox. Initialization is done within `ngAfterViewInit()`. Here our adapter uses angular2's abstractions:

    ```typescript
    MDLCheckbox.mixInto(CheckboxComponent, {
      addClass(className) {
      	const {_renderer: renderer, _root: root} = <any>this;
        renderer.setElementClass(root.debugElement, className, true);
      },
      // ...
    });
    ```

As can be seen above and within the examples, this architecture allows frameworks to easily leverage our components, gives us a minimally-invasive method of achieving platform transparency, and can be used directly by us for our vanilla implementations. The implementations for checkboxes in the example code are simpler and smaller in size than their [Material-UI](https://github.com/callemall/material-ui/blob/master/src/Checkbox/Checkbox.js) or [Angular/Material2](https://github.com/angular/material2/blob/master/src/components/checkbox/checkbox.ts) counterparts, and there is absolutely no style maintenance needed.

An immediate observation given this pattern is that there are guaranteed to be common needs across components, such as adding/removing classes to its root element. This then raises the question of how to reuse adapters. Because the adapters are just plain objects, reuse can be done easily and intuitively using object composition.

```javascript
const baseMixin = {
  addClass(className) {
    FrameworkDOMUtil.addClass(this.rootElement, className);
  },
  
  removeClass(className) {
  	FrameworkDOMUtil.removeClass(this.rootElement, className);
  }
};

class FrameworkThing {
  // ...
}
MDLThing.mixInto(FrameworkThing, Object.assign({}, baseMixin, {
  thingSpecificAdapterMethod(blah) {
    // ...
  }
));
``` 

#### Alternative Considered - Adapter via Dependency Injection

Instead of mixing component functionality directly into a framework's component, we could take a more classical approach and have our components take an Adapter as a constructor parameter.

```javascript
class FrameworkThing {
  domLifecycleInitHookMethod() {
    this.mdlThing_ = new MDLThing({
      addClass() {
        // ...
      },
      // ...
    });
  }
}
```

- **Pros**
  - Plays nicer with classical type systems.
  - Code is easier to write from our side
  - No method clobbering. All methods are explicitly executed on the MDL component, not through mixing into the component class.
- **Cons**
  - IMO a bit more unwieldy for clients than mixins. You must initialize the object yourself rather than leverage when the component itself gets constructed.
  - Promotes a bad practice of possible side effects in the constructor (event binding, etc.). While this works for framework code, it's a bit invasive when it comes to integration with 3rd party frameworks/libraries.	
  - No separation between vanilla component implementation and base component functionality. We'll have to write a bunch of our own adapters for our own components or have the components themselves explicitly be aware of adapters and provide default values for them, which seems less than ideal.
  
#### "What about theming?!"

The approach [bootstrap](http://getbootstrap.com/getting-started/) has taken seems like it works really well: rather than having your base styles rely on theme variables, you separate out your css into two different entry points - one for the base css, and another for the theme css. Within your theme css you make components aware of any thematic elements. This is sort of sketched out in this POC in terms of having `*-theme.scss` files. Users making use of sass could include these directly and just override the necessary variables (we could also provide a helper library to do this). People using vanilla CSS could simply look at our theme files and determine what rules apply to what selectors and make their changes accordingly.

#### "What about web components?"

There's a lot of buzz about [web components](http://webcomponents.org/) and how they are the future of reusable UI components for the web platform. While libraries like [Polymer](https://www.polymer-project.org/1.0/) do an excellent job undertaking the monumental task of polyfilling web components, they are still a [ways away](https://hacks.mozilla.org/2015/06/the-state-of-web-components/) from being standardized on the web platform. The thing about web components is that they pretty much break backwards compatibility; either you buy into web components completely or not at all. You have to use shadow DOM, HTML Imports, the Web Components API etc, and every framework and browser you target has to support it. This is simply not reflective of today's reality. 

We're just as excited about web components and everyone else and look forward to seeing it fully standardized across the web. When that day comes, we can begin to have discussions about moving to that model. In the meantime, we must support the lowest common denominator which is still vanilla HTML, CSS, and Javascript.

#### "What about react-native/cordova/phonegap/ionic/etc?"

Our primary target for Material Design Lite is the web platform. Therefore, while in theory it should be possible to just drop these components into a platform that supports transforming web technologies into native code, it's not _officially_ supported by us. That being said, if there are certain ways we could architect our code to make this use case easier to support without compromising our primary use case, that's definitely a discussion worth having.


## Additional Exploration Needed

### Testing

We still need to figure out how we're going to do unit tests, coverage, and image diffing. This is outside the scope of this particular POC.

### Documentation

How we generate docs and other human-readable items.

## License

© Google, 2015-2016. Licensed under an
[Apache-2](https://github.com/google/material-design-lite/blob/master/LICENSE)
license.