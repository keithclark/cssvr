import Vector3 from '../math/vector3';

export default class Matrix4 {

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
      )
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
};
