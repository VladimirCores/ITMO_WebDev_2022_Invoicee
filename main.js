import InvoiceVO from './src/model/InvoiceVO';
import WorkItemVO from './src/model/WorkItemVO';
import WorkItemView from './src/view/WorkItemView';

import '@unocss/reset/tailwind.css'
import 'uno.css'

const LOCAL_KEY_INVOICE = 'invoice';
const LOCAL_KEY_WORK_ITEM = 'workitem';

const domInputInvoiceNumber = document.getElementById('inputInvoiceNumber');
const domInputDiscountPercent = document.getElementById('inputDiscountPercent');
const domInputTaxPercent = document.getElementById('inputTaxPercent');

const domWorkItemButtonCreate = document.getElementById('btnCreateWorkItem');

const domWorkItemPopup = document.getElementById('popupWorkItemContainer');
const domWorkItemOverlay = document.getElementById('overlayWorkItemPopup');

const domWorkItemTitleContainer = document.getElementById('titleWorkItemContainer');
const domWorkItemTotalContainer = document.getElementById('workItemTotalContainer');

const domWorkItemInputQty = document.getElementById('inputWorkItemQty');
const domWorkItemInputCost = document.getElementById('inputWorkItemCost');
const domWorkItemInputTitle = document.getElementById('inputWorkItemTitle');
const domWorkItemInputDescription = document.getElementById('inputWorkItemDescription');

const domWorkItemButtonDelete = document.getElementById('btnDeleteWorkItemPopup');
const domWorkItemButtonClose = document.getElementById('btnCloseWorkItemPopup');

const domTableWorkItems = document.getElementById('tableWorkItems');
const domAddWorkItemButton = document.getElementById('btnAddWorkItem');

const domResultsSubtotalContainer = document.getElementById('resultsSubtotalContainer');
const domResultsDiscountContainer = document.getElementById('resultsDiscountContainer');
const domResultsTaxesContainer = document.getElementById('resultsTaxesContainer');
const domResultsTotalContainer = document.getElementById('resultsTotalContainer');

const invoiceVO = initializeInvoiceVO();
calculateResults();

let selectedWorkItemVO = WorkItemVO.fromString(localStorage.getItem(LOCAL_KEY_WORK_ITEM));
if (selectedWorkItemVO) {
  setupPopupWorkItem(selectedWorkItemVO);
  openWorkItemPopup();
}

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
domTableWorkItems.onclick = (e) => {
  const targetId = parseInt(e.target?.id || '');
  // console.log('> domTableWorkItems.onclick: e.target =', e.target);
  const isValidWorkItemSelected = !!targetId;
  if (isValidWorkItemSelected) {
    selectedWorkItemVO = invoiceVO.items.find((vo) => vo.id === targetId);
    console.log('> domTableWorkItems.onclick:', {targetId, selectedWorkItemVO, invoiceVO});
    localStorage.setItem(LOCAL_KEY_WORK_ITEM, JSON.stringify(selectedWorkItemVO));
    setupPopupWorkItem(selectedWorkItemVO);
    openWorkItemPopup();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
}
domAddWorkItemButton.onclick = (e) => {
  e.stopPropagation();
  setupPopupWorkItem(null);
  openWorkItemPopup();
}

domWorkItemOverlay.onclick = domWorkItemButtonClose.onclick = () => {
  closeWorkItemPopup();
}
domWorkItemInputCost.oninput =
domWorkItemInputQty.oninput = () => {
  calculateWorkItemTotal();
  checkWorkItemPopupCreateButtonEnabled();
}
domWorkItemInputTitle.oninput = domWorkItemInputDescription.oninput = () => {
  checkWorkItemPopupCreateButtonEnabled();
}
domWorkItemButtonCreate.onclick = () => {
  if (selectedWorkItemVO) {
    selectedWorkItemVO.title = domWorkItemInputTitle.value;
    selectedWorkItemVO.description = domWorkItemInputDescription.value;
    selectedWorkItemVO.qty = domWorkItemInputQty.value;
    selectedWorkItemVO.cost = domWorkItemInputCost.value;
    const selectedWorkItemIndex = invoiceVO.items.indexOf(selectedWorkItemVO);
    rerenderWorkItemVOAtIndex(selectedWorkItemVO, selectedWorkItemIndex);
  } else {
    const workItemVO = new WorkItemVO(
      Date.now(),
      domWorkItemInputTitle.value,
      domWorkItemInputDescription.value,
      domWorkItemInputQty.value,
      domWorkItemInputCost.value
    );
    invoiceVO.items.push(workItemVO);
    renderWorkItemVO(workItemVO);
  }
  closeWorkItemPopup();
  calculateResults();
  saveInvoice();
}

function rerenderWorkItemVOAtIndex(vo, index) {
  const previousChild = domTableWorkItems.children[index + 1]; // +1 because there is a hidden template
  console.log('> rerenderWorkItemVOAtIndex:', {previousChild})
  previousChild.replaceWith(new WorkItemView(vo).dom);
}

function renderWorkItemVO(vo) {
  domTableWorkItems.append(new WorkItemView(vo).dom)
}

function openWorkItemPopup() {
  domWorkItemTitleContainer.innerText = selectedWorkItemVO ? 'Update' : "Add";
  domWorkItemButtonCreate.innerText = selectedWorkItemVO ? 'Save' : "Create";
  domWorkItemButtonDelete.disabled = !selectedWorkItemVO;
  domWorkItemPopup.style.display = 'block';
}

function closeWorkItemPopup() {
  domWorkItemPopup.style.display = 'none';
  if (selectedWorkItemVO) selectedWorkItemVO = null;
}

function calculateWorkItemTotal() {
  domWorkItemTotalContainer.innerText = `${
    (parseInt(domWorkItemInputQty.value) || 0) *
    (parseInt(domWorkItemInputCost.value) || 0)}`;
}

function setupPopupWorkItem(workItemVO) {
  domWorkItemInputQty.value = workItemVO?.qty || '';
  domWorkItemInputCost.value = workItemVO?.cost || '';
  domWorkItemInputTitle.value = workItemVO?.title || '';
  domWorkItemInputDescription.value = workItemVO?.description || '';
  domWorkItemTotalContainer.innerText = workItemVO?.total || '';
  checkWorkItemPopupCreateButtonEnabled();
}

function checkWorkItemPopupCreateButtonEnabled() {
  const inputWorkItemTitle = domWorkItemInputTitle.value;
  const titleLength = inputWorkItemTitle.length;
  const totalNumber = parseFloat(domWorkItemTotalContainer.innerText) || 0;

  let isDisabled = titleLength === 0 || totalNumber === 0;
  console.log('> checkWorkItemPopupCreateButtonEnabled:', { titleLength, totalNumber })

  if (selectedWorkItemVO) {
    console.log('> \t selectedWorkItemVO:', {
      selectedWorkItemVO,
      isTotalSame: selectedWorkItemVO.total === totalNumber,
      isTitleSame: selectedWorkItemVO.title === inputWorkItemTitle,
      isQtySame: selectedWorkItemVO.qty === domWorkItemInputQty.value,
      isCostSame: selectedWorkItemVO.cost === domWorkItemInputCost.value,
      isDescriptionSame: selectedWorkItemVO.description === domWorkItemInputDescription.value
    });
    isDisabled = isDisabled || (
      (
        selectedWorkItemVO.total === totalNumber
        && (
            selectedWorkItemVO.qty === domWorkItemInputQty.value
          && selectedWorkItemVO.cost === domWorkItemInputCost.value
        )
      )
      && selectedWorkItemVO.title === inputWorkItemTitle
      && selectedWorkItemVO.description === domWorkItemInputDescription.value
    );
  }
  console.log('> \t result:', { result: isDisabled });
  domWorkItemButtonCreate.disabled = isDisabled;
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

  domResultsSubtotalContainer.innerText = subtotal.toString();
  domResultsDiscountContainer.innerText = discount.toString();
  domResultsTaxesContainer.innerText = taxes.toString();
  domResultsTotalContainer.innerText = total.toString();
}

function saveInvoice() {
  localStorage.setItem(LOCAL_KEY_INVOICE, JSON.stringify(invoiceVO));
}
