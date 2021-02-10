export default class ColumnChart {
  subElements = {};
  chartHeight = 50;

  constructor({data = [], label = '', link = '', value = 0} = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.render();
  }

  createChart(data) {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${String(Math.floor(item * scale))}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? '<a href="/'+ this.link + '" class="column-chart__link">View all</a>' : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.createChart(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubelements(this.element);
  }

  getSubelements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  update(data) {
    this.subElements.body.innerHTML = this.createChart(data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {}
  }
}
