import Viewport from './viewport';


export default class StereoViewport extends Viewport {

  constructor(root) {
    super(root);
    this._separation = 6.4;
  }


  _inputSyncHandler() {
    this.rightNode.value = this.value;
    this.rightNode.checked = this.checked;
  }


  get separation() {
    return this._separation;
  }


  set separation(value) {
    return this._separation = value;
  }


  addNodesToViewport() {
    super.addNodesToViewport();
    let rootElement = this.rootElement;

    // create a copy of the main tree, linking each node to it's
    // counterpart.
    let tree = document.createDocumentFragment();
    let walker = document.createTreeWalker(rootElement);
    let node;

    while (node = walker.nextNode()) {
      let clone = node.cloneNode();
      let parentElement = node.parentNode;
      node.rightNode = clone;

      // input elements need `onchange` handlers to sync updates
      if (node instanceof HTMLInputElement) {
        node.addEventListener('change', this._inputSyncHandler);
      }

      if (parentElement.rightNode) {
        parentElement.rightNode.appendChild(clone);
      } else {
        tree.appendChild(clone);
      }
    }

    // append the new DOM to the page
    rootElement.appendChild(tree);
    rootElement.classList.add('vr--stereoscopic');
    rootElement.firstElementChild.classList.add('vr__eye--left');
    rootElement.lastElementChild.classList.add('vr__eye--right');
    rootElement.lastElementChild.setAttribute('aria-hidden', 'true');

    // Use mutation observers to sync the left and right DOM trees
    // TODO:PERF: split this out into VR / author observers.
    this._mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          let elem = mutation.target;
          let attr = mutation.attributeName;
          if (elem.rightNode) {
            // TODO:BUG: there's a strange edge case that triggers this 
            // observer continously when looking
            elem.rightNode.setAttribute(attr, elem.getAttribute(attr))
          }
        }
      });
    });
    
    this._mutationObserver.observe(rootElement, {
      attributes: true,
      childList: false,
      characterData: true,
      subtree: true
    });
  }


  removeNodesFromViewport() {
    let node;
    let rootElement = this.rootElement;
    let walker = document.createTreeWalker(rootElement);

    this._mutationObserver.disconnect();
    rootElement.removeChild(rootElement.lastElementChild);
    rootElement.classList.remove('vr--stereoscopic');

    while (node = walker.nextNode()) {
      if (node instanceof HTMLInputElement) {
        node.removeEventListener('change', this._inputSyncHandler);
      }
      delete node.rightNode;
    }

    delete this._mutationObserver;
    super.removeNodesFromViewport();
  }


  update(camera) {
    let pitch = this._separation / 2;
    let fov = (window.innerWidth / 4 / Math.tan((camera.fov / 2) / 180 * Math.PI)) | 0;
    let transform = 
      `translateZ(${fov - fov / 10}px)` +
      `rotateZ(${camera.rotation.z}deg)` +
      `rotateX(${camera.rotation.x}deg)` +
      `rotateY(${camera.rotation.y}deg)` +
      `translate3d(${-camera.position.x}px,${-camera.position.y}px,${-camera.position.z}px)`;
    this.cameraElement.style.transform = transform;
    this.viewportElement.style.perspective = fov + 'px';
    this.viewportElement.style.perspectiveOrigin = `calc(50% - ${pitch}px) 50%`;
    this.viewportElement.rightNode.style.perspectiveOrigin = `calc(50% + ${pitch}px) 50%`;
    this.cursorElement.style.transform = `translate(-${pitch/2}px, -50%)`;
    this.cursorElement.rightNode.style.transform = `translate(+${pitch/2}px, -50%)`;
  }

};
