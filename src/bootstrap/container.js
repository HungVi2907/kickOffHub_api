class Container {
  constructor() {
    this.registry = new Map();
  }

  set(token, value) {
    if (!token) {
      throw new Error('Container token is required');
    }
    this.registry.set(token, value);
    return value;
  }

  has(token) {
    return this.registry.has(token);
  }

  get(token) {
    if (!this.registry.has(token)) {
      throw new Error(`Dependency '${token}' has not been registered in the container.`);
    }
    return this.registry.get(token);
  }

  resolve(token, factory) {
    if (this.registry.has(token)) {
      return this.registry.get(token);
    }
    if (typeof factory !== 'function') {
      throw new Error(`Dependency '${token}' is missing and no factory was provided.`);
    }
    const value = factory(this);
    this.registry.set(token, value);
    return value;
  }
}

export function createContainer() {
  return new Container();
}

export default createContainer;
