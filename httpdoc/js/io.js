
//===========================
//       CONSTANTS
//===========================

const eOk = 0;
const eNoError = 0;
const eAnotherOpenHeader = 1;
const eNoOpenHeader = 2;
const eAnotherCloseHeader = 3;
const eIncompleteHeader = 4;
const eAnotherOpenData = 5;
const eNoOpenData = 6;
const eAnotherCloseData = 7;
const eWrongSeparatorPosition = 8;
const eNotValidChar = 9;
const eMissingDelimiter = 10;
const eUnknownHeaderSeparator = 11;
const eInvalidOrNullHeaderParam = 12;
const eInsufficientData = 13;
const eTooMuchData = 14;
const eUnknownDataSeparator = 15;
const eInvalidDataParam = 16;
const eMalformedServerReply = 99;
const eErrorQty = 18;

const MATRIX_DIR_ID = 0;

const celB = 8;             // input number Cell Border:  Always the same.
const celH = 25;            // Cell Height:  Always the same, no matter the data type or in/out.
const celWinpReal = 114;    // real number input Cell Width.
const celWinpComplex = 160; // complex number input Cell Width.
const celWresReal = 114;    // real number result Cell Width.
const celWresComplex = 250; // complex number result Cell Width.

const minHeight = 360;    // min everything vertical height.
const minWidth = 360;     // min main column (left) horizontal width.
const iniParamColWidth = 120; // initial parameter column (right) horizontal width.
const rightMargin = 100;  // right margin

const pasteMatrixHere = "Paste Matrix here.";
const MATRIX_WRAPPER_ID = "MTXWrapper";
const MATRIX_WRAPPER_NAME = "ResultMatrix";

const aParsingErrors = [
  /*  0 */ "this is not an error",
  /*  1 */ "another open header delimiter found.",
  /*  2 */ "open header delimiter was never been found.",
  /*  3 */ "another close header delimiter found.",
  /*  4 */ "incomplete header found before data.",
  /*  5 */ "another open data delimiter found.",
  /*  6 */ "open data delimiter was never been found.",
  /*  7 */ "another close data delimiter found.",
  /*  8 */ "invalid separator position",
  /*  9 */ "invalid character.",
  /* 10 */ "missing delimiter(s)",
  /* 11 */ "unknown header separator.",
  /* 12 */ "invalid or null header parameter.",
  /* 13 */ "insufficient data elements.",
  /* 14 */ "too much data elements.",
  /* 15 */ "unknown data separator.",
  /* 16 */ "could not understand data element.",
  /* 99 */ "malformed server reply."
];

const vectorDelimiter = {
  openHeader:'(', closeHeader:')', openData:'{', closeData:'}', separator:','
};


//===========================
//    LOCAL DATA TYPES
//===========================

class SerializedMatrixParams
{
  constructor(hdrStart = 0, hdrEnd = 0, datStart = 0, datEnd = 0)
  {
    this.headerStart = hdrStart;
    this.headerEnd = hdrEnd;
    this.dataStart = datStart;
    this.dataEnd = datEnd;
    this.dimCount = 1;
    this.dataCount = 1;
  }
}

class TextCtrlDimensions
{
  constructor(size, width, height = 0)
  {
    this.size = size;
    this.width = width;
    this.height = height;
  }
}


//=============================================================
//
//============= Public Input / Output Routines   ==============
//
//=============================================================

var alertBox = function (message) {
  console.log(message);
  alert(message);
};

//
//=================   Form Manipulation   =====================
//

/*
 * Loads the form<No>.html into the currentForm div, replacing its content.
 * This is carried out using AJAX.
 */
var loadform = function (formNum, callback)
{
  if (formNum < 1 || formNum > maxFormNum) return;

  let formName = "form" + formNum + ".html";
  let xhr = new XMLHttpRequest(); // AJAX
  xhr.open('POST', formName); // AJAX
  xhr.onload = function () {  // AJAX
    document.getElementById("currentForm").outerHTML = this.response;
    if (callback != null && typeof callback == "function")
      callback();
  };
  xhr.send();
}

var clearForm = function (id)
{
  if (id == null || id == "")
    return false;

  let form = document.getElementById(id);
  if (form == null)
    return false;

  form.innerHTML = "";
  return true;
}

var resizeCurrentFormColumnToFit = function (formNo, textCellDims = null)
{
  const iniCntWidth = minWidth + iniParamColWidth; // Initial container and main-row width.
  let colHeight = minHeight; // Default initial dimension.
  let colWidth = minWidth;
  let celW = 0
  let mtxH = 0;
  let mtxW = 0;
  if (formNo == 3 || formNo == 5)
  {
    const nrows = (formNo == 3 ? operand1.rows : operand2.rows);
    const ncols = (formNo == 3 ? operand1.cols : operand2.cols);
    celW = (optype == 'C' ? celWinpComplex : celWinpReal); // = 160 or 114 Defaults by now.
    mtxH = nrows * celH;
    mtxW = ncols * celW;
    if (textCellDims != null)
    {
      let colW = 0;
      for(let i = 0; i < ncols; i++)
      {
        colW += (textCellDims[i].width + 1); // precise width + 1 pixel margin
      }
      celW = Math.ceil(colW / ncols);
      mtxW = colW;
    }

    colHeight = mtxH + minHeight;
    colWidth = (mtxW > minWidth ? mtxW + rightMargin : minWidth);
  }
  else if (formNo == 6)
  {
    celW = (optype == 'C' ? celWresComplex : celWresReal); // = 250 or 114 Defaults by now.
    mtxH = result.rows * celH;
    mtxW = result.cols * celW;
    if (textCellDims != null)
    {
      let colW = 0;
      for(let i = 0; i < result.cols; i++)
      {
        colW += (textCellDims[i].width + 1); // precise width + 1 pixel margin
      }
      celW = Math.ceil(colW / result.cols);
      mtxW = colW;
    }

    colHeight = 2 * mtxH + minHeight; // eigenvectors & eigenvalues below ==> * 2
    colWidth = (mtxW > minWidth ? mtxW + rightMargin : minWidth);
  }

  document.getElementById("main-container").style.height = "" + colHeight + "px";
  document.getElementById("main-container").style.width = "" + (formNo == 1 ? iniCntWidth : colWidth) + "px";
  document.getElementById("main-row").style.height = "" + colHeight + "px";
  document.getElementById("main-row").style.width = "" + (formNo == 1 ? iniCntWidth : colWidth) + "px";
  document.getElementById("param-col").style.height = "" + colHeight + "px";
  document.getElementById("main-col").style.height = "" + colHeight + "px";
  document.getElementById("main-col").style.width = "" + colWidth + "px";
//console.log("rows: " + (mtxH/celH) + " , mtxH: " + mtxH + " , colHeight = " + colHeight); // DEBUG
//console.log("cols: " + (mtxW/celW) + " , mtxW: " + mtxW + " , colWidth = " + colWidth); // DEBUG
}

var updateEigenPairButtonVisibility = function (formNo)
{
  if (formNo > 1)
  {
    document.getElementById("eigenparams").style.display = "none";
    document.getElementById("elemtype").style.display = "none";
    document.getElementById("eigenparams").style.visibility = "hidden";
    document.getElementById("elemtype").style.visibility = "hidden";
    document.getElementById("param-col").style.width = "0px";
  }
  else // first page
  {
    let idx = 0;
    let display = "none";
    let visibility = "hidden";
    let elementType = document.getElementById("elemtype");
    let selectEigenMethod = document.getElementById("method");

    elementType.style.display = "block";
    elementType.style.visibility = "visible";

    if (op == 'e' || op == 'g' || op == 'h' || op == 'q' || op == 's')
    {
      display = "block";
      visibility = "visible";
      document.getElementById("operation").selectedIndex = 1;

      if (op == 'e') idx = 0;
      else if (op == 'q') idx = 1;
      else if (op == 'h') idx = 2;
      else if (op == 'g') idx = 3;
      else if (op == 's') idx = 4;

      selectEigenMethod.selectedIndex = idx;
    }

    document.getElementById("param-col").style.height = "" + minHeight + "px";
    document.getElementById("param-col").style.width = "" + iniParamColWidth + "px";
    document.getElementById("eigenmethod").style.display = display;
    document.getElementById("eigenparams").style.display = display;
    document.getElementById("eigenmethod").style.visibility = visibility;
    document.getElementById("eigenparams").style.visibility = visibility;
  }
}

var widgetEnable = function (id, enable)
{
  let widget = document.getElementById(id);
  if (widget == null)
  {
    console.log("widgetEnable() - ERROR: No such widget id: " + id);
    return false; // no such widget found
  }

  if (enable)
    widget.removeAttribute("disabled");
  else
    widget.setAttribute("disabled", true);
  return true;
}

var updateRCLButtonStatus = function ()
{
  for (i = 0; i < maxMemoryButtons; i++)
  {
    memmtx = memoryMatrix[i];
    btnname = "Rcl" + (i + 1);
    btn = document.getElementById(btnname);
    if (btn == undefined || btn == null)
    {
      console.log("ERROR: No button " + btnname);
      return;
    }

    if (memmtx == null || memmtx.isVoid())
    {
    //console.log(btnname + " disabled."); // HEAVY DEBUG ONLY
      btn.setAttribute("disabled", true);
    }
    else
    {
    //console.log(btnname + " enabled."); // HEAVY DEBUG ONLY
      btn.removeAttribute("disabled");
    }
  }
}

var updateSTOButtonStatus = function (id)
{
  let empty = null;
  let mtx = null;

  if (id < 1 || id > 4) return; // bad id parameter

  if (id < 3)
  {
    mtx = (id == 1 ? operand1 : operand2);
    getOperandMatrix(mtx); // refresh operand 1/2 from form.
  }
  else
  {
    mtx = (id == 3 ? result : result2);
  }

  empty = mtx.isVoid();
  for (i = 0; i < maxMemoryButtons; i++)
  {
    btnname = "Sto" + (i + 1);
    const btn = document.getElementById(btnname);
    if (btn == undefined || btn == null)
    {
      console.log("ERROR: No button " + btnname);
      return;
    }

    if (empty)
    {
//    console.log(btnname + " form/result empty disabled."); // TO DEBUG ONLY
      btn.disabled = true;
      continue; // no data to save
    }

    if (mtx.isVoid())
    {
//    console.log(btnname + " operand/result empty disabled."); // TO DEBUG ONLY
      btn.disabled = true;
      continue; // no data to save
    }

    memmtx = memoryMatrix[i]; // get the actual memory matrix to be overwritten.
    if (memmtx == null || memmtx.isNotEqual(mtx))
    {
//    console.log(btnname + " enabled."); // TO DEBUG ONLY
      btn.removeAttribute("disabled");
    }
    else
    {
//    console.log(btnname + " equal matrices, no need to write. Disabled."); // TO DEBUG ONLY
      btn.disabled = true;
    }
  }
}

var toggle = false; // toggle for memory buttons visibility.

var updateMemoryButtonVisibility = function (formNo)
{
  let display =  "none";
  let visibility = "hidden";
  let visible = false;

  if (formNo == 1)
  {
    toggle = false;
    return; // starting application with no visible memory buttons
  }

  if (formNo == 3 || formNo == 5 || formNo == 6)
  {
    if (toggle)
    {
      display = "block";
      visibility = "visible";
      visible = true;
    }
  }

  toggle = !toggle;

  document.getElementById("MemoryAccess").style.display = display;
  document.getElementById("MemoryAccess").style.visibility = visibility;

  if (visible)
  {
    let id = (formNo == 3 ? 1 : (formNo == 5 ? 2 : 3)); // (operand1, operand2, or result/result2)
    if (0 < id && id < 3) // id = 1 or 2
    {
      updateRCLButtonStatus();
    }

    if (id == 3) // really id = 3 or 4 (result or result2)?
    {
      let selCtrl = document.getElementById("matSel");
      if (selCtrl != null && selCtrl.value == 2)
        id = 4;
    }

    updateSTOButtonStatus(id);
  }
}

var conditionalResultSelectorEnable = function ()
{
  if (op != 'e' && op != 'g' && op != 'h' && op != 'j' && op != 'q' && op != 'r' && op != 's')
  {
    document.getElementById("matSel").disabled = true;
  }
}


//
//=================  Matrix Manipulation  =====================
//

/*
 * Creates the form 3/5 matrix html controls inside the supplied parent element, with all of input
 * text controls having their values got from supplied data matrix.
 * Also, controls in each column have same optimal width, independent from other columns.
 */
var createInputMatrix = function (nrows, ncols, parent, dataMatrix) // => TextCtrlDimensions[]
{
  if (nrows < 1 || ncols < 1 || parent == null)
  {
    alert("BAD PARAMETERS");
    return null;
  }

  let ctrlDims = [];
  getElementsSimilarWidth( dataMatrix, ctrlDims );
  let i = 0;
  while (i < nrows)
  {
    let j = 0;
    while (j < ncols)
    {
      const alen = ctrlDims.length;
      let suffix = "-r" + i + 'c' + j;
      let ID = "cell" + suffix;
      let NAME = "field" + suffix;
      let sz = (alen > j ? Math.ceil(ctrlDims[j].size) : 4);
      let newTextCtrl = document.createElement("input");
      newTextCtrl.setAttribute("class", "inputBox");
      newTextCtrl.setAttribute("type", "text");
      newTextCtrl.setAttribute("id", ID);
      newTextCtrl.setAttribute("name", NAME);
      if (sz < 4) sz = 4; // minimum cell size (4 chars) to avoid too narrow cells.
      newTextCtrl.setAttribute("size", sz);
      newTextCtrl.style.width = "" +  (alen > j ? ctrlDims[j].width : 40) + "px";
//    console.log("Edt Pass: " + (i+1)*(j+1)) DEBUG ONLY
      if (dataMatrix != null && dataMatrix.vector != null && dataMatrix.vector.length > (i * ncols + j))
        newTextCtrl.value = dataMatrix.vector[i * ncols + j];
      else
        newTextCtrl.value = ""; // null or void matrix as an "eraser" parameter.

      parent.appendChild(newTextCtrl);
      j++;
    }
    parent.appendChild(document.createElement("br"));
    i++;
  }
  parent.appendChild(document.createElement("br"));
  return ctrlDims;
}

var eraseInputMatrix = function (parent)
{
  if (parent == null)
    console.log("eraseInputMatrix() : No parent supplied!");
  else
    while (parent.firstChild)
      parent.removeChild(parent.firstChild);
}

/*
 * Reads the form 3/5 matrix, and copy values into the supplied matrix operand, that must be either
 * operand1 or operand2. Because the supplied operand always remember the form matrix geometry,
 * only the element values are read.
 * 
 */
var getOperandMatrix = function (matrix_operand) // matrix_operand MUST BE either operand1 or operand2
{
  let nelem = matrix_operand.rows * matrix_operand.cols; // operand 1/2 always remembers the form geometry.
  if (nelem <= 0)
  {
    console.log("getOperandMatrix() - NULL MATRIX DIMENSIONS");
    return;
  }

  matrix_operand.vector = []; // erase all previous content, if any

  let i = 0;
  while (i < matrix_operand.rows)
  {
    let j = 0;
    while (j < matrix_operand.cols)
    {
      let ID = "cell" + "-r" + i + 'c' + j;
      matrix_operand.vector[matrix_operand.cols * i + j++] = document.getElementById(ID).value;
    }
    i++;
  }
}

/*
 * Updates the form 3/5 matrix html controls with the supplied matrix values, and also updates
 * global operand1 or operand2 .
 */
var updateFormMatrix = function (mtx, operandNo) // operandNo must be 1 or 2
{
  if (mtx == null || (operandNo != 1 && operandNo != 2))
  {
    console.log("updateFormMatrix() - BAD PARAMETERS");
  }

  let celldims = null;
  let parent = document.getElementById("matrix");
  eraseInputMatrix(parent);

  if (operandNo == 1)
    operand1.copyFrom(mtx);
  else
    operand2.copyFrom(mtx);

  celldims = createInputMatrix(mtx.rows, mtx.cols, parent, mtx);

  let legend = "Rows: " + mtx.rows + ", Columns: " + mtx.cols +
                 " . Total elements: " + mtx.rows * mtx.cols;
  document.getElementById("dimensions").innerHTML = legend;
  resizeCurrentFormColumnToFit(operandNo == 1 ? 3 : 5, celldims);
}

/*
 * Prints the matrix creating the read-only text controls for displaying result/result2 matrices.
 * Also, controls in each column have same optimal width, independent from other columns.
 */
var printMatrix = function (matrix, parent, wrapper_no) // => TextCtrlDimensions[]
{
  if (matrix == null || parent == null || matrix.rows < 1 || matrix.cols < 1)
  {
    console.log("printMatrix() - BAD PARAMETERS");
    return null;
  }

  let i = 0;
  let wrpId = MATRIX_WRAPPER_ID;
  let matrixWrapper = document.createElement("div");
  let wrpName = MATRIX_WRAPPER_NAME;

  if (wrapper_no != null)
  {
    wrpId += ('_' + wrapper_no);
    wrpName += ('_' + wrapper_no);
  }

  matrixWrapper.setAttribute("id", wrpId);
  matrixWrapper.setAttribute("name", wrpName);
  parent.appendChild(matrixWrapper);
//console.log("Wrapper appended. ID: " + wrpId); // DEBUG only
  let ctrlDims = [];
  getElementsSimilarWidth( matrix, ctrlDims );

  while (i < matrix.rows)
  {
    let j = 0;
    while (j < matrix.cols)
    {
      let suffix = "-r" + i + 'c' + j;
      let ID = "txt" + (wrapper_no == null ? "" : wrapper_no) + suffix;
      let NAME = "text" + (wrapper_no == null ? "" : wrapper_no) + suffix;
      let newTextCtrl = document.createElement("input");
//    let sz = Math.ceil(ctrlDims[j] * 8 / 10); // TO REMOVE ? -  Empiric 20% reduction ?!!
      let sz = Math.ceil(ctrlDims[j].size);
      let w = ctrlDims[j].width;
      newTextCtrl.setAttribute("type", "text");
      newTextCtrl.setAttribute("id", ID);
      newTextCtrl.setAttribute("name", NAME);
      newTextCtrl.setAttribute("size", sz);
      newTextCtrl.style.width = "" + w + "px";
      newTextCtrl.setAttribute("value", "" + matrix.vector[matrix.cols * i + j]);
      newTextCtrl.setAttribute("disabled", true); // just a non modifiable text with cell mark.

//    console.log("Txt Pass: " + "[" + (i+1) + "," + (j+1) + "]");  // DEBUG ONLY

      matrixWrapper.appendChild(newTextCtrl);
      j++;
    }
    matrixWrapper.appendChild(document.createElement("br"));
    i++;
  }
  matrixWrapper.appendChild(document.createElement("br"));

  return ctrlDims;
}

// Erases the printed matrix controls created by the former function.
var erasePrintedMatrix = function (wrapper_no)
{
  let wrpId = MATRIX_WRAPPER_ID;

  if (wrapper_no != null)
    wrpId += ('_' + wrapper_no);

  let wrapper = document.getElementById(wrpId);
  if (wrapper)
  {
    // wrapper.parentNode.removeChild(wrapper);
    while (wrapper.firstChild)
      wrapper.removeChild(wrapper.firstChild);

    let section = document.getElementById(wrapper_no != null ? "result2" : "result");
    section.removeChild(wrapper);
  }
}

/*
 * Serializes the matrix structure into a text line, with the syntax below:
 * (rows,cols) {data element1, ... , data elementN}
 */
var serializeMatrix = function (matrix)
{
  let serialized = "(" + matrix.rows + ',' + matrix.cols + '){';
  for (let i = 0; i < matrix.rows; i++)
  {
    for (let j = 0; j < matrix.cols; j++)
    {
      serialized += matrix.vector[matrix.cols * i + j];

      // don't print the last comma
      if (i != (matrix.rows - 1) || j != (matrix.cols - 1))
      {
        serialized += ",";
      }
    }
  }
  serialized += '}';

  return serialized;
}

/*
 * Parses the text line, that must have the syntax below, into the matrix structure.
 * line: (rows,cols) {data element1, ... , data elementN}
 */
var parseMatrix = function (line, matrix)
{
  let param = new SerializedMatrixParams;
  let error = preParseLine(line, param); // parse the syntax (delimiters and separators).
  if (error < 0)
    return error;

  let dims = { rows: 0, cols: 0 };

  error = checkParameters(line, param, dims); // check dimensions and data qty
  if (error < 0)
    return error;

  error = readElements(line, param, dims.rows * dims.cols, matrix.vector); // check dimensions and data qty
  if (error < 0)
    return error;

  matrix.rows = dims.rows;
  matrix.cols = dims.cols;
  return eOk;
}

/* Copy the operand/result matrix text to clipboard, according to the form displayed on the page.
 */
var copyToClipboard = async function (id)
{
  let text = getOutputText(id);
  if (text == null || text.length == 0)
  {
    alertBox("Failure getting the matrix text to copy. Abort!");
    return;
  }

  try
  {
    await navigator.clipboard.writeText(text);
  }
  catch (error)
  {
    alertBox("Error copying to clipboard: " + error);
    return;
  }

  let txtPasteMatrix = null;
  if (1 <= id && id <= 2)
    txtPasteMatrix = document.getElementById("pasteMatrix" + id);

//console.log("Matrix copied to clipboard."); // DEBUG only

  if (txtPasteMatrix)
  {
    txtPasteMatrix.value = "Copied!"
    setTimeout(function () {txtPasteMatrix.value = pasteMatrixHere;}, 500);
  }
  else
  {
    btnCopyMatrix = document.getElementById("Copy2Clipboard");
    btnCopyMatrix.value = "Copied!";
    setTimeout(function () {btnCopyMatrix.value = "Copy";}, 500);
  }
}

var onClearMatrixPasteBox = function (matrixNo)
{
  document.getElementById("pasteMatrix" + matrixNo).value = "";
}

var onPasteMatrix = function (event) // => void
{
  // Stop data actually being pasted into div
  event.stopPropagation();
  event.preventDefault();

  // Get pasted data via clipboard API
  let clipboardData = event.clipboardData || window.clipboardData;
  let pastedText = clipboardData.getData('Text');

//console.log("onPasteMatrix() - Clipboard pasted text: " + pastedText); // DEBUG only

  if (pastedText.length == 0 || isBlankString(pastedText))
  {
    console.log("onPasteMatrix() - Void text from clipboard!");
    return;
  }

  putInputTextToFormMatrix(pastedText, "onPasteMatrix()");
  return;
}

var loadMatrixFromFile = async function (id)
{
  const opts = {
    excludeAcceptAllOption: true,
    multiple: false,
    types: [
      {
        id: MATRIX_DIR_ID,
        description: "Matrix Text file",
        accept: { "text/plain": [".mtx"] }
      },
    ],
  };

  fileHandle = await window.showOpenFilePicker(opts).then((handles) => handles[0]);
  let mtxText = "";
  let mtxFile  = await fileHandle.getFile();

  if (mtxFile.text) // If the new Blob --> File API has the function .text() available, then will use it.
  {
    mtxText = await mtxFile.text();
    let resMark = mtxText.lastIndexOf("R ");
    if (resMark >= 0)
      mtxText = mtxText.substring(resMark + 2);

//  console.log("ResMark: " + resMark + ", Matrix text: " + mtxText); // DEBUG ONLY

    putInputTextToFormMatrix(mtxText, "loadMatrixFromFile()", id);
    return;
  }

  // Otherwise use the traditional file reading technique.
  let reader = new FileReader();
  reader.addEventListener('loadend', (event) => {
      mtxText = event.target.result;
      let resMark = mtxText.lastIndexOf("R ");
      if (resMark >= 0)
        mtxText = mtxText.substring(resMark + 2);

//    console.log("ResMark: " + resMark + ", Matrix text: " + mtxText); // DEBUG ONLY

      putInputTextToFormMatrix(mtxText, "loadMatrixFromFile()", id);
  });
  reader.readAsText(mtxFile);
}

var saveMatrixToFile = async function (id)
{
  let rows = operand1.rows;
  let cols = operand1.cols;
  let text = getOutputText(id, true);
  if (text == null || text.length == 0)
  {
    alertBox("Failure getting the matrix text to copy. Abort!");
    return;
  }

  if (id == 0) // saving result and result2
  {
    rows = result.rows;
    cols = result.cols;
  }
  else if (id == 2) // saving operand2
  {
    rows = operand2.rows;
    cols = operand2.cols;
  }

  let protoname = "" + rows + "x" + cols + "_matrix.mtx";
  const opts = {
    suggestedName: protoname,
    types: [
      {
        id: MATRIX_DIR_ID,
        description: "Matrix Text file",
        accept: { "text/plain": [".mtx"] }
      },
    ],
  };

  const fileHandle = await window.showSaveFilePicker(opts);
  const fileStream = await fileHandle.createWritable();
  await fileStream.write(new Blob([text], {type: "text/plain"}));
  await fileStream.close();
}

/*
 * NOT IN USE by now. Says if the form matrix is void (all cells empty) or not.
 */
var isVoidFormMatrix = function (mtxNum, mtx) // => boolean
{
  if (mtxNum < 1 || mtxNum > 4) return true; // unknown form matrix

  let txtCtrl = null;

  for (let i = 0; i < mtx.rows; i++)
  {
    for (let j = 0; j < mtx.cols; j++)
    {
      if (mtxNum < 3)
        txtCtrl = document.getElementById("cell" + "-r" + i + 'c' + j);
      else
      {
        let id = (mtxNum == 3 ? "txt" : "txt2") + "-r" + i + 'c' + j;
        txtCtrl = document.getElementById(id);
      }

//    console.log("Text control: " + txtCtrl.id + " value: '" + txtCtrl.value + "'"); // TO HEAVY DEBUG

      if (txtCtrl.value != null && !isBlankString(txtCtrl.value))
        return false; // found a non empty cell
    }
  }

  return true; // all cells are empty
}


//=============================================================
//
//============= Private Local Routines   ==============
//
//=============================================================

/*
 * Gets the minimum width in pixels for a text control to fit the supplied text,
 * according to the font of the section/div.
*/
function getMinFittingTextWidth( text )
{
    const context = document.createElement("canvas").getContext("2d");
    let htmlElem = document.getElementById("matrix");
    if (htmlElem == null) htmlElem = document.getElementById("result");
    if (htmlElem == null) htmlElem = document.getElementById("currentForm");

    context.font = window.getComputedStyle( htmlElem ).font;
//  console.log("section or div Font:\n" + JSON.stringify(context.font)); // DEBUG: To see what font retrieves from section matrix
    width = context.measureText(text).width;
    return Math.ceil(width);
}

/*
 * Gets an array having the optimal dimensions for text controls in each column of the matrix, to set all text controls in
 * the column with the same width.
 * Starts getting the maximum text width for each column of the matrix, to set all text controls in the column with the same width,
 * that is the optimal for all of them.
 */
function getElementsSimilarWidth( matrix, ctrlDims ) // => void
{
  if (matrix == null || matrix == undefined || matrix.isNull())
    return; // Nothing to do

  let maxL = 0;

  for(let j = 0; j < matrix.cols; j++)
  {
    maxL = 0;
    txtMax = "";
    ctlDim = new TextCtrlDimensions(16, 16 * 12, 24); // default size, width, height
    for (let i = 0; i < matrix.rows; i++)
    {
      let txt = ("" + matrix.vector[i * matrix.cols + j]).trim();
      let l = txt.length;
      if (l > maxL)
      {
        maxL = l;
        txtMax = txt;
        ctlDim.size = l;
//      console.log("Elem[" + i + ", " + j + "] text: " + txt + " length: " + l); // FOR HEAVY DEBUG
      }
    }

    ctlDim.width = getMinFittingTextWidth(txtMax);
    ctrlDims.push(ctlDim);
  }

//console.log("Text dims:\n" + JSON.stringify(ctrlDims)); // DEBUG only
}

/*
 * Puts the serialized text from clipboard or file, into the specified global operand matrix.
 */
function putInputTextToFormMatrix(inputText, callerName, id) // => void
{
  let celldims = null;
  let mtx = new Matrix;
  let txtPasteMatrix = null;
  let rv = parseMatrix(inputText, mtx);
  if (rv == eOk)
  {
    let parent = document.getElementById("matrix");
    eraseInputMatrix(parent);
    if (id)
    {
      if (id == 1)
        operand1 = mtx;
      else if (id == 2)
        operand2 = mtx;
    }
    else // must deduce operand "id" when text comes from clipboard paste event
    {
      txtPasteMatrix = document.getElementById("pasteMatrix1");
      if (txtPasteMatrix)
      {
        id = 1;
        operand1 = mtx;
      }
      else
      {
        id = 2;
        operand2 = mtx;
        txtPasteMatrix = document.getElementById("pasteMatrix2");
      }
    }

    celldims = createInputMatrix(mtx.rows, mtx.cols, parent, mtx);

    let legend = "Rows: " + mtx.rows + ", Columns: " + mtx.cols +
                 " . Total elements: " + mtx.rows * mtx.cols;
    document.getElementById("dimensions").innerHTML = legend;
    if (txtPasteMatrix)
    {
      txtPasteMatrix.value = pasteMatrixHere; // only for paste events
    }
    resizeCurrentFormColumnToFit((id == 1 ? 3 : 5), celldims);
  }
  else
  {
    method = (callerName ? callerName : "putInputTextToFormMatrix()");
    alertBox(callerName + " - matrix Parse ERROR #" + rv);
  }
}

/*
 * Gets the serialized text from the specified global operand/result matrix, to be sent to
 * clipboard, or to file.
 */
function getOutputText(id, isSavingToFile) // => string
{
  let text = "";
  if (typeof(id) == "string")
    text = document.getElementById(id).value;
  else if (typeof(id) == "number" && 0 <= id && id <= 4)
  {
    if (id == 0) // calling from result page (#6)
    {
      if (op == 'e' || op == 'g' || op == 'h' || op == 'j' || op == 'q' || op == 'r' || op == 's')
      {
        if (isSavingToFile) // 2 results are being saved for Q-R decomposition or eigenvalues/vectors.
          text = (op == 'r' ? "Q " : "E "); // extra result mark: Q for quad unitary, or E for eigenvalues.

        text += serializeMatrix(result2);
        text += '\n';

        if (isSavingToFile)
          text += "R "; // ordinary result mark
      }

      text += serializeMatrix(result);
    }
    else if (1 <= id && id <= 2)
    {
      getOperandMatrix(id == 1 ? operand1 : operand2);
      text = serializeMatrix(id == 1 ? operand1 : operand2);
    }
    else if (3 <= id && id <= 4)
    {
      text = serializeMatrix(id == 3 ? result : result2);
    }
  }

  return text;
}

/* Says if the character is a "numeric" character according to the element data type context being used for
   the matrix */
function isNumeric(c) // => boolean
{
    if ('0' <= c && c <= '9') return true; // digit

    if (c == '+' || c == '-') return true; // sign

    if (optype == 'I') // enough for integer numbers
        return false;

    if (optype == 'Q')
    {
      if ( c == '/')
          return true;
      else
          return false;
    } // enough for rational numbers

    if (c == '.' || c == 'e' || c == 'E') return true;

    if (optype == 'R') // enough for real numbers
        return false;

    if (optype == 'C') // complex numbers
        if (c == 'i' || c == 'j' || c == 'L' || c == '|') return true;

    return false;
}

/*
 * Get the error explanation string related with the supplied error enum int
 */
function getParsingError(errorCode) // => string
{
    if (errorCode <= -eErrorQty || errorCode >= 0) return "unknown error.";
    else return aParsingErrors[-errorCode];
}

/*
 * Checks the line syntax (rows,cols) {data element1, ... , data elementN} and if correct,
 * fills the param structure with the positions of the delimiters, counts dimensions, and data elements.
 */
function preParseLine(line, param)
{
    const maxDimension = 2; // only Bidimentional matrix by now :=)

    for (let i = 0; i < line.length; i++) // pre-parser loop
    {
        let c = line[i];

        if (isBlankChar(c))
            continue;
        else if (c == vectorDelimiter.openHeader)
        {
            if (param.headerStart > 0) // open header delimiter had already been found.
                return -eAnotherOpenHeader; // invalid "open" character.

            param.headerStart = i + 1;
        }
        else if (c == vectorDelimiter.closeHeader)
        {
            if (param.headerStart == 0) // open header delimiter was never been found.
                return -eNoOpenHeader; // invalid "close" character.

            if (param.headerEnd > 0) // close delimiter was already been found.
                return -eAnotherCloseHeader; // invalid "close" character

            param.headerEnd = i; // end header delimiter has just been found.
        }
        else if (c == vectorDelimiter.openData)
        {
            if (param.headerStart == 0 || param.headerEnd == 0) // incomplete header before data
                return -eIncompleteHeader; // incomplete header before data.

            if (param.dataStart > 0) // open data delimiter had already been found
                return -eAnotherOpenData; // open data delimiter had already been found.

            param.dataStart = i + 1;
        }
        else if (c == vectorDelimiter.closeData)
        {
            if (param.dataStart == 0) // open data delimiter was never been found.
                return -eNoOpenData; // open data delimiter was never been found..

            if (param.dataEnd > 0) // close delimiter was already been found.
                return -eAnotherCloseData; // close delimiter was already been found.

            param.dataEnd = i; // end data delimiter has just been found
            break;
        }
        else if (c == vectorDelimiter.separator)
        {
            if (param.headerStart > 0 && param.headerEnd == 0 && param.dimCount < maxDimension)
                param.dimCount++; // separator was found inside the header.
            else if (param.dataStart > 0)
                param.dataCount++; // separator was found inside the data block.
            else // separator char found in wrong place
                return -eWrongSeparatorPosition; // invalid separator position
        }
        else if (! isNumeric(c))
        {
            console.log("preParseLine() - Invalid char: " + c);
            return -eNotValidChar; // invalid character
        }

    };

    return eOk;
}

/*
 * Checks the header parameters in param and loads the dim structure {rows;cols;}.
 */
function checkParameters(line, param, dim) // => enum int
{
    if ( param.headerStart == 0 || param.headerEnd == 0 ||
         param.dataStart == 0 || param.dataEnd == 0 )
    {
        return -eMissingDelimiter; // missing delimiter
    }

    const dimensionQty = 2; // only Bidimentional matrix by now :=)
    let rows = 0;
    let cols = 0;

    //console.log("Params: "+JSON.stringify(param)); // HEAVY DEBUG ONLY

    let astr = line.substr(param.headerStart, param.headerEnd - param.headerStart).split(vectorDelimiter.separator);

    if (astr.length != dimensionQty)
        return -eUnknownHeaderSeparator; // unknown header separator.

    rows = parseInt(astr[0], 10); // convert string to integer.
    cols = parseInt(astr[1], 10);

    //console.log("Dims: "+rows+" , "+cols); // HEAVY DEBUG ONLY

    if (! (rows > 0 && cols > 0))
        return -eInvalidOrNullHeaderParam; // invalid or null header parameters.

    let nelem = rows * cols;
    if (param.dataCount < nelem)
        return -eInsufficientData; // insufficient data elements.

    if (param.dataCount > nelem)
        return -eTooMuchData; // too much data elements.

    dim.rows = rows;
    dim.cols = cols;
    return eOk;
}

/*
 * Reads the data elements from the text line into the data array.
*/
function readElements(line, param, nelem, data)
{
    let astr = line.substr(param.dataStart, param.dataEnd - param.dataStart).split(vectorDelimiter.separator);
    if (astr.length < nelem)
        return -eInsufficientData; // insufficient data elements.

    if (astr.length > nelem)
        return -eTooMuchData; // too much data elements.

    for (let i = 0; i < nelem; i++) // parser loop
      if (optype != 'R' && optype != 'I')
      {
        data[i] = ("" + astr[i]).trim(); // leave the data as strings (complex or rational numbers fit here).
      }
      else // real matrix transposition is performed in this page
      {
        data[i] = 1 * astr[i]; // convert string to number (only int or float by now).
      }

    return eOk;
}


/* This code is commented out as it only runs on nodejs server side :(
export {
  getOperandMatrix,
  printMatrix,
  erasePrintedMatrix,
  serializeMatrix,
  parseMatrix,
  copyToClipboard,
  onPasteMatrix,
  loadMatrixFromFile,
  saveMatrixToFile,
  isVoidFormMatrix
};
*/

