import DOM from './src/consts/dom';
import Local from './src/consts/local';

import InvoiceVO from './src/model/InvoiceVO';
import WorkItemVO from './src/model/WorkItemVO';
import WorkItemView from './src/view/WorkItemView';

import '@unocss/reset/tailwind.css'
import 'uno.css'

const $ = (id) => document.getElementById(id);

const invoiceVO = initializeInvoiceVO();
calculateResults();

let selectedWorkItemVO = WorkItemVO.fromString(localStorage.getItem(Local.KEY_WORK_ITEM));
if (selectedWorkItemVO) {
  setupPopupWorkItem(selectedWorkItemVO);
  openWorkItemPopup();
}

function initializeInvoiceVO() {
  const initialInvoiceVO = InvoiceVO.fromString(localStorage.getItem(Local.KEY_INVOICE)) || new InvoiceVO();
  initialInvoiceVO.items.forEach(renderWorkItemVO);
  $(DOM.InputInvoiceNumber).value = initialInvoiceVO.id;
  $(DOM.InputDiscountPercent).value = initialInvoiceVO.discount;
  $(DOM.InputTaxPercent).value = initialInvoiceVO.taxes;
  $(DOM.InputIBANNumber).value = initialInvoiceVO.iban;
  return initialInvoiceVO;
}

$(DOM.InputIBANNumber).oninput = (e) => updateInvoiceParamFromEvent(e, 'iban', false);
$(DOM.InputInvoiceNumber).oninput = (e) => updateInvoiceParamFromEvent(e, 'id');
$(DOM.InputTaxPercent).oninput = (e) => updateInvoiceParamFromEvent(e, 'taxes').then((value) => value >= 0 && calculateResults());
$(DOM.InputDiscountPercent).oninput = (e) => updateInvoiceParamFromEvent(e, 'discount').then((value) => value >= 0 && calculateResults());
$(DOM.TableWorkItems).onclick = (e) => {
  const targetId = parseInt(e.target?.id || '');
  // console.log('> getDOM(DOM.TableWorkItems).onclick: e.target =', e.target);
  const isValidWorkItemSelected = !!targetId;
  if (isValidWorkItemSelected) {
    selectedWorkItemVO = invoiceVO.items.find((vo) => vo.id === targetId);
    console.log('> getDOM(DOM.TableWorkItems).onclick:', {targetId, selectedWorkItemVO, invoiceVO});
    localStorage.setItem(Local.KEY_WORK_ITEM, JSON.stringify(selectedWorkItemVO));
    setupPopupWorkItem(selectedWorkItemVO);
    openWorkItemPopup();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
}
$(DOM.AddWorkItemButton).onclick = (e) => {
  e.stopPropagation();
  setupPopupWorkItem(null);
  openWorkItemPopup();
}

$(DOM.WorkItemOverlay).onclick = $(DOM.WorkItemButtonClose).onclick = () => {
  closeWorkItemPopup();
}
$(DOM.WorkItemInputCost).oninput =
$(DOM.WorkItemInputQty).oninput = () => {
  calculateWorkItemTotal();
  checkWorkItemPopupCreateButtonEnabled();
}
$(DOM.WorkItemInputTitle).oninput = $(DOM.WorkItemInputDescription).oninput = () => {
  checkWorkItemPopupCreateButtonEnabled();
}
$(DOM.WorkItemButtonCreate).onclick = () => {
  if (selectedWorkItemVO) {
    selectedWorkItemVO.title = $(DOM.WorkItemInputTitle).value;
    selectedWorkItemVO.description = $(DOM.WorkItemInputDescription).value;
    selectedWorkItemVO.qty = $(DOM.WorkItemInputQty).value;
    selectedWorkItemVO.cost = $(DOM.WorkItemInputCost).value;
    const selectedWorkItemIndex = invoiceVO.items.indexOf(selectedWorkItemVO);
    rerenderWorkItemVOAtIndex(selectedWorkItemVO, selectedWorkItemIndex);
  } else {
    const workItemVO = new WorkItemVO(
      Date.now(),
      $(DOM.WorkItemInputTitle).value,
      $(DOM.WorkItemInputDescription).value,
      $(DOM.WorkItemInputQty).value,
      $(DOM.WorkItemInputCost).value
    );
    invoiceVO.items.push(workItemVO);
    renderWorkItemVO(workItemVO);
  }
  closeWorkItemPopup();
  calculateResults();
  saveInvoice();
}
$(DOM.WorkItemButtonDelete).onclick = () => {
  if (window.confirm(`Confirm deletion of: ${selectedWorkItemVO.title}`)) {
    const selectedWorkItemIndex = invoiceVO.items.indexOf(selectedWorkItemVO);
    invoiceVO.items.splice(selectedWorkItemIndex, 1);
    $(DOM.TableWorkItems).children[selectedWorkItemIndex + 1].remove();
    closeWorkItemPopup();
    saveInvoice();
  }
}

function rerenderWorkItemVOAtIndex(vo, index) {
  const previousChild = $(DOM.TableWorkItems).children[index + 1]; // +1 because there is a hidden template
  console.log('> rerenderWorkItemVOAtIndex:', {previousChild})
  previousChild.replaceWith(new WorkItemView(vo).dom);
}

function renderWorkItemVO(vo) {
  $(DOM.TableWorkItems).append(new WorkItemView(vo).dom)
}

function openWorkItemPopup() {
  $(DOM.WorkItemTitleContainer).innerText = selectedWorkItemVO ? 'Update' : "Add";
  $(DOM.WorkItemButtonCreate).innerText = selectedWorkItemVO ? 'Save' : "Create";
  $(DOM.WorkItemButtonDelete).disabled = !selectedWorkItemVO;
  $(DOM.WorkItemPopup).style.display = 'block';
}

function closeWorkItemPopup() {
  $(DOM.WorkItemPopup).style.display = 'none';
  if (selectedWorkItemVO) {
    selectedWorkItemVO = null;
    localStorage.removeItem(Local.KEY_WORK_ITEM);
  }
}

function calculateWorkItemTotal() {
  $(DOM.WorkItemTotalContainer).innerText = `${
    (parseInt($(DOM.WorkItemInputQty).value) || 0) *
    (parseInt($(DOM.WorkItemInputCost).value) || 0)}`;
}

function setupPopupWorkItem(workItemVO) {
  $(DOM.WorkItemInputQty).value = workItemVO?.qty || '';
  $(DOM.WorkItemInputCost).value = workItemVO?.cost || '';
  $(DOM.WorkItemInputTitle).value = workItemVO?.title || '';
  $(DOM.WorkItemInputDescription).value = workItemVO?.description || '';
  $(DOM.WorkItemTotalContainer).innerText = workItemVO?.total || '';
  checkWorkItemPopupCreateButtonEnabled();
}

function checkWorkItemPopupCreateButtonEnabled() {
  const inputWorkItemTitle = $(DOM.WorkItemInputTitle).value;
  const titleLength = inputWorkItemTitle.length;
  const totalNumber = parseFloat($(DOM.WorkItemTotalContainer).innerText) || 0;

  let isDisabled = titleLength === 0 || totalNumber === 0;
  console.log('> checkWorkItemPopupCreateButtonEnabled:', { titleLength, totalNumber })

  if (selectedWorkItemVO) {
    console.log('> \t selectedWorkItemVO:', {
      selectedWorkItemVO,
      isTotalSame: selectedWorkItemVO.total === totalNumber,
      isTitleSame: selectedWorkItemVO.title === inputWorkItemTitle,
      isQtySame: selectedWorkItemVO.qty === $(DOM.WorkItemInputQty).value,
      isCostSame: selectedWorkItemVO.cost === $(DOM.WorkItemInputCost).value,
      isDescriptionSame: selectedWorkItemVO.description === $(DOM.WorkItemInputDescription).value
    });
    isDisabled = isDisabled || (
      (
        selectedWorkItemVO.total === totalNumber
        && (
            selectedWorkItemVO.qty === $(DOM.WorkItemInputQty).value
          && selectedWorkItemVO.cost === $(DOM.WorkItemInputCost).value
        )
      )
      && selectedWorkItemVO.title === inputWorkItemTitle
      && selectedWorkItemVO.description === $(DOM.WorkItemInputDescription).value
    );
  }
  console.log('> \t result:', { result: isDisabled });
  $(DOM.WorkItemButtonCreate).disabled = isDisabled;
}

function updateInvoiceParamFromEvent(e, param, isNumber = true, defaultValue = 0) {
  return new Promise((resolve) => {
    const targetValue = e.currentTarget.value;
    const value = isNumber ? parseInt(targetValue) : targetValue;
    const checkedValue = isNumber ? (!isNaN(value) ? value : defaultValue) : targetValue;
    console.log('> updateInvoiceParamFromTargetValue', { value, checkedValue, param })
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

  $(DOM.ResultsSubtotalContainer).innerText = `${subtotal}`;
  $(DOM.ResultsDiscountContainer).innerText = `${discount}`;
  $(DOM.ResultsTaxesContainer).innerText = `${taxes}`;
  $(DOM.ResultsTotalContainer).innerText = `${total}`;
}

function saveInvoice() {
  localStorage.setItem(Local.KEY_INVOICE, JSON.stringify(invoiceVO));
}
