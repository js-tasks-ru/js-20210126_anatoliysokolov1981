import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  containers;
  components;

  get template() {
    return `
      <div class="dashboard full-height flex-column">

        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
        </div>

        <div class="dashboard__charts"></div>
        <h3 class="block-title">Лидеры продаж</h3>

      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.containers = {
      rangePicker: this.element.querySelector('.content__top-panel'),
      ordersChart: this.element.querySelector('.dashboard__charts'),
      salesChart: this.element.querySelector('.dashboard__charts'),
      customersChart: this.element.querySelector('.dashboard__charts'),
      sortableTable: this.element.querySelector('.dashboard__charts').parentNode
    }

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const dateRange = {
      from: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    };

    const rangePicker = new RangePicker(dateRange);

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: dateRange,
      label: 'orders',
      link:'#'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: dateRange,
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: dateRange,
      label: 'customers'
    });

    const sortableTable = new SortableTable(
      header,
      {
        url: `api/dashboard/bestsellers?from=${encodeURIComponent(dateRange.from)}&to${encodeURIComponent(dateRange.to)}`,
        step: 30,
        start: 1,
        isSortLocally: true
      }
    );

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponents() {
    for (const [key, component] of Object.entries(this.components)) {
      this.containers[key].append(component.element);
    }
  }

  async updateComponents(from, to) {
    const url = this.components.sortableTable.url;

    url.searchParams.set('from', from);
    url.searchParams.set('to', to);

    const data = await fetchJson(url);

    this.components.sortableTable.addRows(data);
    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  initEventListeners() {
    this.containers.rangePicker.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    })
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
