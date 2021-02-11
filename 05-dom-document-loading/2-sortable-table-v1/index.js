export default class SortableTable {
  subElements = {}

  constructor(header = [], data = {}) {
    this.header = header;
    this.data = data;

    this.render();
  }

  createHeader() {
    return this.header
      .map( ({id, title, sortable}) => {
        return `
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="asc">
            <span>${title}</span>
          </div>
        `;
      })
      .join('');
  }

  createBody({data = []}) {
    return data
      .map( ({images, title, quantity, price, sales})=> {
        return `
          <a href="#" class="sortable-table__row">
            <div class="sortable-table__cell">
              <img class="sortable-table-image" alt="${title}" src="${images[0].url}">
            </div>
            <div class="sortable-table__cell">${title}</div>

            <div class="sortable-table__cell">${quantity}</div>
            <div class="sortable-table__cell">${price}</div>
            <div class="sortable-table__cell">${sales}</div>
          </a>
        `;
      })
      .join('');
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">

          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.createHeader()}
          </div>

          <div data-element="body" class="sortable-table__body">
            ${this.createBody(this.data)}
          </div>

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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
