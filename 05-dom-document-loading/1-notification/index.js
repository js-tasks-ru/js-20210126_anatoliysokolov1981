export default class NotificationMessage {
  static element = null;
  static timerId = null;

  constructor(message = '', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${Math.floor(this.duration / 1000)}s">
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

  show() {
    if (NotificationMessage.element) {
      this.destroy();
      clearTimeout(NotificationMessage.timerId);
    }

    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    NotificationMessage.element = this.element;
    document.body.append(this.element);

    NotificationMessage.timerId = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  destroy() {
    NotificationMessage.element.remove();
  }
}
