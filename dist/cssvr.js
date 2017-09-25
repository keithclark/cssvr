var CSSVR = (function (exports) {
'use strict';

class Vector3 {

  constructor(x = 0, y = 0, z = 0) {
    this.set(x, y, z);
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  mul(v) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  divs(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  }

  muls(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  cross(v) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  normalize() {
    this.divs(this.length());
    return this;
  }

  rotate(v, origin) {
    if (origin) {
      this.sub(origin);
    }
    let x1 = this.x,
      y1 = this.y,
      z1 = this.z,
      angleX = v.x / 2,
      angleY = v.y / 2,
      angleZ = v.z / 2,

      cr = Math.cos(angleX),
      cp = Math.cos(angleY),
      cy = Math.cos(angleZ),
      sr = Math.sin(angleX),
      sp = Math.sin(angleY),
      sy = Math.sin(angleZ),

      w = cr * cp * cy + -sr * sp * -sy,
      x = sr * cp * cy - -cr * sp * -sy,
      y = cr * sp * cy + sr * cp * sy,
      z = cr * cp * sy - -sr * sp * -cy,

      m0 = 1 - 2 * (y * y + z * z),
      m1 = 2 * (x * y + z * w),
      m2 = 2 * (x * z - y * w),

      m4 = 2 * (x * y - z * w),
      m5 = 1 - 2 * ( x * x + z * z),
      m6 = 2 * (z * y + x * w),

      m8 = 2 * (x * z + y * w),
      m9 = 2 * (y * z - x * w),
      m10 = 1 - 2 * ( x * x + y * y);

    this.x = x1 * m0 + y1 * m4 + z1 * m8;
    this.y = x1 * m1 + y1 * m5 + z1 * m9;
    this.z = x1 * m2 + y1 * m6 + z1 * m10;

    if (origin) {
      this.add(origin);
    }
    return this;
  }

  static fromCssValueString(str) {
    let values = str.split(/px\s*/);
    return new Vector3(+values[0], +values[1], +values[2]);
  }

}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EPSILON = 0.000001;

class Ray {

  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
 
  getFaceIntersectionDistance(face) {
		let distance = this.getTriangleIntersectionDistance(face.a, face.b, face.c);
    if (!distance) {
      distance = this.getTriangleIntersectionDistance(face.a, face.c, face.d);
    }
    return distance;
  }

  getFaceIntersectionPoint(face) {
    let distance = this.getFaceIntersectionDistance();
    if (distance) {
      return this.direction.clone().muls(distance).add(this.origin);
    }
  }

  intersectsFace(face) {
		return !!this.getFaceIntersectionDistance;
  }

  // Möller–Trumbore intersection algorithm
  getTriangleIntersectionDistance(v1, v2, v3) {
    let direction = this.direction;
    let e1 = v2.clone().sub(v1);
    let e2 = v3.clone().sub(v1);

    let P = direction.clone().cross(e2);
    let det = e1.dot(P);

    if (det > -EPSILON && det < EPSILON) {
      return null;
    }

    let inv_det = 1 / det;
    let T = this.origin.clone().sub(v1);
    let u = T.dot(P) * inv_det;
    if (u < 0 || u > 1) {
      return null;
    }

    let Q = T.clone().cross(e1);
    let v = direction.dot(Q) * inv_det;
    if (v < 0 || u + v  > 1) {
      return null;
    }

    let t = e2.dot(Q) * inv_det;
    if (t > EPSILON) {
      return t;
    }

    return null;
  }  

}

var Entity = class {

  constructor() {
    this.rotation = new Vector3();
    this.position = new Vector3();
  }

  translate(v) {
    this.position.add(v);
  }

  rotate(v) {
    this.rotation.add(v);
  }

};

class Matrix4 {

  constructor() {
    this.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  set(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
    let elements = this.elements;
    /* row 1 */
    elements[0] = m11;
    elements[4] = m12;
    elements[8] = m13;
    elements[12] = m14;
    /* row 2 */
    elements[1] = m21;
    elements[5] = m22;
    elements[9] = m23; 
    elements[13] = m24;
    /* row 3 */
    elements[2] = m31;
    elements[6] = m32;
    elements[10] = m33;
    elements[14] = m34;
    /* row 4 */
    elements[3] = m41;
    elements[7] = m42;
    elements[11] = m43;
    elements[15] = m44;
  }

  decompose() {
    let elements = this.elements;

    let translateX = elements[3];
    let translateY = elements[7];
    let translateZ = elements[11];

    let rotateX = Math.atan2(elements[9], elements[10]);
    let rotateY = Math.asin(-elements[8]);
    let rotateZ = Math.atan2(elements[4], elements[0]);

    return {
      rotate: new Vector3(rotateX, rotateY, rotateZ),
      translate: new Vector3(translateX, translateY, translateZ)
    };
  }

  static fromCssMatrixString(matrixString) {
    let elements = matrixString.split(/\s*[(),]\s*/).slice(1,-1);
    let matrix = new Matrix4();

    if (elements.length === 6) {
      matrix.set(
        +elements[0], +elements[1], 0, 0,
        +elements[2], +elements[3], 0, 0, 
        0, 0, 1, 0,
        +elements[4], +elements[5], 0, 1
      );
    } else if (elements.length === 16) {
      matrix.set(
        +elements[0], +elements[1], +elements[2], +elements[3],
        +elements[4], +elements[5], +elements[6], +elements[7],
        +elements[8], +elements[9], +elements[10], +elements[11],
        +elements[12], +elements[13], +elements[14], +elements[15]
      );
    }
    return matrix;
  }
}

class Face extends Entity {

  constructor(a, b, c, d) {
    super();
    this.a = a || new Vector3();
    this.b = b || new Vector3();
    this.c = c || new Vector3();
    this.d = d || new Vector3();
    this.normal = new Vector3(0, 0, 1);
    this.origin = new Vector3();
    this.canInteract = true;
  }

  translate(v) {
    super.translate(v);
    this.a.add(v);
    this.b.add(v);
    this.c.add(v);
    this.d.add(v);
  }

  rotate(v, origin) {
    super.rotate(v);
    this.a.rotate(v, origin);
    this.b.rotate(v, origin);
    this.c.rotate(v, origin);
    this.d.rotate(v, origin);
    this.normal.rotate(v);
  }

  clone() {
    let clone = new Face();
    clone.a.set(this.a.x, this.a.y, this.a.z);
    clone.b.set(this.b.x, this.b.y, this.b.z);
    clone.c.set(this.c.x, this.c.y, this.c.z);
    clone.d.set(this.d.x, this.d.y, this.d.z);
    clone.origin.set(this.origin.x, this.origin.y, this.origin.z);
    clone.position.set(this.position.x, this.position.y, this.position.z);
    clone.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    clone.canInteract = this.canInteract;
    return clone;
  }

  setFromElement(elem) {
    let top = elem.offsetTop;
    let left = elem.offsetLeft;
    let right = left + elem.offsetWidth;
    let bottom = top + elem.offsetHeight;
    let style = getComputedStyle(elem);
    let transformStyle = style.transform;
    let transformOrigin = style.transformOrigin;
    let canInteract = style.pointerEvents !== 'none';
    let origin = Vector3.fromCssValueString(transformOrigin);
    let matrix = Matrix4.fromCssMatrixString(transformStyle);
    let transform = matrix.decompose();

    this.canInteract = canInteract;
    this.a.set(left, top, 0);
    this.b.set(right, top, 0);
    this.c.set(right, bottom, 0);
    this.d.set(left, bottom, 0);
    this.origin = origin;

    if (transform.rotate.x || transform.rotate.y || transform.rotate.z) {
      this.rotate(transform.rotate, origin);
    }

    this.translate(transform.translate);
  }


  static fromElement(elem) {
    let face = new Face();
    face.setFromElement(elem);
    return face;
  }

}

var Camera = class extends Entity {

  constructor() {
    super();
    this.fov = 70;
  }

};

// Length of time that must pass before a `:hover` is considered
// to be a click
const HOVER_CLICK_DURATION = 1700;

// Length of time required for the VR DOM to be built. During this
// period the screen will be blank.
const VIEWPORT_INIT_DELAY = 250;

class Viewport {

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

}

class StereoViewport extends Viewport {

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
            elem.rightNode.setAttribute(attr, elem.getAttribute(attr));
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

}

class Input {

  constructor() {
    this.rotation = new Vector3();
  }

}

let startX = 0;
let startY = 0;


function mouseDownHandler(e) {
  startX = e.pageX;
  startY = e.pageY;
  window.addEventListener('mousemove', this.mouseMoveHandler);
  window.addEventListener('mouseup', this.mouseUpHandler);
}


function mouseMoveHandler(e) {
  let dx = e.pageX - startX;
  let dy = e.pageY - startY;
  dx /= 5;
  dy /= 5;
  this.rotation.x += dy;
  this.rotation.y-= dx;
  this.rotation.x = Math.max(-90, Math.min(90, this.rotation.x));
  startX = e.pageX;
  startY = e.pageY;
}


function mouseUpHandler(e) {
  window.removeEventListener('mousemove', this.mouseMoveHandler);
  window.removeEventListener('mouseup', this.mouseUpHandler);
}


function selectStartHandler(e) {
  e.preventDefault();
}

class MouseInput extends Input {

  constructor() {
    super();
    this.mouseDownHandler = mouseDownHandler.bind(this);
    this.mouseMoveHandler = mouseMoveHandler.bind(this);
    this.mouseUpHandler = mouseUpHandler.bind(this);
    this.selectStartHandler = selectStartHandler.bind(this);
  }

  start() {
    window.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('selectstart', this.selectStartHandler);
  }

  stop() {
    window.removeEventListener('mousedown', this.mouseDownHandler);
    window.removeEventListener('selectstart', this.selectStartHandler);
  }
}

function deviceOrientationHandler(e) {
  if (!e.alpha && !e.beta && !e.gamma) {
    return;
  }
  let orientation = getRotationFromEulerAngles(e.alpha, e.beta, e.gamma);
  this.rotation.x = orientation.elevation;
  this.rotation.y = orientation.heading;
  this.rotation.z = orientation.tilt;
}


const getRotationFromEulerAngles = (alpha, beta, gamma) => {

  // Convert degrees to radians
  let alphaRad = alpha * DEG_TO_RAD;
  let betaRad = beta * DEG_TO_RAD;
  let gammaRad = gamma * DEG_TO_RAD;

  // Calculate equation components
  let cA = Math.cos(alphaRad);
  let sA = Math.sin(alphaRad);
  let cB = Math.cos(betaRad);
  let sB = Math.sin(betaRad);
  let cG = Math.cos(gammaRad);
  let sG = Math.sin(gammaRad);
  let xrC = cB * sG;
  let yrC = -sB;
  let zrA = -sA * sB * cG - cA * sG;
  let zrB = cA * sB * cG - sA * sG;
  let zrC = cB * cG;
  let heading = Math.atan(zrA / zrB);
  
  // Convert to a whole unit circle
  if (zrB < 0) {
    heading += Math.PI;
  } else if (zrA < 0) {
    heading += 2 * Math.PI;
  }
  
  // Calculate elevation
  let elevation = Math.PI / 2 - Math.acos(-zrC);
  
  // Calculate tilt
  let cH = Math.sqrt(1 - (zrC * zrC));
  let tilt = Math.acos(-xrC / cH) * Math.sign(yrC);

  return {
    heading: heading * RAD_TO_DEG - 90,
    elevation: elevation * RAD_TO_DEG,
    tilt: tilt * RAD_TO_DEG
  };
};


class OrientationInput extends Input {

  constructor() {
    super();
    this.handler = deviceOrientationHandler.bind(this);
  }

  start() {
    window.addEventListener('deviceorientation', this.handler);
  }

  stop() {
    window.removeEventListener('deviceorientation', this.handler);
  }

}

const RE_MEDIA_QUERY_BLOCK = /@media\s.*?(?=\{)+/g;
const VR_CSS_TEXT = '.vr{position:fixed;top:0;left:0;bottom:0;right:0;display:flex}.vr__eye{flex:1;overflow:hidden;position:relative;height:100%}.vr__viewport{height:100%;position:relative}.vr__camera,.vr__cursor{position:absolute;top:50%;left:50%;transform-style:preserve-3d;transform:translate(-50%,-50%)}.vr__cursor{padding:5% 5% 0 0;border:.6vw solid #0c0;border-radius:50%;z-index:1}.vr__cursor--hover{animation:cursor 1s .5s forwards}.vr--stereoscopic .vr__cursor{border-width:.3vw}@keyframes cursor{0%{border-color:#0c0}25%{border-top-color:red;border-right-color:#0c0;border-bottom-color:#0c0;border-left-color:#0c0}50%{border-top-color:red;border-right-color:red;border-bottom-color:#0c0;border-left-color:#0c0}75%{border-top-color:red;border-right-color:red;border-bottom-color:red;border-left-color:#0c0}100%{border-top-color:red;border-right-color:red;border-bottom-color:red;border-left-color:red}}';

let vrStylesheet;

const replaceMediaType = (mq, oldMediaType, newMediaType) => {
  let re = new RegExp('(^|,\\s+)' + oldMediaType + '(?=\\s|$)', 'g');
  return mq.replace(re, '$1' + newMediaType);
};


const enableVrMediaType = mq => {
  mq = replaceMediaType(mq, 'screen', 'screen-cssvr-disabled');
  mq = replaceMediaType(mq, 'cssvr', 'screen');
  return mq;
};


const disableVrMediaType = mq => {
  mq = replaceMediaType(mq, 'screen', 'cssvr');
  mq = replaceMediaType(mq, 'screen-cssvr-disabled', 'screen');
  return mq;
};


const enableVrMediaAtRule = atRule => {
  return '@media ' + enableVrMediaType(atRule.substr(7));
};


const disableVrMediaAtRule = atRule => {
  return '@media ' + disableVrMediaType(atRule.substr(7));
};


const applyVrStyles = cssText => {
  cssText = cssText.replace(RE_MEDIA_QUERY_BLOCK, enableVrMediaAtRule);
  cssText = cssText.replace(/:hover/g, '.vr__selection');
  return cssText;
};


const removeVrStyles = cssText => {
  cssText = cssText.replace(RE_MEDIA_QUERY_BLOCK, disableVrMediaAtRule);
  cssText = cssText.replace(/\.vr__selection/g, ':hover');
  return cssText;
};


const querySelector = selectorText => {
  return Array.from(document.querySelectorAll(selectorText));
};


const toggleVrStyles = (enable) => {

  // add the vr framework styles
  if (enable) {
    if (!vrStylesheet) {
      vrStylesheet = document.createElement('style');
      vrStylesheet.textContent = VR_CSS_TEXT;
    }
    document.body.appendChild(vrStylesheet);
  } else {
    if (vrStylesheet) {
      vrStylesheet.parentElement.removeChild(vrStylesheet);
    }
  }

  // update inline stylesheets
  querySelector('style').forEach(elem => {
    if (enable) {
      elem.textContent = applyVrStyles(elem.textContent);
    } else {
      elem.textContent = removeVrStyles(elem.textContent);
    }
  });

  // update linked stylesheets
  querySelector('link[rel=stylesheet][media]').forEach(elem => {
    if (enable) {
      elem.media = enableVrMediaType(elem.media);
    } else {
      elem.media = disableVrMediaType(elem.media);
    }
  });
};


const enableVrStyles = () => {
  toggleVrStyles(true);
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
};


const disableVrStyles = () => {
  toggleVrStyles(false);
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
};

const STATE_STOPPED = 0;
const STATE_STARTING = 1;
const STATE_RUNNING = 2;
const STATE_STOPPING = 3;


let camera;
let viewport;
let currentSelection;
let currentSelectionTimer;
let mouseController;
let orientationController;
let state = STATE_STOPPED;


const getSelection = (ray, rootElem) => {
  let map = new WeakMap();
  let doc = rootElem.ownerDocument;
  let walker = doc.createTreeWalker(rootElem, NodeFilter.SHOW_ELEMENT);
  let selectedElement = null;
  let selectedDistance = Number.MAX_VALUE;
  let elem;

  while (elem = walker.nextNode()) {
    let face = Face.fromElement(elem);

    map.set(elem, { 
      origin: face.origin.clone(),
      position: face.position.clone(),
      rotation: face.rotation.clone()
    });

    // walk up the DOM tree and apply ancestor transforms to this
    // element so we can determine the position of its vertices.
    let parentElem = elem.parentElement;
    while (parentElem !== rootElem) {
      let parentFace = map.get(parentElem);
      face.rotate(parentFace.rotation, parentFace.origin);
      face.translate(parentFace.position);
      parentElem = parentElem.parentElement;
    }

    // don't check for selection if this face isn't interactive 
    if (face.canInteract) {
      // check to see if the ray intersects with this face
      let distance = ray.getFaceIntersectionDistance(face);
      if (distance) {
        if (distance < selectedDistance) {
          selectedDistance = distance;
          selectedElement = elem;
        }
      }
    }
  }
  return selectedElement;
};


const updateSelection = () => {
  // Create a ray to cast from the users eye into the scene and
  // set its direction to match the camera rotation.
  let direction = new Vector3(0, 0, -1);
  let origin = camera.position;
  let cameraDirection = new Vector3(
    camera.rotation.x * -DEG_TO_RAD,
    camera.rotation.y * -DEG_TO_RAD,
    0
  );
  direction.rotate(cameraDirection);

  let ray = new Ray(origin, direction);
  let selectedElement = getSelection(ray, viewport.cameraElement);

  // if the user has a current selection, we need to clear it
  // before selecting a new element.
  if (selectedElement && selectedElement === currentSelection) {
    return;
  }
  //console.log(currentSelection, selectedElement)
  if (currentSelection) {
    // remove the existing hover state styles
    // TODO:PERF - be smarter about this
    let elem = currentSelection;
    while (elem !== viewport.cameraElement) {
      elem.classList.remove('vr__selection');
      elem = elem.parentElement;
    }
    viewport.cursorElement.classList.remove('vr__cursor--hover');
    clearTimeout(currentSelectionTimer);
  }

  // update the current selection
  currentSelection = selectedElement;

  // if we have a selection simulate the `:hover` state by adding
  // a class to the element and it's parents.
  // TODO:PERF - be smarter about this
  if (currentSelection) {
    let elem = currentSelection;
    while (elem !== viewport.cameraElement) {
      elem.classList.add('vr__selection');
      elem = elem.parentElement;
    }

    // if the selected element has a `vr-action` attribute start
    // the user notification cycle and, if the user hovers for
    // long enough, fire a `click` event. Ideally, we wouldn't
    // need the extra attribute but it's not possible to check
    // if an element has event listeners bound to it.
    if (currentSelection.hasAttribute('vr-action')) {
      // defer the style changes until the next frame so the 
      // indicator has a chance to reset
      requestAnimationFrame(() => {
        viewport.cursorElement.classList.add('vr__cursor--hover');
        currentSelectionTimer = setTimeout(() => {
          viewport.cursorElement.classList.remove('vr__cursor--hover');
          currentSelection.click();
        }, HOVER_CLICK_DURATION);
      });
    }
  }
};


const update = () => {
  let rotation = mouseController.rotation.clone();
  rotation.add(orientationController.rotation);
  camera.rotation = rotation;
  viewport.update(camera);
  updateSelection();
};


const loop = () => {
  if (state === STATE_RUNNING) {
    requestAnimationFrame(loop);
    update();
  }
};


const start = (config = {}) => {
  if (state !== STATE_STOPPED) {
    return Promise.reject();
  }

  state = STATE_STARTING;

  let root = config.root || document.body;
  let docRoot = document.documentElement;

  docRoot.style.display = 'none';

  camera = new Camera();
  camera.fov = config.fov || 70;
  camera.position.y = -config.cameraHeight || 0;

  if (config.projection === 'stereo') {
    viewport = new StereoViewport(root);
    viewport.separation = config.stereoPitch;
  } else {
    viewport = new Viewport(root);
  }

  // Allow the mouse to control the scene
  mouseController = new MouseInput();
  mouseController.start();

  // Allow the orientation sensors to control the camera
  orientationController = new OrientationInput();
  orientationController.start();

  return Promise.resolve()
    .then(enableVrStyles)
    .then(() => viewport.enable())
    .then(() => {
      state = STATE_RUNNING;
      loop();
      docRoot.style.display = '';
    });
};


const stop = () => {
  if (state !== STATE_RUNNING) {
    return Promise.reject();
  }

  state = STATE_STOPPING;

  let docRoot = document.documentElement;

  docRoot.style.display = 'none';

  // stop the input controllers
  orientationController.stop();
  mouseController.stop();

  return Promise.resolve()
    .then(disableVrStyles)
    .then(() => viewport.disable())
    .then(() => {
      docRoot.style.display = '';
      state = STATE_STOPPED;
    });
};

exports.start = start;
exports.stop = stop;

return exports;

}({}));
