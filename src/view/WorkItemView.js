class WorkItemView {
  constructor(vo) {
    this._dom = document.createElement('div');
    this._domText = `
      <div class="col-span-4 self-end pl-2 pr-3">
        <div class="font-bold">${vo.title}</div>
        <div class="text-xs text-gray-400">${vo.description}</div>
      </div>
      <div>${vo.qty}</div>
      <div>${vo.cost}</div>
      <div class="col-span-2 text-right pr-3">
        ${vo.qty * vo.cost}
      </div>
    `;
    this._dom.id = vo.id;
    this._dom.innerHTML = this._domText;
    this._dom.className = `
      [&>*]:pointer-events-none 
      grid grid-cols-8 
      select-none 
      items-center 
      border-b-1 
      py-2 
      hover:bg-gray-100
      `;
  }
  get dom() { return this._dom; }
}

export default WorkItemView;
