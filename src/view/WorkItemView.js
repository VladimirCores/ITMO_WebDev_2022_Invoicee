class WorkItemView {
  constructor(vo) {
    this._dom = document.createElement('div');
    this._domText = `
      <div id="${vo.id}" class="grid grid-cols-8 select-none">
        <div class="col-span-4">${vo.title}</div>
        <div>${vo.qty}</div>
        <div>${vo.cost}</div>
        <div class="col-span-2 text-right">
          ${vo.qty * vo.cost}
        </div>
      </div>
    `
    this._dom.innerHTML = this._domText;
    this._dom.style.cssText = 'padding: 8px 4px; border-bottom: solid 1px #ccc;'
    this._dom.className = 'py-2 px-1 hover:bg-gray-100 border-b-1';
  }
  get dom() { return this._dom; }
  get domText() { return this._domText; }
}

export default WorkItemView;
