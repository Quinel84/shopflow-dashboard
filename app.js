/* ═══════════════════════════════════════════════════
   ShopFlow Dashboard — Lógica Principal (app.js)
   Sessão 2: Relógio, estrutura e eventos base
   ═══════════════════════════════════════════════════ */

// ── Estado global do dashboard ──────────────────────
// Objecto central que guarda os dados do dashboard.
// Vai crescer em cada sessão.
const ShopFlow = {
  versao: '2.0',
  loja: {
    nome: 'ShopFlow',
    cidade: 'Porto',
    moeda: 'EUR',
  },
  dados: {
    produtos: [], // Preenchido na Sessão 3
    totalVendas: 0, // Actualizado na Sessão 4
    totalReceita: 0, // Actualizado na Sessão 4
    temperatura: null, // Preenchido na Sessão 7
    humidade: null, // Preenchido na Sessão 7
  },
  ligacoes: {
    websocket: null, // Criado na Sessão 4
    mqtt: null, // Criado na Sessão 7
  },
};

// ── Utilitários ──────────────────────────────────────

/**
 * Formata um número como valor monetário em EUR
 * @param {number} valor - O valor a formatar
 * @returns {string} - Ex: '1.234,56 EUR'
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(valor);
}

/**
 * Formata uma data no padrão português
 * @param {Date} data - O objecto Date a formatar
 * @returns {string} - Ex: 'segunda-feira, 11 de março de 2026'
 */
function formatarData(data) {
  return data.toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ── Relógio em tempo real ────────────────────────────

function actualizarRelogio() {
  const agora = new Date();

  // Formatar hora com dois dígitos (ex: 09:05:03)
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const segundos = String(agora.getSeconds()).padStart(2, '0');
  const horaFormatada = `${horas}:${minutos}:${segundos}`;

  // Actualizar o elemento do relógio no HTML
  const elemRelogio = document.getElementById('relogio');
  if (elemRelogio) elemRelogio.textContent = horaFormatada;

  // Actualizar a data (só precisa de mudar uma vez por dia,
  // mas actualizamos aqui para simplificar)
  const elemData = document.getElementById('data-hoje');
  if (elemData) elemData.textContent = formatarData(agora);
}

// Iniciar o relógio: actualizar imediatamente e depois
// a cada 1000 milissegundos (1 segundo)
actualizarRelogio();
setInterval(actualizarRelogio, 1000);

// ── Gestão de eventos — Filtros de stock ─────────────
// Os botões de filtro são criados aqui.
// A lógica de filtro real será adicionada na Sessão 3.

document.querySelectorAll('.sf-btn').forEach((botao) => {
  botao.addEventListener('click', (evento) => {
    // Remover classe activo de todos os botões
    document.querySelectorAll('.sf-btn').forEach((b) => {
      b.classList.remove('sf-btn--activo');
    });
    // Activar o botão clicado
    evento.target.classList.add('sf-btn--activo');

    const categoria = evento.target.dataset.categoria;
    console.log('Filtro seleccionado:', categoria);
    // Na Sessão 3: filtrarProdutos(categoria);
  });
});

// ── Inicialização ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  console.log(`ShopFlow Dashboard v${ShopFlow.versao} iniciado`);
  console.log('Sessão 2: Estrutura base criada com sucesso');
  console.log('Próximos passos:');
  console.log('  Sessão 3: Carregar produtos a partir de produtos.json');
  console.log('  Sessão 4: Ligar WebSocket para vendas em tempo real');

  // Activar o primeiro botão de filtro
  const primeiroBotao = document.querySelector('.sf-btn');
  if (primeiroBotao) primeiroBotao.classList.add('sf-btn--activo');
});

//Botão tema escuro
document.getElementById('btn-tema').addEventListener('click', () => {
  document.body.classList.toggle('tema-escuro');
  const temaModo = document.body.classList.contains('tema-escuro');
  evento.target.textContent = temaModo ? 'Modo Claro' : 'Modo Escuro';
});

//Função de Loja aberta ou fechada
function estaAberta() {
  const agora = new Date();
  const hora = agora.getHours();
  const diaSemana = agora.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado

  const diaUtil = diaSemana >= 1 && diaSemana <= 5;
  const horario = hora >= 9 && hora < 18;

  return diaUtil && horario;
}

console.log(estaAberta() ? 'Loja aberta' : 'Loja fechada');

function atualizarEstadoLoja() {
  const elemento = document.getElementById('estado-loja');

  if (estaAberta()) {
    elemento.textContent = 'Aberta';
    elemento.className = 'aberta';
  } else {
    elemento.textContent = 'Fechada';
    elemento.className = 'fechada';
  }
}

atualizarEstadoLoja();
setInterval(atualizarEstadoLoja, 60000);
