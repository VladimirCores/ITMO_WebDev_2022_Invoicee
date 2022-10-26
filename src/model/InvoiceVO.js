import WorkItemVO from './WorkItemVO';

class InvoiceVO {
  constructor(id) {
    this.id = id || null;
    this.items = [];
    this.discount = 0;
    this.taxes = 0;
    this.total = 0;
  }

  static fromString(inputString) {
    if (inputString) {
      const parsed = JSON.parse(inputString);
      const invoiceVO =  new InvoiceVO(parsed.id);
      invoiceVO.items = parsed.items.map((item) => new WorkItemVO(
        item.id, item.title, item.description, item.qty, item.cost));
      invoiceVO.discount = parsed.discount;
      invoiceVO.taxes = parsed.taxes;
      invoiceVO.total = parsed.total;
      return invoiceVO;
    }
  }
}

export default InvoiceVO;
