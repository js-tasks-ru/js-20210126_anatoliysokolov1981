import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  params = {
    _embed: 'subcategory.category',
    _sort: '',
    _order: 'asc',
    _start: 0,
    _end: 30
  };
  isRequestSend = false;

  onHeaderPointerdown = event => {
    const columnHeader = event.target.closest('.sortable-table__cell');
    const {id, order, sortable} = columnHeader.dataset;

    if (sortable === 'false') return;

    const orderToggle = {
      asc: 'desc',
      desc: 'asc'
    };

    this.params._sort = id;
    this.params._order = orderToggle[order];
    this.params._start = 0;
    this.params._end = 30;
    this.update(this.params, false);

    columnHeader.dataset.order = orderToggle[order];
    columnHeader.append(this.subElements.arrow);
  }

  onWindowScroll = event => {
    if (this.isRequestSend) return;

    const shift = 200;
    const itemCount = 30;
    let bottomBorder = document.documentElement.getBoundingClientRect().bottom;
    let htmlHeight = document.documentElement.clientHeight;

    if (bottomBorder < htmlHeight + shift) {
      this.params._start += itemCount;
      this.params._end += itemCount;
      this.update(this.params, true);
    }
  }

  constructor(header = [], {url = ''} = {}) {
    this.header = header;
    this.pathname = url;
    this.params._sort = header.find(item => item.sortable).id;

    this.render();
    this.addListeners();
    this.update(this.params, false);
  }

  async loadData(params = {}) {
    this.isRequestSend = true;

    const url = new URL(this.pathname, BACKEND_URL);
    const keys = Object.keys(params);

    for (const key of keys) {
      url.searchParams.set(key, params[key]);
    }

    return await fetchJson(url);
  }

  getHeaderArrowTemplate(id) {
    const template = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return id === this.params._sort ? template : '';
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

  sort(field, order) {
    const arr = [...this.data];
    const {sortType} = this.header.find(item => item.id === field);
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort( (a, b) => {
      switch (sortType) {
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
        case 'number':
          return direction * (a[field] - b[field]);
        case 'custom':
          return;
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  addListeners() {
    this.subElements.header.addEventListener('click', this.onHeaderPointerdown);
    window.addEventListener('scroll', this.onWindowScroll);
  }

  async update(params, isAdjacent) {
    const data = await this.loadData(params);

    if (isAdjacent) {
      this.subElements.body.insertAdjacentHTML('beforeend', this.getBodyRowTemplate(data));
      this.data = [...this.data, ...data];
    } else {
      this.subElements.body.innerHTML = this.getBodyRowTemplate(data);
      this.data = data;
    }

    this.isRequestSend = false;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    window.removeEventListener('scroll', this.onWindowScroll);
  }
}
