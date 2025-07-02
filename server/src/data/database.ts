import { List } from './models/list';
import { ModelFactory } from './utils/model-factory';

class Database {
  private static instance: Database | null = null;

  private data: List[];

  private constructor() {
    this.data = [];
  }

  public static get Instance(): Database {
    if (!this.instance) {
      this.instance = new Database();
    }

    return this.instance;
  }

  public setData(data: List[]): void {
    // Ensure all data are proper List instances
    this.data = ModelFactory.ensureListInstances(data);
  }

  public getData(): List[] {
    // Ensure all returned data are proper List instances
    return ModelFactory.ensureListInstances(this.data);
  }
}

export { Database };
