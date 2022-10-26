class WorkItemVO {
  constructor(id, title, description, qty, cost) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.qty = qty;
    this.cost = cost;
  }
  get total() { return this.cost * this.qty; }
}

export default WorkItemVO;
