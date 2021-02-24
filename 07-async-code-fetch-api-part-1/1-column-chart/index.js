import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor( { url = '', range = { from: new Date(), to: new Date() }, label = '', link = '',
    formatHeading = data => data } = {} ) {

    this.url = new URL(url, BACKEND_URL);
    this.label = label;
    this.link = link;
    this.range = range;
    this.formatHeading = formatHeading;

    this.render();
    this.update(range.from, range.to);
  }

  createChart(data) {
    const maxValue = Math.max(...Object.values(data));

    return Object.entries(data).map( ([key, value]) => {
      const scale = this.chartHeight / maxValue;
      const percent = (value / maxValue * 100).toFixed(0);
      const tooltip = `<span>
        <small>${ key.toLocaleString('default', { dateStyle: 'medium' }) }</small>
        <br>
        <strong>${ percent }%</strong>
      </span>`;

      return `<div style="--value: ${ Math.floor(value * scale) }" data-tooltip="${ tooltip } "></div>`;
    }).join('');
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${ this.chartHeight }">
        <div class="column-chart__title">
          Total ${ this.label }
          ${ this.link ? '<a href="/'+ this.link + '" class="column-chart__link">View all</a>' : '' }
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

    return [...elements].reduce( (acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    this.url.searchParams.set('from', from);
    this.url.searchParams.set('to', to);

    const data = await fetchJson(this.url);

    if (data && Object.values(data).length) {
      this.subElements.body.innerHTML = this.createChart(data);
      this.subElements.header.innerHTML = this.getHeaderValue(data);
      this.element.classList.remove('column-chart_loading');
    }
  }

  destroy() {
    this.element.remove();
    this.subElements = {}
  }
}
