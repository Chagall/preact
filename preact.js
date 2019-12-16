const Preact = {
  /**
   * Builds a Preact element with type, props and its children attached to it
   * @param type - Type of the element 
   * @param props - Its props
   * @param children - Its children
   */
  createElement(type, props, children) {
    const element = {
      type,
      props: props || {}
    };

    if (children) {
      element.props.children = children;
    }

    return element;
  },

  /**
   * Renders element inside the container
   * @param element - What should be rendered
   * @param container - Where it should be rendered
   */
  render(element, container) {
    const wrapperElement = this.createElement(TopLevelWrapper, element);            // Wrap the element in a top level wrapper
    const componentInstance = new PreactCompositeComponentWrapper(wrapperElement);  // Pass this wrapper into the composide component wrapper
    return componentInstance.mountComponent(container);                             // mount the component into the container and return the dom node
  },

  createClass(spec) {
    function Constructor(props) {
      this.props = props;
    }

    Constructor.prototype.render = spec.render;

    return Constructor;
  }
}

// ---------------------------- Preact Composite Component Wrapper -----------------------------------
class PreactCompositeComponentWrapper {
  constructor(element) {
    this.currentElement = element;
  }

  /**
   * Mounts the Composide Component into the container
   * @param container - Where the component should be mounted
   */
  mountComponent(container) {
    const Component = this.currentElement.type;                         // Gets the type of current element
    const componentInstance = new Component(this.currentElement.props); // Creates a component with the element props

    let element = componentInstance.render();                           // Calls its render method

    // shortcut fix. Will be changed later
    while (typeof element.type === "function") {
      element = (new element.type(element.props)).render();
    }

    const domComponentInstance = new PreactDOMComponent(element);   // Creates a PreactDomComponent based on the element   
    return domComponentInstance.mountComponent(container);          // Mounts the domComponent into the container and returns the DOM node of the domComponentInstance
  }
}

// ---------------------------- Preact DOM Component -----------------------------------
// * this.currentElement: Has the javascript object with the element information
// * this.hostNode:       Has the actual DOM node
class PreactDOMComponent {
  constructor(element) {
    this.currentElement = element;
  }

  /**
   * Mounts the DOM Component into the container
   * @param container - Where the component should be mounted
   */
  mountComponent(container) {
    const domElement = document.createElement(this.currentElement.type);  // Creates and element of given type
    const text = this.currentElement.props.children;                      // In this case the only accepted type of children is plain text
    const textNode = document.createTextNode(text);                       // creates a text node
    domElement.appendChild(textNode);                                     // Appends the text to the element
    container.appendChild(domElement);                                    // Appends the element to the container

    this.hostNode = domElement; // Saves the DOM node into the Component
    return domElement;          // Returns the DOM node
  }
}

// ---------------------------- Top Level Wrapper -----------------------------------
class TopLevelWrapper {
  constructor(props) {
    this.props = props;
  }

  render() {
    return this.props;
  }
}

// Tests
const MyTitle = Preact.createClass({
  render() {
    return Preact.createElement('h1', null, this.props.message);
  }
});

const MyMessage = Preact.createClass({
  render() {
    if (this.props.asTitle) {
      return (Preact.createElement(MyTitle, { message: this.props.message }));
    }
    else {
      return Preact.createElement('p', null, this.props.message);
    }
  }
})

Preact.render(
  Preact.createElement(MyMessage, { asTitle: true, message: 'this is an h1 message' }),
  document.getElementById('root1')
);

Preact.render(
  Preact.createElement(MyMessage, { asTitle: false, message: 'and this is just a paragraph' }),
  document.getElementById('root2')
);

Preact.render(
  Preact.createElement('button', null, 'i\'m a primitive element'),
  document.getElementById('root3')
);

