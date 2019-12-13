const Preact = {
  createElement(elementType, elementProps, children) {
    const element = {
      type: elementType,
      props: elementProps || {}
    };

    if (children) {
      element.props.children = children;
    }

    return element;
  },

  render(element, container) {
    const wrapperElement = this.createElement(TopLevelWrapper, element);
    const componentInstance = new PreactCompositeComponentWrapper(wrapperElement);
    //const componentInstance = new PreactDOMComponent(element);
    return componentInstance.mountComponent(container);
  },

  createClass(spec) {
    function Constructor(props) {
      this.props = props;
    }

    Constructor.prototype.render = spec.render;

    return Constructor;
  }
}

class PreactCompositeComponentWrapper {
  constructor(element) {
    this._currentElement = element;
  }

  mountComponent(container) {
    const Component = this._currentElement.type;
    const componentInstance = new Component(this._currentElement.props);

    let element = componentInstance.render();

    while(typeof element.type === "function") {
      element = (new element.type(element.props)).render();
    }

    const domComponentInstance = new PreactDOMComponent(element);
    return domComponentInstance.mountComponent(container);
  }
}

// ---------------------------- DOM Component -----------------------------------
class PreactDOMComponent {
  constructor(element) {
    this._currentElement = element;
  }

  mountComponent(container) {
    const domElement = document.createElement(this._currentElement.type);
    const text = this._currentElement.props.children; // At this point assumes the children it actually only text
    const textNode = document.createTextNode(text);
    domElement.appendChild(textNode);
    container.appendChild(domElement);

    this._hostNode = domElement;
    return domElement;
  }

}

// ---------------------------- Top Level Wrapper -----------------------------------
const TopLevelWrapper = function(props) {
  this.props = props;
};

TopLevelWrapper.prototype.render = function() {
  return this.props;
};



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

