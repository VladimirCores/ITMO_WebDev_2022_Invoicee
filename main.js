import InvoiceVO from './src/model/InvoiceVO';
import WorkItemVO from './src/model/WorkItemVO';
import WorkItemView from './src/view/WorkItemView';

import '@unocss/reset/tailwind.css'
import 'uno.css'

const LOCAL_KEY_INVOICE = 'invoice';

const domInputInvoiceNumber = document.getElementById('inputInvoiceNumber');
const domInputDiscountPercent = document.getElementById('inputDiscountPercent');
const domInputTaxPercent = document.getElementById('inputTaxPercent');

const domWorkItemInputQty = document.getElementById('inputWorkItemQty');
const domWorkItemInputCost = document.getElementById('inputWorkItemCost');
const domWorkItemInputTitle = document.getElementById('inputWorkItemTitle');
const domWorkItemInputDescription = document.getElementById('inputWorkItemDescription');

const domButtonAddWorkItem = document.getElementById('btnAddWorkItem');
const domButtonCloseWorkItemPopup = document.getElementById('btnCloseWorkItemPopup');
const domButtonCreateWorkItem = document.getElementById('btnCreateWorkItem');

const domTableWorkItems = document.getElementById('tableWorkItems');
const domWorkItemTotalContainer = document.getElementById('workItemTotalContainer');
const domResultsSubtotalContainer = document.getElementById('resultsSubtotalContainer');
const domResultsDiscountContainer = document.getElementById('resultsDiscountContainer');
const domResultsTaxesContainer = document.getElementById('resultsTaxesContainer');
const domResultsTotalContainer = document.getElementById('resultsTotalContainer');

const domPopupWorkItemContainer = document.getElementById('popupWorkItemContainer');
const domOverlayWorkItemPopup = document.getElementById('overlayWorkItemPopup');

const invoiceVO = initializeInvoiceVO();
calculateResults();

function initializeInvoiceVO() {
  const initialInvoiceVO = InvoiceVO.fromString(localStorage.getItem(LOCAL_KEY_INVOICE)) || new InvoiceVO();
  initialInvoiceVO.items.forEach(renderWorkItemVO);
  domInputInvoiceNumber.value = initialInvoiceVO.id;
  domInputDiscountPercent.value = initialInvoiceVO.discount;
  domInputTaxPercent.value = initialInvoiceVO.taxes;
  return initialInvoiceVO;
}

domInputInvoiceNumber.oninput = (e) => updateInvoiceParamFromEvent(e, 'id');
domInputTaxPercent.oninput = (e) => updateInvoiceParamFromEvent(e, 'taxes').then((value) => value >= 0 && calculateResults());
domInputDiscountPercent.oninput = (e) => updateInvoiceParamFromEvent(e, 'discount').then((value) => value >= 0 && calculateResults());

domWorkItemInputCost.oninput = domWorkItemInputQty.oninput = () => {
  calculateWorkItemTotal();
  checkWorkItemPopupCreateButtonEnabled();
}
domOverlayWorkItemPopup.onclick = domButtonCloseWorkItemPopup.onclick = () => {
  closeWorkItemPopup();
}
domButtonAddWorkItem.onclick = (e) => {
  e.stopPropagation();
  resetWorkItemPopup();
  domPopupWorkItemContainer.style.display = 'block';
}
domWorkItemInputTitle.oninput = () => {
  const value = domWorkItemInputTitle.value;
  console.log('> domInputWorkItemTitle.oninput:', { value });
  checkWorkItemPopupCreateButtonEnabled();
}
domButtonCreateWorkItem.onclick = () => {
  const workItemVO = new WorkItemVO(
    Date.now(),
    domWorkItemInputTitle.value,
    domWorkItemInputDescription.value,
    domWorkItemInputQty.value,
    domWorkItemInputCost.value
  );
  invoiceVO.items.push(workItemVO);
  renderWorkItemVO(workItemVO);
  closeWorkItemPopup();
  calculateResults();
  saveInvoice();
}

function renderWorkItemVO(vo) {
  domTableWorkItems.append(new WorkItemView(vo).dom)
}

function closeWorkItemPopup() {
  domPopupWorkItemContainer.style.display = 'none';
}

function calculateWorkItemTotal() {
  domWorkItemTotalContainer.innerText = `${
    (parseInt(domWorkItemInputQty.value) || 0) *
    (parseInt(domWorkItemInputCost.value) || 0)}`;
}

function resetWorkItemPopup() {
  domWorkItemInputQty.value = '';
  domWorkItemInputCost.value = '';
  domWorkItemInputTitle.value = '';
  domWorkItemInputDescription.value = '';
  checkWorkItemPopupCreateButtonEnabled();
}

function checkWorkItemPopupCreateButtonEnabled() {
  const titleLength = domWorkItemInputTitle.value.length;
  const totalNumber = parseFloat(domWorkItemTotalContainer.innerText);
  console.log('> checkWorkItemPopupCreateButtonEnabled:', { titleLength, totalNumber })
  domButtonCreateWorkItem.disabled = titleLength === 0 || totalNumber === 0;
}

function updateInvoiceParamFromEvent(e, param) {
  return new Promise((resolve) => {
    const value = parseInt(e.currentTarget.value);
    const checkedValue = !isNaN(value) ? value : 0;
    console.log('> updateInvoiceParamFromTargetValue', { value, param })
    invoiceVO[param] = checkedValue;
    saveInvoice();
    resolve(checkedValue);
  })
}

function calculateResults() {
  const subtotal = invoiceVO.items.reduce((prev, vo) => prev + vo.total, 0);
  let discount = Math.floor(subtotal - subtotal * invoiceVO.discount * 0.01);
  let taxes = Math.ceil(discount * invoiceVO.taxes * 0.01);
  let total = taxes + discount;

  domResultsSubtotalContainer.innerText = subtotal;
  domResultsDiscountContainer.innerText = discount.toString();
  domResultsTaxesContainer.innerText = taxes.toString();
  domResultsTotalContainer.innerText = total.toString();
}

function saveInvoice() {
  localStorage.setItem(LOCAL_KEY_INVOICE, JSON.stringify(invoiceVO));
}
