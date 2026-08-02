const fs = require('fs');
const path = require('path');
const {
  pacientes: pacientesSeed,
  atendimentos: atendimentosSeed,
  leitos: leitosSeed,
  configuracao: configuracaoSeed,
  evolucoes: evolucoesSeed,
} = require('./seedData');

const STORE_FILE = path.join(__dirname, 'store.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialStore() {
  return {
    pacientes: clone(pacientesSeed),
    atendimentos: clone(atendimentosSeed),
    leitos: clone(leitosSeed),
    configuracao: clone(configuracaoSeed),
    evolucoes: clone(evolucoesSeed),
  };
}

let store = null;

function ensureStore() {
  if (store) {
    return store;
  }

  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);

      store = {
        pacientes: Array.isArray(parsed.pacientes) ? parsed.pacientes : clone(pacientesSeed),
        atendimentos: Array.isArray(parsed.atendimentos) ? parsed.atendimentos : clone(atendimentosSeed),
        leitos: Array.isArray(parsed.leitos) ? parsed.leitos : clone(leitosSeed),
        configuracao: parsed.configuracao && typeof parsed.configuracao === 'object' ? parsed.configuracao : clone(configuracaoSeed),
        evolucoes: Array.isArray(parsed.evolucoes) ? parsed.evolucoes : clone(evolucoesSeed),
      };
    } catch (error) {
      console.warn('Não foi possível carregar o estado persistido; usando dados iniciais.', error.message);
      store = createInitialStore();
    }
  } else {
    store = createInitialStore();
  }

  saveStore();
  return store;
}

function saveStore() {
  if (!store) {
    store = createInitialStore();
  }

  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function getStore() {
  return ensureStore();
}

function getNextId(items) {
  const ids = items
    .map((item) => Number(item.id))
    .filter((value) => Number.isFinite(value));

  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

function resetStore() {
  store = createInitialStore();
  saveStore();
}

module.exports = {
  getStore,
  saveStore,
  getNextId,
  resetStore,
};
