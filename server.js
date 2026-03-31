/* ═══════════════════════════════════════════════════
   ShopFlow — Servidor WebSocket (server.js)
   Sessão 4: Gerador de vendas em tempo real
   Corre no Render em: shopflow-servidor.onrender.com
   ═══════════════════════════════════════════════════ */
 
   const WebSocket = require('ws');
   const http      = require('http');
    
   // ── Servidor HTTP mínimo (obrigatório no Render) ─────
   // O Render precisa de um servidor HTTP para manter o
   // projecto activo. O WebSocket corre sobre este servidor.
   const servidor = http.createServer((req, res) => {
       res.writeHead(200, { 'Content-Type': 'text/plain' });
       res.end('ShopFlow WebSocket Server — em funcionamento');
   });
    
   // ── Servidor WebSocket ────────────────────────────────
   const wss = new WebSocket.Server({ server: servidor });
    
   // ── Dados simulados da loja ───────────────────────────
   const PRODUTOS = [
       { nome: 'Portátil ShopFlow Pro 15',   preco: 899.99  },
       { nome: 'Portátil ShopFlow Ultra 13', preco: 1149.99 },
       { nome: 'Portátil ShopFlow Gaming 17',preco: 1599.99 },
       { nome: 'Rato Ergonómico SF-M1',       preco: 49.99   },
       { nome: 'Teclado Mecânico SF-K2',      preco: 89.99   },
       { nome: 'Headset SF-H1 Pro',           preco: 79.99   },
       { nome: 'Webcam SF-W1 4K',             preco: 129.99  },
       { nome: 'Monitor SF-D27 QHD',          preco: 349.99  },
       { nome: 'Hub USB-C SF-U1 7-em-1',      preco: 39.99   },
       { nome: 'Mochila SF-B1 15.6"',         preco: 59.99   },
   ];
    
   const LOCALIDADES = [
       'Porto', 'Lisboa', 'Braga', 'Coimbra', 'Aveiro',
       'Faro', 'Funchal', 'Setúbal', 'Évora', 'Viseu'
   ];
    
   // ── Utilitários ───────────────────────────────────────
   function aleatorio(min, max) {
       return Math.floor(Math.random() * (max - min + 1)) + min;
   }
    
   function elementoAleatorio(array) {
       return array[aleatorio(0, array.length - 1)];
   }
    
   /**
    * Gera uma venda simulada aleatória.
    * @returns {Object} - Dados da venda
    */
   function gerarVenda() {
       const produto    = elementoAleatorio(PRODUTOS);
       const quantidade = aleatorio(1, 3);
       const localidade = elementoAleatorio(LOCALIDADES);
    
       return {
           tipo:       'venda',
           id:         Date.now(),
           produto:    produto.nome,
           preco:      produto.preco,
           quantidade: quantidade,
           total:      parseFloat((produto.preco * quantidade).toFixed(2)),
           localidade: localidade,
           hora:       new Date().toLocaleTimeString('pt-PT'),
       };
   }
    
   // ── Lógica de difusão (broadcast) ────────────────────
   // Envia uma mensagem a TODOS os clientes ligados
   function broadcast(mensagem) {
       const texto = JSON.stringify(mensagem);
       wss.clients.forEach(cliente => {
           if (cliente.readyState === WebSocket.OPEN) {
               cliente.send(texto);
           }
       });
   }
    
   // ── Gestor de ligações de clientes ───────────────────
   wss.on('connection', (ws, pedido) => {
       const ip = pedido.socket.remoteAddress;
       console.log(`Cliente ligado: ${ip} | Total: ${wss.clients.size}`);
    
       // Enviar mensagem de boas-vindas ao novo cliente
       ws.send(JSON.stringify({
           tipo:     'ligado',
           mensagem: 'Bem-vindo ao servidor ShopFlow!',
           hora:     new Date().toLocaleTimeString('pt-PT'),
       }));
    
       ws.on('close', () => {
           console.log(`Cliente desligado | Total: ${wss.clients.size}`);
       });
    
       ws.on('error', (erro) => {
           console.error('Erro no WebSocket do cliente:', erro.message);
       });
   });
    
   // ── Gerador de vendas automático ─────────────────────
   // Gera uma venda aleatória entre 3 e 6 segundos
   // e envia a todos os clientes ligados via broadcast.
   function iniciarGeradorVendas() {
       const intervaloMin = 3000;  // 3 segundos
       const intervaloMax = 6000;  // 6 segundos
    
       function agendarProximaVenda() {
           const espera = aleatorio(intervaloMin, intervaloMax);
           setTimeout(() => {
               if (wss.clients.size > 0) {
                   const venda = gerarVenda();
                   broadcast(venda);
                   console.log(`Venda enviada: ${venda.produto} — ${venda.total} EUR`);
               }
               agendarProximaVenda(); // Agendar a próxima
           }, espera);
       }
    
       agendarProximaVenda();
       console.log('Gerador de vendas iniciado');
   }
    
   // ── Iniciar ───────────────────────────────────────────
   const PORTA = process.env.PORT || 3000;
   servidor.listen(PORTA, () => {
       console.log(`Servidor ShopFlow activo na porta ${PORTA}`);
       iniciarGeradorVendas();
   });
   