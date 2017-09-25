import {VIEWPORT_INIT_DELAY} from './config';


export default class Viewport {

  constructor(root) {
    let vrRootElem = document.createElement('div');
    let eyeElem = document.createElement('div');
    let viewportElem = document.createElement('div');
    let cameraElem = document.createElement('div');
    let cursorElem = document.createElement('div');

    this._root = root;
    this.rootElement = vrRootElem;
    this.cameraElement = cameraElem;
    this.viewportElement = viewportElem;
    this.cursorElement = cursorElem;

    vrRootElem.className = 'vr';
    eyeElem.className = 'vr__eye';
    viewportElem.className = 'vr__viewport';
    cameraElem.className = 'vr__camera';
    cursorElem.className = 'vr__cursor';

    viewportElem.appendChild(cameraElem);
    eyeElem.appendChild(viewportElem);
    eyeElem.appendChild(cursorElem);
    vrRootElem.appendChild(eyeElem);
  }


  addNodesToViewport() {
    while (this._root.hasChildNodes()) {
      this.cameraElement.appendChild(this._root.firstChild);
    }
  }


  removeNodesFromViewport() {
    while (this.cameraElement.hasChildNodes()) {
      this._root.appendChild(this.cameraElement.firstChild);
    }
  }


  enable() {
    this._root.style.display = 'none';
    this.addNodesToViewport();
    this._root.appendChild(this.rootElement);
    
    return new Promise(resolve => {
      setTimeout(() => {
        this._root.style.display = '';
        resolve();
      }, VIEWPORT_INIT_DELAY);
    });
  }


  disable() {
    this._root.style.display = 'none';
    this._root.removeChild(this.rootElement);
    this.removeNodesFromViewport();

    return new Promise(resolve => {
      setTimeout(() => {
        this._root.style.display = '';
        resolve();
      }, VIEWPORT_INIT_DELAY);
    });
  }


  update(camera) {
    let fov = (window.innerWidth / 2 / Math.tan((camera.fov / 2) / 180 * Math.PI)) | 0;
    let transform = 
      `translate3d(-50%,-50%,${fov - fov / 10}px)` +
      `rotateZ(${camera.rotation.z}deg)` +
      `rotateX(${camera.rotation.x}deg)` +
      `rotateY(${camera.rotation.y}deg)` +
      `translate3d(${-camera.position.x}px,${-camera.position.y}px,${-camera.position.z}px)`;
    this.cameraElement.style.transform = transform;
    this.viewportElement.style.perspective = fov + 'px';
  }

};
