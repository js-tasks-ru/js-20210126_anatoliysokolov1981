import fetchJson from './utils/fetch-json.js';

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;
  origin = 'https://course-js.javascript.ru';

  constructor({url = '', range = {}, label = '', link = ''} = {}) {
    this.pathname = url;
    this.label = label;
    this.link = link;
    this.range = range;
    this.render();
    this.update(range.from, range.to);
  }

  createChart(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data
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
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubelements(this.element);
  }

  getSubelements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  async update(dateFrom, dateTo) {
    const url = new URL(this.pathname, this.origin);

    url.searchParams.set('from', dateFrom);
    url.searchParams.set('to', dateTo);

    const data = await fetchJson(url);
    const values = Object.values(data);

    this.subElements.body.innerHTML = this.createChart(values);
    this.subElements.header.innerHTML = values.length;
    this.element.classList.remove('column-chart_loading');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {}
  }
}
