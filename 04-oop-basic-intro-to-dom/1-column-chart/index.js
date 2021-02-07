export default class ColumnChart {
  constructor(options) {
    this.data = options.data;
    this.label = options.label;
    this.value = options.value;
    this.link = options.link;
    this.chartHeight = 50;
    this.render();
  }

  getBarTemplate(columnProps) {
    const {value, percent} = columnProps;

    return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
  }

  createChart() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        return {
          percent: (item / maxValue * 100).toFixed(0) + '%',
          value: String(Math.floor(item * scale))
        }
      })
      .reduce((bars, columnProps) => bars + this.getBarTemplate(columnProps), '');
  }

  getChartTemplate() {
    return `
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.createChart()}
        </div>
      </div>
    `;
  }

  getComponentTemplate() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? '<a href="/'+ this.link + '" class="column-chart__link">View all</a>' : ''}
        </div>
        ${this.getChartTemplate()}
      </div>
    `;
  }

  getWithoutDataTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          <a class="column-chart__link" href="#">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">

          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    if (this.data.length) {
      element.innerHTML = this.getComponentTemplate();
    } else {
      element.innerHTML = this.getWithoutDataTemplate();
    }

    this.element = element.firstElementChild;
  }

  update(data) {
    this.data = data;
    this.render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
