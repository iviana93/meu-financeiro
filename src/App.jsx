import { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Trash2, Plus, Wallet, PieChart, List, Calendar as CalendarIcon, X } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [gastos, setGastos] = useState([]);
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().substring(0, 7)); // Formato "YYYY-MM"
  const [categoriaAberta, setCategoriaAberta] = useState(null);

  const categoriasConf = {
    Alimentação: { cor: "#ff7675" },
    Transporte: { cor: "#74b9ff" },
    Mercado: { cor: "#55e6c1" },
    Outros: { cor: "#a29bfe" }
  };

  useEffect(() => {
    const q = query(collection(db, "gastos"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGastos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const adicionarGasto = async () => {
    const match = input.match(/(\d+([.,]\d+)?)\s+(.+)/);
    if (!match) return alert("Formato: 45 pizza");

    const valor = parseFloat(match[1].replace(',', '.'));
    const desc = match[3];
    const busca = desc.toLowerCase();

    let categoria = "Outros";
    if (/(ifood|pizza|lanche|comida|restaurante|cafe|janta|almoço|burguer|doce)/.test(busca)) categoria = "Alimentação";
    else if (/(uber|99|gasolina|transporte|bus|metro|estacionamento|pedágio)/.test(busca)) categoria = "Transporte";
    else if (/(mercado|feira|compra|extra|carrefour|asai|atacadão|pão|leite)/.test(busca)) categoria = "Mercado";

    try {
      await addDoc(collection(db, "gastos"), { 
        valor, 
        descricao: desc, 
        categoria, 
        data: new Date().toISOString() 
      });
      setInput("");
    } catch (e) {
      alert("Erro ao salvar no banco!");
    }
  };

  const deletarGasto = async (id) => {
    if (window.confirm("Remover este registro permanentemente?")) {
      await deleteDoc(doc(db, "gastos", id));
    }
  };

  const gastosFiltrados = gastos.filter(g => g.data.startsWith(mesFiltro));
  const totalMes = gastosFiltrados.reduce((acc, g) => acc + g.valor, 0);

  const resumoCategorias = gastosFiltrados.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
    return acc;
  }, {});

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc", padding: "40px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER & FILTRO */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-1px", margin: 0 }}>Dashboard Financeiro</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", color: "#94a3b8" }}>
              <CalendarIcon size={16} />
              <input 
                type="month" 
                value={mesFiltro} 
                onChange={(e) => setMesFiltro(e.target.value)}
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "white", padding: "5px 10px", borderRadius: "8px", cursor: "pointer" }}
              />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase" }}>Gasto no Período</span>
            <div style={{ fontSize: "3rem", fontWeight: "900", color: "#22c55e" }}>R$ {totalMes.toFixed(2)}</div>
          </div>
        </div>

        {/* INPUT DE LANÇAMENTO */}
        <div style={{ display: "flex", gap: "15px", backgroundColor: "#1e293b", padding: "15px", borderRadius: "20px", marginBottom: "40px", border: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "10px", padding: "0 10px" }}>
            <Wallet size={20} color="#94a3b8" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarGasto()}
              placeholder="Digite valor e descrição (ex: 50 mercado)..."
              style={{ backgroundColor: "transparent", border: "none", color: "white", outline: "none", fontSize: "1rem", width: "100%" }}
            />
          </div>
          <button onClick={adicionarGasto} style={{ backgroundColor: "#22c55e", border: "none", borderRadius: "12px", padding: "10px 25px", color: "white", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={18} /> Lançar
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "40px" }}>
          
          {/* COLUNA ESQUERDA: HISTÓRICO */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#94a3b8" }}>
              <List size={18} /> <h3>Lançamentos</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {gastosFiltrados.map(g => (
                <div key={g.id} style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #334155" }}>
                  <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                    <div style={{ width: "4px", height: "40px", borderRadius: "4px", backgroundColor: categoriasConf[g.categoria]?.cor }} />
                    <div>
                      <div style={{ fontWeight: "600" }}>{g.descricao}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(g.data).toLocaleDateString('pt-BR')} • {g.categoria}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>R$ {g.valor.toFixed(2)}</span>
                    <button onClick={() => deletarGasto(g.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLUNA DIREITA: PLANILHA POR CATEGORIA */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#94a3b8" }}>
              <PieChart size={18} /> <h3>Resumo por Categoria</h3>
            </div>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "20px", padding: "24px", border: "1px solid #334155" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#64748b", fontSize: "0.75rem", letterSpacing: "1px" }}>
                    <th style={{ paddingBottom: "20px" }}>CATEGORIA (CLIQUE)</th>
                    <th style={{ paddingBottom: "20px", textAlign: "right" }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(categoriasConf).map(cat => (
                    <tr key={cat} 
                        onClick={() => setCategoriaAberta(cat)}
                        style={{ borderTop: "1px solid #334155", cursor: "pointer", transition: "0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#26334d"}>
                      <td style={{ padding: "18px 0", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: categoriasConf[cat].cor }} />
                        {cat}
                      </td>
                      <td style={{ padding: "18px 0", textAlign: "right", fontWeight: "700", color: resumoCategorias[cat] > 0 ? "#f8fafc" : "#334155" }}>
                        R$ {(resumoCategorias[cat] || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* MODAL: CALENDÁRIO MENSAL DE DETALHES */}
      {categoriaAberta && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(12px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#1e293b", width: "100%", maxWidth: "700px", borderRadius: "24px", padding: "30px", border: "1px solid #334155", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "15px", height: "15px", borderRadius: "50%", backgroundColor: categoriasConf[categoriaAberta].cor }} />
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800" }}>Gastos: {categoriaAberta}</h2>
              </div>
              <button onClick={() => setCategoriaAberta(null)} style={{ background: "#334155", border: "none", color: "white", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}><X size={20} style={{ margin: "auto" }} /></button>
            </div>

            {/* GRADE DO CALENDÁRIO */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: "bold", color: "#64748b", fontSize: "0.7rem", marginBottom: "10px" }}>
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {(() => {
                const [ano, mes] = mesFiltro.split('-').map(Number);
                const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
                const diasNoMes = new Date(ano, mes, 0).getDate();
                const hoje = new Date().toLocaleDateString('pt-BR');
                
                const gastosPorDia = gastosFiltrados
                  .filter(g => g.categoria === categoriaAberta)
                  .reduce((acc, g) => {
                    const d = new Date(g.data).getDate();
                    acc[d] = (acc[d] || 0) + g.valor;
                    return acc;
                  }, {});

                const blocos = [];
                for (let i = 0; i < primeiroDiaSemana; i++) blocos.push(<div key={`v-${i}`} />);
                for (let d = 1; d <= diasNoMes; d++) {
                  const dataFormatada = new Date(ano, mes - 1, d).toLocaleDateString('pt-BR');
                  const valor = gastosPorDia[d];
                  const eHoje = dataFormatada === hoje;

                  blocos.push(
                    <div key={d} style={{ 
                      backgroundColor: eHoje ? "#26334d" : "#0f172a", 
                      height: "75px", borderRadius: "10px", padding: "6px", 
                      border: eHoje ? `1px solid ${categoriasConf[categoriaAberta].cor}` : "1px solid #334155",
                      display: "flex", flexDirection: "column", justifyContent: "space-between"
                    }}>
                      <span style={{ fontSize: "0.75rem", color: eHoje ? "white" : "#475569", fontWeight: "bold" }}>{d}</span>
                      {valor > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "#22c55e", fontWeight: "800", textAlign: "right" }}>R${valor.toFixed(0)}</span>
                      )}
                    </div>
                  );
                }
                return blocos;
              })()}
            </div>

            <div style={{ marginTop: "30px", textAlign: "right" }}>
              <span style={{ color: "#94a3b8" }}>Total no mês: </span>
              <span style={{ color: "#22c55e", fontWeight: "900", fontSize: "1.3rem" }}>R$ {(resumoCategorias[categoriaAberta] || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}