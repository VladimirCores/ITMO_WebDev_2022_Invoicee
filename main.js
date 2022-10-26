import '@unocss/reset/tailwind.css'
import 'uno.css'

const domInputInvoiceNumber = document.getElementById('inputInvoiceNumber');
const domButtonAddWorkItem = document.getElementById('btnAddWorkItem');
const domButtonCloseWorkItemPopup = document.getElementById('btnCloseWorkItemPopup');

const domResultsSubtotalContainer = document.getElementById('resultsSubtotalContainer');
const domResultsDiscountContainer = document.getElementById('resultsDiscountContainer');
const domResultsTaxesContainer = document.getElementById('resultsTaxesContainer');
const domResultsTotalContainer = document.getElementById('resultsTotalContainer');

const domPopupWorkItemContainer = document.getElementById('popupWorkItemContainer');
const domOverlayWorkItemPopup = document.getElementById('overlayWorkItemPopup');

const domInputDiscountPercent = document.getElementById('inputDiscountPercent');
const domInputTaxPercent = document.getElementById('inputTaxPercent');

domOverlayWorkItemPopup.onclick = domButtonCloseWorkItemPopup.onclick = () => {
  domPopupWorkItemContainer.style.display = 'none';
}
domButtonAddWorkItem.onclick = (e) => {
  e.stopPropagation();
  domPopupWorkItemContainer.style.display = 'block';
}
