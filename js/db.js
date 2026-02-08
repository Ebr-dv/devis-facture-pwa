class Database {
  constructor() {
    this.dbName = 'DevisFacturesDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('type', 'type', { unique: false });
          docStore.createIndex('date', 'date', { unique: false });
          docStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('clients')) {
          db.createObjectStore('clients', { keyPath: 'id' });
        }
      };
    });
  }

  async addDocument(doc) {
    doc.id = doc.id || Date.now().toString();
    doc.date = doc.date || new Date().toISOString();
    return this._transaction('documents', 'readwrite', (store) => store.add(doc));
  }

  async updateDocument(doc) {
    return this._transaction('documents', 'readwrite', (store) => store.put(doc));
  }

  async deleteDocument(id) {
    return this._transaction('documents', 'readwrite', (store) => store.delete(id));
  }

  async getDocument(id) {
    return this._transaction('documents', 'readonly', (store) => store.get(id));
  }

  async getAllDocuments() {
    return this._transaction('documents', 'readonly', (store) => store.getAll());
  }

  async getDocumentsByType(type) {
    return this._transaction('documents', 'readonly', (store) => {
      const index = store.index('type');
      return index.getAll(type);
    });
  }

  async saveSetting(key, value) {
    return this._transaction('settings', 'readwrite', (store) => {
      return store.put({ key, value });
    });
  }

  async getSetting(key) {
    return this._transaction('settings', 'readonly', (store) => store.get(key));
  }

  async addClient(client) {
    client.id = client.id || Date.now().toString();
    return this._transaction('clients', 'readwrite', (store) => store.add(client));
  }

  async getAllClients() {
    return this._transaction('clients', 'readonly', (store) => store.getAll());
  }

  async _transaction(storeName, mode, callback) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async exportData() {
    const documents = await this.getAllDocuments();
    const clients = await this.getAllClients();
    return {
      documents,
      clients,
      exportDate: new Date().toISOString()
    };
  }

  async importData(data) {
    if (data.documents) {
      for (const doc of data.documents) {
        await this.addDocument(doc);
      }
    }
    if (data.clients) {
      for (const client of data.clients) {
        await this.addClient(client);
      }
    }
  }

  async clearAll() {
    const stores = ['documents', 'clients', 'settings'];
    for (const store of stores) {
      await this._transaction(store, 'readwrite', (s) => s.clear());
    }
  }
}

const db = new Database();