export default class NotificationMessage {
  static element = null;

  constructor(message = '', {duration = 2000, type = 'success'} = {}) {

    if (NotificationMessage.element) NotificationMessage.element.remove();

    this.message = message;
    this.duration = duration;
    this.durationInSeconds = Math.floor(duration / 1000) + 's';
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.durationInSeconds}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    NotificationMessage.element = this.element;
  }

  show(parent = document.body) {
    parent.append(this.element);
    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.element = null;
  }
}
