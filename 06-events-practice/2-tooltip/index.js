class Tooltip {
  static instance = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    } else {
      Tooltip.instance = this;
    }

    this.active = false;
  }

  render(content) {
    const element = document.createElement('div');

    element.innerHTML = content;
    element.classList.add('tooltip');
    this.element = element;
    document.body.append(this.element);
  }

  onMouseMove(event) {
    this.element.style.left = event.pageX + 'px';
    this.element.style.top = event.pageY + 'px';
  }

  onDocumentPointerover(event) {
    if (!event.target.dataset.tooltip) return;

    const content = event.target.dataset.tooltip;

    if (!this.active) {
      this.render(content);
      this.active = true;
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    if (this.active) this.element.innerHTML = content;
  }

  onDocumentPointerout(event) {
    document.removeEventListener('mousemove', this.onMouseMove);
    if (this.element) this.element.remove();
    this.active = false;
  }

  initialize() {
    document.addEventListener('pointerover', this.onDocumentPointerover.bind(this));
    document.addEventListener('pointerout', this.onDocumentPointerout.bind(this));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Tooltip.instance = null;
    document.removeEventListener('pointerover', this.onDocumentPointerover);
    document.removeEventListener('pointerout', this.onDocumentPointerout);
  }
}

const tooltip = new Tooltip();

export default tooltip;
