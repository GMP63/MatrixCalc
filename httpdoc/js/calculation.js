
//=============================================================
//
//===============   Calculation Routines   ====================
//
//=============================================================

//===========================
//         TYPES
//===========================

/*
 * @brief Class representing a matrix, including its dimensions and elements.
 * @details The elements are stored in a single array in row-major order.
 * @class Matrix
 * @version 1.5
 * @date September 2025
 * @author Guillermo M Paris
 */
class Matrix
{
  constructor(nrows, ncols, elementArray)
  {
    this.rows = (nrows == null || nrows == undefined ? 0 : nrows);
    this.cols = (ncols == null || ncols == undefined ? 0 : ncols);
    this.vector = [];
    if (elementArray != undefined && elementArray != null && this.rows * this.cols > 0)
      for(let i = 0; i < nrows * ncols; i++)
        this.vector[i] = elementArray[i];
  }

  copyFrom(mtx)
  {
    if (mtx != undefined && mtx != null)
    {
      this.rows = mtx.rows;
      this.cols = mtx.cols;
      this.vector = [];
      if (mtx.vector != undefined && mtx.vector != null && mtx.rows * mtx.cols > 0)
        for(let i = 0; i < mtx.rows * mtx.cols; i++)
          this.vector[i] = mtx.vector[i];
    }
  }

  copyTo(mtx)
  {
    if (mtx != undefined && mtx != null)
    {
      mtx.rows = this.rows;
      mtx.cols = this.cols;
      mtx.vector = [];
      if (this.vector != undefined && this.vector != null && this.rows * this.cols > 0)
        for(let i = 0; i < this.rows * this.cols; i++)
          mtx.vector[i] = this.vector[i];
    }
  }

// Not being used currently.
  static staticCopy(mtx1, mtx2)
  {
    mtx2.rows = mtx1.nrows;
    mtx2.cols = mtx1.ncols;
    for (let i = 0; i < mtx1.nrows * mtx1.ncols; i++)
      mtx2.vector[i] = mtx1.vector[i];
  }

  isNull()
  {
    return this.rows == 0 || this.cols == 0 || this.vector.length == 0 ? true : false;
  }

  isVoid()
  {
    if (this.isNull())
      return true;

    for (let i = 0; i < this.vector.length; i++)
    {
      if ( this.vector[i] != null &&
           ( typeof(this.vector[i]) == 'string' && !isBlankString(this.vector[i]) ||
             typeof(this.vector[i]) == 'number' && !isNaN(this.vector[i])) )
        return false; // at least one element is not empty
    }
    return true; // all elements are empty
  }

  isNotEqual(mtx)
  {
    if (mtx == undefined || mtx == null)
      return true;

    if (this.rows != mtx.rows || this.cols != mtx.cols)
      return true;

    for (let i = 0; i < this.vector.length; i++)
    {
      if ( this.vector[i] != mtx.vector[i] )
        return true; // at least one element is different
    }
    return false; // all elements are equal
  }

  isEqual(mtx)
  {
    return !this.isNotEqual(mtx);
  }
} // class Matrix

class EigenpairsParameters
{
  constructor(disc, err, iters)
  {
    this.discrepancy = disc;
    this.scalarError = err;
    this.iterations = iters;
  }

  isNull()
  {
    return this.discrepancy == 0 && this.scalarError == 0 && this.iterations == 0 ? true : false;
  }
}

//===========================
//       CONSTANTS
//===========================

const operandSeparator = '_';


//===========================
//   PUBLIC  VARIABLES
//===========================

var memoryMatrix = [ null, null, null, null,
                     null, null, null, null, null ];
var op = 'd'; // default operation is determinant calculation.
var optype = 'R'; // default operands are real matrixes
var operand1 = new Matrix(0, 0);
var operand2 = new Matrix(0, 0);
var result   = new Matrix(0, 0);
var result2  = new Matrix(0, 0);
var resultLabel = null;
var resultLabel2 = null;
var zeroThreshold = 0;
var eigenParams = new EigenpairsParameters(0, 0, 0);


//===========================
//    PUBLIC   FUNCTIONS
//===========================

var min = function (a, b)
{
  return (a > b ? b : a);
}

var max = function (a, b)
{
  return (a < b ? b : a);
}

var isBlankChar = function (c)
{
    if (c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '\v' || c == '\f')
        return true;
    else
        return false;
}

var isBlankString = function (s)
{
    for (let i = 0; i < s.length; i++)
        if (!isBlankChar(s[i]))
            return false;

    return true;
}

var string_substract = function (s1, s2)
{
  if (s2 == "")
    return s1;
  else if (s1 == "")
    return "";

  return s1.replace(s2, "");
}

/*
  * Main calculation function. It executes the operation selected in global 'op' variable,  using
  * operand1 and operand2 as input matrixes, and storing the result in 'result' matrix, and if necessary,
  * in 'result2' matrix.
  * onSuccess() and onError() are callback functions to be called when the operation is finished,
  * either successfully or with error.
  * Note that some operations are performed directly in this page (like determinant of small
  * matrixes, negation, transposition, addition/substraction and multiplication of real
  * matrixes), while others are requested to the server (like inversion, eigenpairs,
  * Q-R decomposition, and all operations on complex matrixes).
  * In any case, when the operation is finished, onSuccess() or onError() are called.
  * onSuccess() takes the result from the 'result' and 'result2' global variables and prints
  * them on html controls.
  * onError() takes three parameters: http status code, status text, and response text.
  * These functions can be null if not needed.
 */
var calculateResult = function (onSuccess, onError)
{
  let fNotImplemented = function () {
      result = new Matrix( 1, 3, ["NOT", "IMPLEMENTED", "YET"] );
  };

  resultLabel = op + " result:";
  resultLabel2 = null;

  switch (op)
  {
    case 'd':
      calculateDeterminant(onSuccess, onError);
      break;

    case "i":
      resultLabel = "Inverse Matrix";
    case 'e':
    case 'g':
    case 'h':
    case 'j':
    case 'q':
    case 'r':
    case 's':
      requestUnaryOperation(onSuccess, onError); // direct server call, 1 matrix argument
      break;

    case "n":
      negateMatrix(onSuccess, onError);
      break;

    case '^':
      fNotImplemented();
      if(onSuccess) onSuccess();
      break;

    case 't':
      transposeMatrix(onSuccess, onError);
      break;

    case '+':
      add_or_substractMatrices(0, onSuccess, onError);
      break;

    case '-':
      add_or_substractMatrices(1, onSuccess, onError);
      break;

    case '*':
      multiplyMatrices(onSuccess, onError);
      break;

    case 'p':
      resultLabel = "Proyection Matrix";
      requestBinaryOperation(onSuccess, onError); // direct server call, 2 matrix arguments
      break;

    case '\\':
      resultLabel = "Results Vector";
    case '/':
      requestBinaryOperation(onSuccess, onError); // direct server call, 2 matrix arguments
      break;

    case '.':
      innerProduct(onSuccess, onError);
      break;

    case 'X':
      outerProduct(onSuccess, onError);
      break;

    default:
      fNotImplemented();
      if(onSuccess) onSuccess();
      break;
  }
}


//===========================
//   PRIVATE   FUNCTIONS
//===========================

function calculateDeterminant(onSuccess, onError)
{
  if ( (optype != 'R' && optype != 'I') || operand1.rows > 3 )
  {
    requestUnaryOperation(onSuccess, onError); // direct server call, 1 matrix argument
    return; // onSuccess() takes the result from the reply and prints the 1 x 1 matrix on html control
  }

  let d = 0; // determinant

  if (operand1.rows == 3)
  {
    d = ( operand1.vector[0] * operand1.vector[4] * operand1.vector[8] +
          operand1.vector[1] * operand1.vector[5] * operand1.vector[6] +
          operand1.vector[2] * operand1.vector[3] * operand1.vector[7] -
          operand1.vector[2] * operand1.vector[4] * operand1.vector[6] -
          operand1.vector[1] * operand1.vector[3] * operand1.vector[8] -
          operand1.vector[0] * operand1.vector[5] * operand1.vector[7] );
  }
  else if (operand1.rows == 2)
  {
    d = ( operand1.vector[0] * operand1.vector[3] - operand1.vector[1] * operand1.vector[2] );
  }
  else // operand1.rows == 1
  {
    d = operand1.vector[0];
  }

  result = new Matrix( 1, 1, [ d ] );

  if(onSuccess) onSuccess(); // onSuccess() takes the result from the reply and prints the 1 x 1 matrix on html control
}

function negateMatrix(onSuccess, onError)
{
  if (optype != 'R' && optype != 'I')
  {
    requestUnaryOperation(onSuccess, onError); // direct server call, 1 matrix argument.
    return;
  }
  else // real matrix negation is performed in this page
  {
    let nelem = operand1.rows * operand1.cols;
    if (nelem > 0)
    {
      for (let i = 0; i < nelem; i++)
        result.vector[i] = (- operand1.vector[i]);
    }
    result.rows = operand1.rows;
    result.cols = operand1.cols;
  }

  if(onSuccess) onSuccess();
}

function transposeMatrix(onSuccess, onError)
{
  result.vector = []; // clear all previous data
  result.rows = operand1.cols;
  result.cols = operand1.rows;
  let nelem = operand1.rows * operand1.cols;
  if (nelem > 0)
  {
    for (let j = 0; j < operand1.cols; j++)
      for (let i = 0; i < operand1.rows; i++)
      {
        // HEAVY DEBUG ONLY
        //console.log("Row: "+ i + ", Col: " + j + ", Value: " + operand1.vector[operand1.cols * i + j]);
        result.vector[operand1.rows * j + i] = operand1.vector[operand1.cols * i + j];
      }
  }

  if(onSuccess) onSuccess();
}

function add_or_substractMatrices(sign, onSuccess, onError)
{
  if (optype != 'R' && optype != 'I')
  {
    requestBinaryOperation(onSuccess, onError); // direct server call, 2 matrix arguments.
    return;
  }

  // Otherwise, real matrix addition/substraction is performed in this page
  let maxrow = max(operand1.rows, operand2.rows);
  let maxcol = max(operand1.cols, operand2.cols);
  for (let i = 0; i < maxrow; i++)
  {
    if (i >= operand1.rows) // row outside the 1st matrix operand coverage
      for (let j = 0; j < maxcol; j++)
      {
        let r = 0;
        let o2 = (j < operand2.cols ? operand2.vector[operand2.cols * i + j] : "");
        if (o2 == "" || isNaN(o2))
        {
          r = (sign == 0 ? o2 : "");
        }
        else // numeric element
        {
          r = (sign == 0 ? 1 : -1) * eval(o2);
        }
        result.vector[maxcol * i + j] = r;
      }
    else if (i >= operand2.rows) // row outside the 2nd matrix operand coverage
      for (let j = 0; j < maxcol; j++)
      {
        let r = 0;
        let o1 = (j < operand1.cols ? operand1.vector[operand1.cols * i + j] : "");
        if (o1 == "" || isNaN(o1))
        {
          r = o1;
        }
        else // numeric element
        {
          r = eval(o1);
        }
        result.vector[maxcol * i + j] = r;
      }
    else
      for (let j = 0; j < maxcol; j++)
      {
        let r = 0;
        let s1 = (j < operand1.cols ? operand1.vector[operand1.cols * i + j] : "");
        let s2 = (j < operand2.cols ? operand2.vector[operand2.cols * i + j] : "");
        let n1 = (j < operand1.cols ? s1 : 0);
        let n2 = (j < operand2.cols ? s2 : 0);
        if (!isNaN(n1) && !isNaN(n2))
          r = (sign == 0 ? eval(n1) + eval(n2) : eval(n1) - eval(n2));
        else
          r = (sign == 0 ? s1 + s2 : string_substract(s1, s2));

        result.vector[maxcol * i + j] = r;
      }
  }

  result.rows = maxrow;
  result.cols = maxcol;

  if(onSuccess) onSuccess();
}

function multiplyMatrices(onSuccess, onError)
{
  if (optype != 'R' && optype != 'I')
  {
    requestBinaryOperation(onSuccess, onError); // direct server call, 2 matrix arguments.
    return;
  }

  // Otherwise, real matrix multiplicaction is performed in this page
  result.vector = []; // clear all previous data
  result.rows = operand1.rows;
  result.cols = operand2.cols;
  for(let i = 0; i < operand1.rows; i++)
    for(let j = 0; j < operand2.cols; j++)
    {
      let sum = 0;
      for(let k = 0; k < operand1.cols; k++)
        sum +=  operand1.vector[operand1.cols * i + k] * operand2.vector[operand2.cols * k + j];

      result.vector[result.cols * i + j] =  sum;
    }

  if(onSuccess) onSuccess();
}

function innerProduct(onSuccess, onError) // dot product between similar row vectors of two different matrices.
{
  if (optype != 'R' && optype != 'I')
  {
    requestBinaryOperation(onSuccess, onError); // direct server call, 2 matrix arguments.
    return;
  }

  // Otherwise, real matrix inner product is performed in this page
  result.vector = [];
  result.rows = min(operand1.rows, operand2.rows);
  result.cols = 1;
  let ncols = min(operand1.cols, operand2.cols);

  for(let i = 0; i < result.rows; i++)
  {
    let sum = 0;
    for(let j = 0; j < ncols; j++)
      sum += operand1.vector[operand1.cols * i + j] * operand2.vector[operand2.cols * i + j];

    result.vector[i] = sum;
  }

  if(onSuccess) onSuccess();
}

function outerProduct(onSuccess, onError)
{
  if (optype != 'R' && optype != 'I')
  {
    requestBinaryOperation(onSuccess, onError); // direct server call, 2 matrix arguments.
    return;
  }

  // Otherwise, real matrix outer product is performed in this page
  result.rows = operand1.rows * operand2.rows;
  result.cols = operand1.cols * operand2.cols;
  let m3 = operand2.cols;
  let m2 = result.cols;
  let m1 = operand2.rows * m2;
  for(let i1 = 0; i1 < operand1.rows; i1++)
    for(let i2 = 0; i2 < operand2.rows; i2++)
      for(let j1 = 0; j1 < operand1.cols; j1++)
        for(let j2 = 0; j2 < operand2.cols; j2++)
          result.vector[m1*i1 + m2*i2 + m3*j1 + j2] = operand1.vector[operand1.cols * i1 + j1] * operand2.vector[operand2.cols * i2 + j2]

  if(onSuccess) onSuccess();
}

/*
  * @brief Requests the server to perform the unary operation 'op' on matrix 'operand1'.
  * @param onSuccess Callback function to be called when the operation is finished successfully.
  * @param onError Callback function to be called when the operation finishes with error.
  *
  * @result The result matrix is stored in 'result' global variable, and the 2nd result matrix (if any) in
  *         'result2' global variable.
  *
  *         For operations returning two result matrices:
  *           R: It is always the main Result matrix in row by row format.
  *
  *         For Q-R decomposition (op == 'r'):
  *           R: Triangular result matrix in row by row format
  *           Q: Orthonormal Quadrature matrix in row by row format
  *         For eigenpairs operations:
  *           R: Eigenvector set colum by colum making the Result matrix.
  *           E: Eigenvalue vector in one column format.
  *
  *           where R, Q and E are positional marks indicating the beginning of each matrix.
  *
  * @details
  *          onSuccess() and onError() are callback functions to be called when the operation is finished,
  *          either successfully or with error.
  *          onSuccess() takes the result from the 'result' and 'result2' global variables and prints
  *          them on html matrix controls.
  *          onError() takes three parameters: http status code, status text, and server response text.
  *          If the server reply does not conform to this format, onError() is called with an
  *          appropriate error message.
  *          These two former functions can be null if not needed.
*/
function requestUnaryOperation(onSuccess, onError)
{
  let replyText = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {

//  console.log("Response: ARRIVED\n"); // HEAVY DEBUG ONLY

    if (this.readyState == 4 && onSuccess)
    {
      if (this.status == 200)
      {
        let posR1 = posR2 = rv = -1; // initial values indicating error
        let markR2 = null; // mark for 2nd result detection
        replyText = this.responseText;
        //("Reply text: " + replyText); // Only for DEBUG
        // The following are the only unary operation returning 2 results matrices.
        if (op == 'r') // Q-R decomposition
        {
          markR2 = "Q ";
          resultLabel = "Upper triangular result Matrix";
          resultLabel2 = "Orthonormal Quadrature Matrix"
        }
        else if (op == 'e' || op == 'g' || op == 'h' || op == 'j' || op == 'q' || op == 's') // eigenpairs
        {
          markR2 = "E ";
          resultLabel = "Matrix of Eigenvectors";
          resultLabel2 = "Vector of Eigenvalues";
        }

        posR1 = replyText.indexOf("R ");

        if (markR2 != null)
        {
          posR2 = replyText.indexOf(markR2);
          if (posR2 >= 0 && posR1 >= 0 && posR2 < posR1) // validate server reply
          {
            rv = parseMatrix(replyText.substring(posR2 + 2, posR1), result2); // "Extra-result" mark removed
          }
          else rv = eMalformedServerReply;
        }
        else rv = eOk;

        if (rv == eOk)
        {
          rv = parseMatrix(replyText.substring(posR1 + 2), result); // result mark removed
          if (rv != eOk)
            console.log("Parsing ERROR #" + rv + ", result matrix: " + JSON.stringify(result));
          onSuccess();
        }
        else
        {
          console.log("Server reply: " + replyText); // Only for DEBUG
          let error = "Error parsing the result matrix response: #" + rv;
          console.log(error);
          if (onError) onError(this.status, "Server replied OK.", error);
        }
      }
      else if (onError) onError(this.status, this.statusText, this.responseText);
    }
  };

  let body = ""; // POST request body

  if (zeroThreshold != 0)
    body =  "-z" + zeroThreshold + operandSeparator;

  if (!eigenParams.isNull())
  {
    if (eigenParams.discrepancy)
      body +=  "-D" + eigenParams.discrepancy + operandSeparator;
    if (eigenParams.scalarError)
      body += "-S" + eigenParams.scalarError + operandSeparator;
    if (eigenParams.iterations)
      body += "-i" + eigenParams.iterations + operandSeparator;
  }

  body += optype + operandSeparator + op + operandSeparator;
  body += serializeMatrix(operand1);
  console.log("POST Payload: " + body); // Only for DEBUG
  xhttp.open("POST", "/", true);
  xhttp.send(body);
}

/*
 * @brief Requests the server to perform the binary operation 'op' on matrixes 'operand1' and
 * 'operand2'.
 * @param onSuccess Callback function to be called when the operation is finished successfully.
 * @param onError   Callback function to be called when the operation finishes with error.
 * @result The result matrix is stored in 'result' global variable.
 *
 * @details
 * onSuccess() and onError() are callback functions to be called when the operation is finished,
 * either successfully or with error.
 * onSuccess() takes the result from the 'result' global variable and prints them on html
 * controls.
 * onError() takes three parameters: http status code, status text, and server response text.
 * These functions can be null if not needed.
 * The server reply is expected to be in the form:
 * R: Result matrix in row by row format
 * where R is a position mark indicating the beginning of the result matrix in the reply message.
*/
function requestBinaryOperation(onSuccess, onError)
{
  let replyText = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && onSuccess)
    {
      if (this.status == 200)
      {
        replyText = this.responseText;
        let rv = parseMatrix(replyText.replace("R ", ""), result); // result mark removed
        if (rv == eOk)
        {
          //console.log("Result: " + JSON.stringify(result)); // Only for DEBUG
          onSuccess();
        }
        else
        {
          console.log("Server reply: " + replyText);
          let error = "Error parsing the result matrix response: #" + rv;
          console.log(error);
          if (onError) onError(this.status, "Server replied OK.", error);
        }
      }
      else if (onError) onError(this.status, this.statusText, this.responseText);
    }
  };

  let body = ""; // POST request body

  if (zeroThreshold != 0)
    body =  "-z" + zeroThreshold + operandSeparator;

  body += optype + operandSeparator + op + operandSeparator;
  body += serializeMatrix(operand1);
  body += operandSeparator;
  body += serializeMatrix(operand2);
  console.log("POST Payload: " + body); // Only for DEBUG
  xhttp.open("POST", "/", true);
  xhttp.send(body);
}

/*

function fileToText(file, callback)
{
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = () => {
    callback(reader.result);
  };
}

// This code is commented out as it only runs on nodejs server side :(
export {
  op,
  operand1,
  operand2,
  result,
  min,
  max,
  string_substract,
  calculateResult
};

*/

