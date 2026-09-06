
//===========================
//         IMPORTS
//===========================

/* This code is commented out as it only runs on nodejs server side :(
import * as calc from './calculation.js';
import * as io   from './io.js';
//const calc = require('./calculation.js');
//const io = require('./io.js');
*/

//===========================
//       CONSTANTS
//===========================

const maxCols = 20;
const maxFormNum = 6;
const maxMemoryButtons = 9;
const maxRows = 20;


//===========================
//     GLOBAL VARIABLES
//===========================

var operandQty = 1;
var tied = false; // dimension number controls (row, colss) are not initially tied.


//=============================================================
//
//===================   Event Routines   ======================
//
//=============================================================

function setElementType(char)
{
  optype = char;
}

function setOp(char, num)
{
  op = char;
  updateEigenPairButtonVisibility(1);
  if (num)
    operandQty = num;
  else if(op == 'd' || op == 'e' || op == 'i' || op == 'n' || op == '^' || op == 'r' || op == 't')
    operandQty = 1;
  else
    operandQty = 2;
}

function onMainPageLoad()
{
  console.log("MAIN PAGE LOADED");
  updateEigenPairButtonVisibility(1);
}

function onTiedNumCtrlChanged(isRowChange, parent)
{
  if (! tied) // not tied "rows" and "cols" number controls.
    return;

  if (parent == null)
    parent = document;

  if (isRowChange == true || isRowChange != 0) // Is it a row number change event ?
  {
    parent.getElementById("cols").value = parent.getElementById("rows").value;
  }
  else // Is it a column number change event ?
  {
    parent.getElementById("rows").value = parent.getElementById("cols").value;
  }
}

/*
 * Event triggered when user clicks on a memory recall button.
 * Recalls the matrix from the selected memory slot into form 3/5 (operand 1/2).
 */
function onRecall(operandNo, memNum)
{
  if (operandNo == undefined || operandNo == null || operandNo < 1 || operandNo > 2)
  {
    alertBox("Invalid operand number."); // Form Data inconsistence - Should never happen.
    return
  }

  if (memNum == undefined || memNum == null || memNum < 1 || memNum > maxMemoryButtons)
  {
    alertBox("Invalid memory recall button number."); // Form Data inconsistence - Should never happen.
    return
  }

  let recall_mtx = memoryMatrix[memNum - 1]; // Reference to a memory Matrix object!

  if (recall_mtx == null || recall_mtx.isVoid())
  {
    alertBox("Memory slot " + memNum + " is empty."); // Form Data inconsistence - Should never happen.
    return;
  }

  updateFormMatrix(recall_mtx, operandNo);

  // Enable all the store buttons since memory matrix has just been copied onto the form, right now.
  updateSTOButtonStatus(operandNo);
}

/*
 * Event triggered when user clicks on a memory store button.
 * Stores the matrix from form 3/5 (operand 1/2) or result/result2 into the selected memory slot.
 */
function onStore(operandNo, memNum)
{
  if (operandNo == undefined || operandNo == null || operandNo < 1 || operandNo > 4)
  {
    alertBox("Invalid operand number."); // Form Data inconsistence - Should never happen.
    return
  }

  if (memNum == undefined || memNum == null || memNum < 1 || memNum > maxMemoryButtons)
  {
    alertBox("Invalid memory store button number."); // Form Data inconsistence - Should never happen.
    return
  }

  if (memoryMatrix[memNum - 1] == null)
    memoryMatrix[memNum - 1] = new Matrix(0,0,[]); // get rid of null value and create a new Matrix object.

  let mtx = new Matrix(0,0); // temporary matrix for copy.
  if (operandNo == 1) // first operand
  {
    getOperandMatrix(operand1); // refresh operand 1 from form matrix cells.
    mtx.copyFrom(operand1);
  }
  else if (operandNo == 2) // second operand
  {
    getOperandMatrix(operand2); // refresh operand 2 from form matrix cells.
    mtx.copyFrom(operand2);
  }
  else if (operandNo == 3) // refresh result from form matrix.
  {
    mtx.copyFrom(result);
  }
  else if (operandNo == 4) // refresh second result from form matrix.
  {
    mtx.copyFrom(result2);
  }

//console.log("onStore() - mtx: " + JSON.stringify(mtx)); // TO HEAVY DEBUG ONLY
  memoryMatrix[memNum - 1].copyFrom(mtx);

  /* TO HEAVY DEBUG ONLY
  console.log("memoryMatrix[" + memNum + "] = " + JSON.stringify(memoryMatrix[memNum - 1]));
  console.log("memoryMatrix" + JSON.stringify(memoryMatrix)); // TO REMOVE
  */

  if (operandNo < 3) // only for form 1/3 where Rcl buttons are available.
  {
    btn = document.getElementById("Rcl" + memNum);
    btn.removeAttribute("disabled"); // enable recall button due matrix is just stored and available from memory.
  }
}

function onResultStore(selectorId, memNum)
{
  if (selectorId == undefined || selectorId == null)
  {
    alertBox("Bad selector ID."); // Form Data inconsistence - Should never happen.
    return;
  }

  if (memNum == undefined || memNum == null || memNum < 1 || memNum > maxMemoryButtons)
  {
    alertBox("Invalid memory store button number."); // Form Data inconsistence - Should never happen.
    return;
  }

  let selCtrl = document.getElementById(selectorId);
  if (selCtrl == null || selCtrl == undefined)
  {
    alertBox("Invalid selector ID." + selectorId); // Form Data inconsistence - Should never happen.
    return;
  }

  let resultNo = parseInt(selCtrl.value);
  if (resultNo < 1 || resultNo > 2)
  {
    alertBox("Invalid result number." + resultNo); // Form Data inconsistence - Should never happen.
    return;
  }

  onStore(2 + resultNo, memNum);
}

//=============================================================
//
//================   Navigation Routines   ====================
//
//=============================================================

function goStep1(backward)
{
  if (backward)
  {
    tied = false;
    op = 'd'; // default operation is determinant calculation.
    operandQty = 1;
  }

  resizeCurrentFormColumnToFit(1);

  loadform(1, function () {
    updateEigenPairButtonVisibility(1);
  });
}

function goStep2(backward)
{
  if (backward) // just leaving form3
  {
    updateMemoryButtonVisibility(2);
  }
  else // leaving form1
  {
    zeroThreshold = document.getElementById("txtZeroThreshold").value;
  }


  // Eigenvalue/vectors calculation parameters.
  if (op == 'e' || op == 'g' || op == 'h' || op == 'j' || op == 'q' || op == 's')
  {
    eigenParams = new EigenpairsParameters( document.getElementById("txtVectorialError").value,
                                            document.getElementById("txtScalarError").value,
                                            document.getElementById("txtMaxIterations").value );
  }

  loadform( 2, function () {
    if (backward) // going backward
    {
      document.getElementById("rows").value = operand1.rows;
      document.getElementById("cols").value = operand1.cols;
    }

    if ( op == '^' || op == '\\' || op == 'd' || op == 'e' || op == 'i' ||
         op == 'g' || op == 'h' || op == 'j' || op == 'q' || op == 's') // square matrix is mandatory
    {
      tied = (backward ? false : true);
      document.currentForm.rows.setAttribute("onchange", (backward ? "" : "onTiedNumCtrlChanged(1)"));
      document.currentForm.cols.setAttribute("onchange", (backward ? "" : "onTiedNumCtrlChanged(0)"));
    }

    updateEigenPairButtonVisibility(2);
    document.currentForm.rows.removeAttribute("disabled");
    document.currentForm.cols.removeAttribute("disabled");
  });
}

function goStep3( backward )
{
  if (backward == null || backward == false) // going forward from form2
  {
    operand1.rows = document.getElementById("rows").value;
    operand1.cols = document.getElementById("cols").value;
  }

  let celldims = null;

  loadform( 3, function () {
    let legend = "Rows: " + operand1.rows + ", Columns: " + operand1.cols +
                 " . Total elements: " + operand1.rows * operand1.cols;
    let parent = document.getElementById("matrix");
    document.getElementById("dimensions").innerHTML = legend;
    document.getElementById("operation").innerHTML = "Operation: <b>" + op + "</b>";
    celldims = createInputMatrix(operand1.rows, operand1.cols, parent, backward ? operand1 : null);
    updateMemoryButtonVisibility(3);
  } );
  resizeCurrentFormColumnToFit(3, celldims);
}

function goStep4( backward )
{
  if (backward == null || backward == false) // going forward
  {
    updateMemoryButtonVisibility(4);
    getOperandMatrix(operand1);
  }

  if (operandQty == 1)
  {
    goStep6(); // no more operands are needed.
    return;
  }

  loadform( 4, function () {
    if (backward) // going backward
    {
      document.getElementById("rows").value = operand2.rows;
      document.getElementById("cols").value = operand2.cols;
    }

    if (op == '*')
    {
      document.currentForm.rows.setAttribute("value", operand1.cols);
      document.currentForm.rows.setAttribute("disabled", true);
      operand2.rows = operand1.cols; // mandatory for matrix product
    }
    else if (op == '/')  // op --> A * inv(B)    || op == ''
    {
      document.currentForm.rows.setAttribute("value", operand1.cols);
      document.currentForm.rows.setAttribute("disabled", true);
      document.currentForm.cols.setAttribute("value", operand1.cols);
      document.currentForm.cols.setAttribute("disabled", true);
      operand2.cols = operand2.rows = operand1.cols; 
    }
    else if (op == '\\' ) // independent term vector should adjust to ecuation system matrix.
    {
      document.currentForm.rows.setAttribute("value", operand1.cols);
      document.currentForm.rows.setAttribute("disabled", true);
      document.currentForm.cols.setAttribute("value", "1");
      document.currentForm.cols.setAttribute("disabled", true);
      result.rows = operand1.cols;
      result.cols = 1; // just a vector of incognita values.
    }
  } );
}

function goStep5( backward )
{
//console.log("goStep5() - entry point."); // DEBUG ONLY
  if (backward == null || backward == false) // going forward
  {
    operand2.rows = document.getElementById("rows").value;
    operand2.cols = document.getElementById("cols").value;
  }

  let celldims = null;

  loadform( 5, function () {
//  console.log("goStep5() - callback entry point."); // DEBUG ONLY
    let legend = "Rows: " + operand2.rows + ", Columns: " + operand2.cols + " . Total elements: " + operand2.rows * operand2.cols;
    let parent = document.getElementById("matrix");
    document.getElementById("dimensions").innerHTML = legend;
    document.getElementById("operation").innerHTML = "Operation: <b>" + op + "</b>";
    celldims = createInputMatrix(operand2.rows, operand2.cols, parent, backward ? operand2 : null);
    updateMemoryButtonVisibility(5);
//  console.log("goStep5() - callback exit point."); // DEBUG ONLY
  } );
  resizeCurrentFormColumnToFit(5, celldims);
//console.log("goStep5() - exit point."); // DEBUG ONLY
}

function goStep6()
{
//console.log("goStep6() - entry point."); // DEBUG ONLY

  if (operandQty > 1)
    getOperandMatrix(operand2);

  let celldims = null;

  loadform( 6, function () {
    document.getElementById("result").innerHTML = "";
    document.getElementById("result2").innerHTML = "";
    document.getElementById("operation").innerHTML = "Operation: <b>" + op + "</b>";

    calculateResult (
      function () {   // Successful result callback
        let legend = "Rows: " + result.rows + ", Columns: " + result.cols + " . Total elements: "
                   + result.rows * result.cols;
        document.getElementById("dimensions").innerHTML = legend;
        document.getElementById("lbl-result").innerHTML = (resultLabel == null ? "" : resultLabel);
        document.getElementById("lbl-result2").innerHTML = (resultLabel2 == null ? "" : resultLabel2);

        celldims = printMatrix(result, document.getElementById("result"));
        if (resultLabel2)
          printMatrix(result2, document.getElementById("result2"), 2);
        else
          document.getElementById("result2").innerHTML = "";

        resizeCurrentFormColumnToFit(6, celldims);
        conditionalResultSelectorEnable();
      },
      function (code, explanation, serverMsg) {   // Error callback
        let error = "Error getting the result.";
        if (code != null) error += (" Error code: " + code + '.');
        if (explanation != null && explanation != "")
          error += (" Explanation: " + explanation + '.');
        if (serverMsg != null) error += ("<br />" + serverMsg);
        document.getElementById("result").innerHTML = error;
        document.getElementById("Copy2Clipboard").disabled = true;
        document.getElementById("Save_Matrix1").disabled = true;
        document.getElementById("Memory").disabled = true;
        document.getElementById("MemoryAccess").style.display = "none";
        document.getElementById("MemoryAccess").style.visibility = "hidden";
      }
    );
  });

//console.log("goStep6() - exit point."); // DEBUG ONLY
}

/* Reinitiates the whole process from step 1, erasing just the form6's matrices.
 */
function allAgain()
{
  document.getElementById("result").innerHTML = "";
  document.getElementById("result2").innerHTML = "";
  goStep1(true)
}

