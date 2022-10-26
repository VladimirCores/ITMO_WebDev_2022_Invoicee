class WorkItemView {
  constructor(vo) {
    this._dom = document.createElement('div');
    this._domText = `
      <div class="col-span-4">${vo.title}</div>
      <div>${vo.qty}</div>
      <div>${vo.cost}</div>
      <div class="col-span-2 text-right">
        ${vo.qty * vo.cost}
      </div>
    `;
    this._dom.id = vo.id;
    this._dom.innerHTML = this._domText;
    this._dom.className = 'grid grid-cols-8 select-none border-b-1 px-1 py-2 hover:bg-gray-100';
  }
  get dom() { return this._dom; }
}

export default WorkItemView;
