import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  form;

  constructor (productId) {
    this.productId = productId;
    this.url = new URL('api/rest/products', BACKEND_URL);

    this.renderForm();
    this.addListeners();
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            ${this.createFieldset('Название товара', 'title', 'text', 'Название товара', true)}
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description"
            data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            <input data-element="upload" name="upload" type="file" hidden>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory">
              <option value="">Категория &gt; Подкатегория</option>
            </select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            ${this.createFieldset('Цена ($)', 'price', 'number', '100', true)}
            ${this.createFieldset('Скидка ($)', 'discount', 'number', '0', true)}
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>

        </form>
      </div>
    `;
  }

  createFieldset(productName = '', name = '', type = 'text', placeholder = '', isReuired = false) {
    return `
      <fieldset>
        <label class="form-label">${productName}</label>
        <input
          class="form-control"
          name="${name}"
          type="${type}"
          placeholder="${placeholder}"
          required="${isReuired}">
      </fieldset>
    `;
  }

  renderOptions(arr = []) {
    return arr
      .map(item => {
        return item.subcategories
          .map(subcat => `<option value="${subcat.id}">${item.title} &gt; ${subcat.title}</option>`)
          .join('');
      })
      .join('');
  }

  getImageElement(image = {}) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(image.url)}">
          <span>${escapeHtml(image.source)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;

    return wrapper.firstElementChild;
  }

  renderImages(images) {
    const items = images.map(image => this.getImageElement(image));
    const sortableList = new SortableList({ items });

    this.imageListContainer.append(sortableList.element);
  }

  renderForm() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.form = this.element.firstElementChild;
    this.imageListContainer = this.element.querySelector('[data-element = imageListContainer]');
  }

  async render () {
    const categories = fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
    const product = this.loadProductById(this.productId);
    const [categoriesResponse, productResponse] = await Promise.all([categories, product]);

    if (categoriesResponse) {
      const options = this.renderOptions(categoriesResponse);

      this.form.subcategory.innerHTML = options;
    }

    if (productResponse) this.update(...productResponse);
  }

  async loadProductById(id) {
    this.url.searchParams.set('id', id);

    return await fetchJson(this.url);
  }

  update(product = {}) {
    this.form.title.value = product.title;
    this.form.description.value = product.description;
    this.form.price.value = product.price;
    this.form.discount.value = product.discount;
    this.form.quantity.value = product.quantity;
    this.form.status.value = product.status;
    this.renderImages(product.images);
  }

  upload = async () => {
    const [file] = this.form.upload.files;
    const formData = new FormData();
    const result = {
      source: file.name
    };

    formData.append('image', file);

    try {
      const response = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData
      });

      const { data } = await response;

      result.url = data.link;

      const image = this.getImageElement(result);

      image.classList.add('sortable-list__item');
      this.imageListContainer.querySelector('.sortable-list').append(image);
    } catch (err) {
      console.error(err);
    }
  }

  onUploadImageClick () {
    this.form.upload.click();
  }

  onFormSubmit = async event => {
    event.preventDefault();

    const formData = new FormData(this.form);
    const method = this.productId ? 'PATCH' : 'POST';
    const customEvent = this.productId
      ? new CustomEvent('product-updated', { detail: this.productId})
      : new CustomEvent('product-saved');

    const responseId = await fetchJson(this.url, {
      method: method,
      body: formData
    });

    this.element.dispatchEvent(customEvent);
  }

  addListeners() {
    this.form.upload.addEventListener('change', this.upload);
    this.form.uploadImage.addEventListener('click', this.onUploadImageClick);
    this.form.addEventListener('submit', this.onFormSubmit);
  }

  destroy() {
    this.element.remove();
  }
}
