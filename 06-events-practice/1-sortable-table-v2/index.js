export default class SortableTable {
  element;
  subElements = {};

  onPointerdown = event => {
    const columnHeader = event.target.closest('.sortable-table__cell');
    let {id: field, order, sortable} = columnHeader.dataset;

    if (sortable === 'false') return;

    const orderToggle = {
      asc: 'desc',
      desc: 'asc'
    }

    this.sort(field, orderToggle[order]);
    columnHeader.dataset.order = orderToggle[order];
    columnHeader.append(this.subElements.arrow);
  }

  constructor(header = [], {data = []} = {}) {
    this.header = header;
    this.data = data;
    this.firstSortedColumn = header.find(item => item.sortable).id;

    this.render();
    this.sort(this.firstSortedColumn, 'asc');
    this.addListener();
  }

  getHeaderArrowTemplate(id) {
    const template = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return id === this.firstSortedColumn ? template : '';
  }

  getHeaderRowTemplate({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${sortable ? 'data-order="asc"' : ''}>
        <span>${title}</span>
        ${this.getHeaderArrowTemplate(id)}
      </div>
    `;
  }

  createHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.header.map(item => this.getHeaderRowTemplate(item)).join('')}
      </div>
    `;
  }

  getBodyRowTemplate(data) {
    return data
      .map(item => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getCellTemplate(item)}
          </a>
        `;
      })
      .join('');
  }

  getCellTemplate(item) {
    return this.header
      .map(({id, template}) =>
        template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`)
      .join('');
  }

  createBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyRowTemplate(this.data)}
      </div>
    `;
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.createHeader()}
          ${this.createBody()}
        </div>
      </div>
    `;
  }

  render(){
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  makeSort(field, order) {
    const arr = [...this.data];
    const {sortType} = this.header.find(item => item.id === field);
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort( (a, b) => {
      switch (sortType) {
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
        case 'number':
          return direction * (a[field] - b[field]);
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  sort(field, order) {
    const sortedData = this.makeSort(field, order);

    this.update(sortedData);
  }

  addListener() {
    this.subElements.header.addEventListener('click', this.onPointerdown);
  }

  update(data) {
    this.subElements.body.innerHTML = this.getBodyRowTemplate(data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
