import Input from './input';

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
  startX = e.pageX
  startY = e.pageY
}


function mouseUpHandler(e) {
  window.removeEventListener('mousemove', this.mouseMoveHandler);
  window.removeEventListener('mouseup', this.mouseUpHandler);
}


function selectStartHandler(e) {
  e.preventDefault();
}

export default class MouseInput extends Input {

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
};
