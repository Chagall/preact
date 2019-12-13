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
    const componentInstance = new PreactDOMComponent(element);
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

Preact.render(
  Preact.createElement('h1', null, 'Hello World!'),
  document.getElementById('root')
);