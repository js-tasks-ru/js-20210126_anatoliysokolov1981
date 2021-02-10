export default class NotificationMessage {
  static element = null;
  static timerId = null;

  constructor(message = '', {duration = 2000, type = 'success'} = {}) {
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

    NotificationMessage.element = document.createElement('div');
    NotificationMessage.element.innerHTML = this.template;
    NotificationMessage.element = NotificationMessage.element.firstElementChild;
    document.body.append(NotificationMessage.element);

    NotificationMessage.timerId = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  // remove() {
  //   NotificationMessage.element.remove();
  // }

  destroy() {
    NotificationMessage.element.remove();
  }
}

