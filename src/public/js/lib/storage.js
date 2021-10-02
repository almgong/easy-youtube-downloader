export class Storage {
  constructor(engine = window.localStorage, namespace = '@easy-youtube-downloader') {
    this.engine = engine;
    this.namespace = namespace;
  }

  get(key) {
    return this.engine.getItem(this._translateToStorageKey(key));
  }

  set(key, value) {
    return this.engine.setItem(this._translateToStorageKey(key), value);
  }

  clear() {
    this.engine.clear();
  }

  _translateToStorageKey(key) {
    return [
      this.namespace,
      '/',
      key
    ].join('');
  }
}

export default new Storage();
