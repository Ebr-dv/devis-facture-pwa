let db;
let dbeManager;
let currentDocument = null;
let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', async () => {
  await db.init();
  initializeUI();
  loadSettings();
  displayDocuments();
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      deferredPrompt = null;
      document.getElementById('installBtn').style.display = 'none';
    }
  }
});

function initializeUI() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Modal
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.close');
  document.getElementById('addBtn').addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Formulaire
  document.getElementById('documentForm').addEventListener('submit', saveDocument);
  document.getElementById('addItemBtn').addEventListener('click', addItemRow);
  document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
  document.getElementById('deleteBtn').addEventListener('click', deleteDocument);

  // Recherche et filtres
  document.getElementById('searchInput').addEventListener('input', filterDocuments);
  document.getElementById('filterType').addEventListener('change', filterDocuments);

  // Paramètres
  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', importData);
  document.getElementById('clearBtn').addEventListener('click', clearAllData);
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  if (tabName === 'stats') {
    updateStatistics();
  }
}

function openModal(docId = null) {
  currentDocument = null;
  document.getElementById('modalTitle').textContent = 'Nouveau Document';
  document.getElementById('documentForm').reset();
  document.getElementById('itemsList').innerHTML = '';
  document.getElementById('deleteBtn').style.display = 'none';

  if (docId) {
    db.getDocument(docId).then(doc => {
      currentDocument = doc;
      document.getElementById('modalTitle').textContent = `${doc.type} ${doc.id}`;
      document.getElementById('docType').value = doc.type;
      document.getElementById('clientName').value = doc.clientName;
      document.getElementById('clientEmail').value = doc.clientEmail || '';
      document.getElementById('clientPhone').value = doc.clientPhone || '';
      document.getElementById('clientAddress').value = doc.clientAddress || '';
      document.getElementById('notes').value = doc.notes || '';
      document.getElementById('status').value = doc.status || 'brouillon';

      if (doc.items) {
        doc.items.forEach(item => {
          addItemRow(item.description, item.quantity, item.price);
        });
      }

      document.getElementById('deleteBtn').style.display = 'block';
    });
  } else {
    addItemRow();
  }

  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  currentDocument = null;
}

function addItemRow(description = '', quantity = '', price = '') {
  const itemsList = document.getElementById('itemsList');
  const itemRow = document.createElement('div');
  itemRow.className = 'item-row';

  itemRow.innerHTML = `
    <input type="text" placeholder="Description" value="${description}" class="item-description">
    <input type="number" placeholder="Quantité" value="${quantity}" class="item-quantity" min="0" step="0.01">
    <input type="number" placeholder="Prix" value="${price}" class="item-price" min="0" step="0.01">
    <button type="button" class="btn-remove">×</button>
  `;

  itemRow.querySelector('.btn-remove').addEventListener('click', () => {
    itemRow.remove();
  });

  itemsList.appendChild(itemRow);
}

async function saveDocument(e) {
  e.preventDefault();

  const items = Array.from(document.querySelectorAll('.item-row')).map(row => ({
    description: row.querySelector('.item-description').value,
    quantity: parseFloat(row.querySelector('.item-quantity').value) || 0,
    price: parseFloat(row.querySelector('.item-price').value) || 0
  }));

  const doc = {
    id: currentDocument?.id,
    type: document.getElementById('docType').value,
    clientName: document.getElementById('clientName').value,
    clientEmail: document.getElementById('clientEmail').value,
    clientPhone: document.getElementById('clientPhone').value,
    clientAddress: document.getElementById('clientAddress').value,
    notes: document.getElementById('notes').value,
    status: document.getElementById('status').value,
    items: items,
    total: items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  };

  if (currentDocument) {
    doc.id = currentDocument.id;
    doc.date = currentDocument.date;
    await db.updateDocument(doc);
  } else {
    await db.addDocument(doc);
  }

  closeModal();
  displayDocuments();
}

function deleteDocument() {
  if (currentDocument && confirm('Confirmer la suppression ?')) {
    db.deleteDocument(currentDocument.id);
    closeModal();
    displayDocuments();
  }
}

async function displayDocuments() {
  const documents = await db.getAllDocuments();
  const list = document.getElementById('documentsList');
  list.innerHTML = '';

  if (documents.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999;">Aucun document</p>';
    return;
  }

  documents.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'document-card';
    card.onclick = () => openModal(doc.id);

    const date = new Date(doc.date).toLocaleDateString('fr-FR');
    card.innerHTML = `
      <div class="document-card-header">
        <span class="document-type ${doc.type}">${doc.type}</span>
        <span class="status-badge ${doc.status}">${doc.status}</span>
      </div>
      <div class="document-info">
        <div><strong>${doc.clientName}</strong></div>
        <div>${date}</div>
      </div>
      <div class="document-amount">${doc.total?.toFixed(2) || '0'}€</div>
    `;

    list.appendChild(card);
  });
}

function filterDocuments() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const type = document.getElementById('filterType').value;

  document.querySelectorAll('.document-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    const cardType = card.querySelector('.document-type').textContent;
    const matches = (text.includes(search)) && (!type || cardType === type);
    card.style.display = matches ? 'block' : 'none';
  });
}

async function generatePDF() {
  const settings = await db.getSetting('company');
  const companyInfo = settings?.value || {};
  await PDFGenerator.generate(currentDocument, companyInfo);
}

async function updateStatistics() {
  const documents = await db.getAllDocuments();

  const devisAttente = documents.filter(d => d.type === 'devis' && d.status !== 'facturé').length;
  const facturesImpayees = documents.filter(d => d.type === 'facture' && d.status !== 'payé').length;
  const caTotal = documents.reduce((sum, d) => sum + (d.total || 0), 0);
  const caRealise = documents.filter(d => d.status === 'payé').reduce((sum, d) => sum + (d.total || 0), 0);

  document.getElementById('statDevisAttente').textContent = devisAttente;
  document.getElementById('statFacturesImpayees').textContent = facturesImpayees;
  document.getElementById('statCATotal').textContent = caTotal.toFixed(2) + '€';
  document.getElementById('statCARealise').textContent = caRealise.toFixed(2) + '€';
}

async function loadSettings() {
  const companyName = await db.getSetting('companyName');
  const companyEmail = await db.getSetting('companyEmail');
  const companyPhone = await db.getSetting('companyPhone');
  const companyAddress = await db.getSetting('companyAddress');
  const companySIREN = await db.getSetting('companySIREN');

  if (companyName) document.getElementById('companyName').value = companyName.value;
  if (companyEmail) document.getElementById('companyEmail').value = companyEmail.value;
  if (companyPhone) document.getElementById('companyPhone').value = companyPhone.value;
  if (companyAddress) document.getElementById('companyAddress').value = companyAddress.value;
  if (companySIREN) document.getElementById('companySIREN').value = companySIREN.value;
}

async function saveSettings(e) {
  e.preventDefault();

  await db.saveSetting('companyName', document.getElementById('companyName').value);
  await db.saveSetting('companyEmail', document.getElementById('companyEmail').value);
  await db.saveSetting('companyPhone', document.getElementById('companyPhone').value);
  await db.saveSetting('companyAddress', document.getElementById('companyAddress').value);
  await db.saveSetting('companySIREN', document.getElementById('companySIREN').value);

  alert('Paramètres enregistrés !');
}

async function exportData() {
  const data = await db.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const data = JSON.parse(text);
    await db.importData(data);
    displayDocuments();
    alert('Données importées !');
  };
  input.click();
}

async function clearAllData() {
  if (confirm('Êtes-vous sûr ? Cette action est irréversible.')) {
    await db.clearAll();
    displayDocuments();
    alert('Tous les données ont été effacées.');
  }
}