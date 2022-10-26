class WorkItemVO {
  constructor(id, title, description, qty, cost) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.qty = qty;
    this.cost = cost;
  }
  get total() { return this.cost * this.qty; }

  static fromString(inputString) {
    if (inputString) {
      const parsed = JSON.parse(inputString);
      return new WorkItemVO(
        parsed.id,
        parsed.title,
        parsed.description,
        parsed.qty,
        parsed.cost
      );
    }
    return undefined;
  }
}

export default WorkItemVO;
