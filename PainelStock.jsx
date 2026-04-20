/* ═══════════════════════════════════════════════════
   ShopFlow — Componentes React do Painel de Stock
   Sessão 6: Interfaces Dinâmicas com React
   ═══════════════════════════════════════════════════ */
 
// ── Utilitário: formatar moeda ───────────────────────
function formatarMoedaReact(valor) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(valor);
}
 
// ── Utilitário: estado do stock ──────────────────────
function estadoStockReact(stock) {
    if (stock === 0) return { classe: 'esgotado', texto: 'Esgotado' };
    if (stock <= 5)  return { classe: 'baixo',    texto: `Apenas ${stock}` };
    return               { classe: 'ok',       texto: `${stock} unid.` };
}
 
// ── Componente CartaoProduto ─────────────────────────
// Recebe um único produto como prop e renderiza o cartão.
// Não tem estado próprio — é um componente puro.
function CartaoProduto({ produto, pesquisa }) {
    const estado = estadoStockReact(produto.stock);
    const classeCartao = produto.stock === 0
        ? 'sf-produto-cartao sf-produto-cartao--esgotado'
        : 'sf-produto-cartao';
 
    return (
        <div className={classeCartao} data-id={produto.id}>
            <div className="sf-produto-info">
                <div className="sf-produto-nome">{<TextoDestacado texto={produto.nome} pesquisa={pesquisa} />}</div>
                <div className="sf-produto-categoria">{produto.categoria}</div>
            </div>
            <div className="sf-produto-direita">
                <span className="sf-produto-preco">
                    {formatarMoedaReact(produto.preco)}
                </span>
                <span className={`sf-produto-stock sf-produto-stock--${estado.classe}`}>
                    {estado.texto}
                </span>
            </div>
        </div>
    );
}

// ── Componente BarraFiltros ──────────────────────────
function BarraFiltros({
    categorias,
    categoriaActiva,
    onMudarCategoria,
    pesquisa,
    onMudarPesquisa,
    ordenacao,
    onMudarOrdenacao,
    totalFiltrado,
    totalGeral
}) {
    const corTexto = totalFiltrado === 0 ? '#C62828' : '#757575';

    return (
        <div className="sf-painel__filtros-react">
 
            {/* Botões de categoria */}
            <div className="sf-filtros-categorias">
                <button
                    className={`sf-btn ${categoriaActiva === 'todos' ? 'sf-btn--activo' : ''}`}
                    onClick={() => onMudarCategoria('todos')}
                >
                    Todos
                </button>
                {categorias.map(cat => (
                    <button
                        key={cat}
                        className={`sf-btn ${categoriaActiva === cat ? 'sf-btn--activo' : ''}`}
                        onClick={() => onMudarCategoria(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
 
            {/* Campo de pesquisa */}
            <input
                type="text"
                className="sf-pesquisa"
                placeholder="Pesquisar produto..."
                value={pesquisa}
                onChange={e => onMudarPesquisa(e.target.value)}
            />
 
            {/* Selector de ordenação */}
            <select
                className="sf-ordenacao"
                value={ordenacao}
                onChange={e => onMudarOrdenacao(e.target.value)}
            >
                <option value="nome">Nome (A-Z)</option>
                <option value="preco-asc">Preço (menor)</option>
                <option value="preco-desc">Preço (maior)</option>
                <option value="stock">Stock (maior)</option>
            </select>
            <p style={{ fontSize: '0.75rem', color: corTexto }}>
                A mostrar {totalFiltrado} de {totalGeral} produtos
            </p>

        </div>
    );
}
// ── Componente PainelStock ───────────────────────────
function PainelStock() {
    // ── Estado ──────────────────────────────────────
    const [produtos, setProdutos]           = React.useState([]);
    const [categoriaActiva, setCategoria]   = React.useState('todos');
    const [pesquisa, setPesquisa]           = React.useState('');
    const [ordenacao, setOrdenacao]         = React.useState('nome');
    const [aCarregar, setACarregar]         = React.useState(true);
    const [erro, setErro]                   = React.useState(null);
 
    // ── Carregar produtos ao montar ──────────────────
    React.useEffect(() => {
        fetch('data/produtos.json')
            .then(r => {
                if (!r.ok) throw new Error(`Erro HTTP: ${r.status}`);
                return r.json();
            })
            .then(dados => {
                setProdutos(dados.produtos);
                setACarregar(false);
            })
            .catch(e => {
                setErro(e.message);
                setACarregar(false);
            });
    }, []);
 
    // ── Actualizar badge quando os produtos mudam ────
    React.useEffect(() => {
        const badge = document.getElementById('badge-stock');
        if (badge) {
            badge.textContent = `${produtosFiltrados.length} produto${
                produtosFiltrados.length !== 1 ? 's' : ''}`;
        }
    });
 
    // ── Calcular categorias únicas ───────────────────
    const categorias = [...new Set(produtos.map(p => p.categoria))].sort();
 
    // ── Filtrar por categoria e pesquisa ─────────────
    let produtosFiltrados = produtos.filter(p => {
        const naCategoria = categoriaActiva === 'todos' ||
                            p.categoria === categoriaActiva;
        const naPesquisa  = p.nome.toLowerCase()
                             .includes(pesquisa.toLowerCase());
        return naCategoria && naPesquisa;
    });

    const totalProdutos = produtosFiltrados.length;

    const totalComStock = produtosFiltrados.filter(p => p.stock > 0).length;

    const totalEsgotados = produtosFiltrados.filter(p => p.stock === 0).length;

    const valorTotalStock = produtosFiltrados.reduce(
        (soma, p) => soma + (p.preco * p.stock),
        0
    );
 
    // ── Ordenar ──────────────────────────────────────
    produtosFiltrados = [...produtosFiltrados].sort((a, b) => {
        switch (ordenacao) {
            case 'preco-asc':  return a.preco - b.preco;
            case 'preco-desc': return b.preco - a.preco;
            case 'stock':      return b.stock - a.stock;
            default:           return a.nome.localeCompare(b.nome);
        }
    });
 
    // ── Renderizar ───────────────────────────────────
    if (aCarregar) {
        return <p className="sf-placeholder">A carregar produtos...</p>;
    }
 
    if (erro) {
        return <p className="sf-placeholder">Erro: {erro}</p>;
    }
 
    return (
        <div>
            <div className="sf-stock-resumo">
                <div className="sf-kpi">
                    <span className="sf-kpi-valor">{totalProdutos}</span>
                    <span className="sf-kpi-label">Total produtos</span>
                </div>

                <div className="sf-kpi">
                    <span className="sf-kpi-valor">{totalComStock}</span>
                    <span className="sf-kpi-label">Com stock</span>
                </div>

                <div className="sf-kpi">
                    <span className="sf-kpi-valor">{totalEsgotados}</span>
                    <span className="sf-kpi-label">Esgotados</span>
                </div>

                <div className="sf-kpi">
                    <span className="sf-kpi-valor">
                        {valorTotalStock.toFixed(2)} €
                    </span>
                    <span className="sf-kpi-label">Valor stock</span>
                </div>
            </div>


            <BarraFiltros
                totalFiltrado={produtosFiltrados.length}
                totalGeral={produtos.length}
                categorias={categorias}
                categoriaActiva={categoriaActiva}
                onMudarCategoria={setCategoria}
                pesquisa={pesquisa}
                onMudarPesquisa={setPesquisa}
                ordenacao={ordenacao}
                onMudarOrdenacao={setOrdenacao}
            />

            {produtosFiltrados.length === 0 ? (
                <div className="sf-sem-produtos">
                    Nenhum produto encontrado.
                </div>
            ) : (
                <div className="sf-lista-produtos">
                    {produtosFiltrados.map(produto => (
                        <CartaoProduto key={produto.id} produto={produto} pesquisa={pesquisa}/>
                    ))}
                </div>
            )}
        </div>
    );

}
 
function TextoDestacado({ texto, pesquisa }) {
    if (!pesquisa) return <span>{texto}</span>;
 
    const regex  = new RegExp(`(${pesquisa})`, 'gi');
    const partes = texto.split(regex);
 
    return (
        <span>
            {partes.map((parte, i) =>
                regex.test(parte)
                    ? <mark key={i} style={{ background: '#FFF9C4' }}>{parte}</mark>
                    : <span key={i}>{parte}</span>
            )}
        </span>
    );
}

// ── Montar o componente no DOM ───────────────────────
const rootElement = document.getElementById('react-stock');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<PainelStock />);
}
