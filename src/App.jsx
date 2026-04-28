import { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Trash2, Plus, Wallet, PieChart, List, Calendar as CalendarIcon, X } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [gastos, setGastos] = useState([]);
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().substring(0, 7));
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

    await addDoc(collection(db, "gastos"), { valor, descricao: desc, categoria, data: new Date().toISOString() });
    setInput("");
  };

  const deletarGasto = async (id) => {
    if (window.confirm("Remover este registro?")) await deleteDoc(doc(db, "gastos", id));
  };

  const gastosFiltrados = gastos.filter(g => g.data.startsWith(mesFiltro));
  const totalMes = gastosFiltrados.reduce((acc, g) => acc + g.valor, 0);
  const resumoCategorias = gastosFiltrados.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
    return acc;
  }, {});

  return (
    <div className="container">
      {/* CSS embutido para responsividade */}
      <style>{`
        .container { 
          background-color: #0f172a; min-height: 100vh; color: #f8fafc; 
          padding: 20px; font-family: 'Inter', sans-serif;
        }
        .content { max-width: 1200px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .total-valor { fontSize: 3rem; font-weight: 900; color: #22c55e; line-height: 1; }
        .grid-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 30px; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .calendar-box { height: 60px; font-size: 0.7rem; }
        
        @media (max-width: 768px) {
          .header { flex-direction: column; align-items: center; text-align: center; }
          .total-valor { font-size: 2.5rem; }
          .grid-layout { grid-template-columns: 1fr; }
          .input-area { flex-direction: column; }
          .calendar-box { height: 50px; }
          .modal-content { width: 95% !important; padding: 15px !important; }
        }
      `}</style>

      <div className="content">
        <header className="header">
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Controle de Gastos</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", color: "#94a3b8" }}>
              <CalendarIcon size={16} />
              <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} 
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "white", padding: "8px", borderRadius: "8px" }} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase" }}>Gasto no Período</span>
            <div className="total-valor">R$ {totalMes.toFixed(2)}</div>
          </div>
        </header>

        {/* INPUT AREA */}
        <div style={{ display: "flex", gap: "10px", backgroundColor: "#1e293b", padding: "12px", borderRadius: "15px", marginBottom: "30px", border: "1px solid #334155" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && adicionarGasto()}
            placeholder="Ex: 50 mercado"
            style={{ backgroundColor: "transparent", border: "none", color: "white", outline: "none", fontSize: "16px", flex: 1 }}
          />
          <button onClick={adicionarGasto} style={{ backgroundColor: "#22c55e", border: "none", borderRadius: "10px", padding: "10px 20px", color: "white", fontWeight: "bold", cursor: "pointer" }}>
            <Plus size={20} />
          </button>
        </div>

        <div className="grid-layout">
          {/* LANÇAMENTOS */}
          <section>
            <h3 style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}><List size={18}/> Lançamentos</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              {gastosFiltrados.map(g => (
                <div key={g.id} style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #334155" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "3px", height: "30px", backgroundColor: categoriasConf[g.categoria]?.cor, borderRadius: "2px" }} />
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{g.descricao}</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{new Date(g.data).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ fontWeight: "700" }}>R$ {g.valor.toFixed(2)}</span>
                    <button onClick={() => deletarGasto(g.id)} style={{ background: "none", border: "none", color: "#475569" }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RESUMO */}
          <section>
            <h3 style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}><PieChart size={18}/> Categorias</h3>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "15px", padding: "20px", border: "1px solid #334155", marginTop: "15px" }}>
              {Object.keys(categoriasConf).map(cat => (
                <div key={cat} onClick={() => setCategoriaAberta(cat)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #334155", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: categoriasConf[cat].cor }} />
                    <span style={{ fontSize: "0.9rem" }}>{cat}</span>
                  </div>
                  <span style={{ fontWeight: "700" }}>R$ {(resumoCategorias[cat] || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL CALENDÁRIO */}
      {categoriaAberta && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: "#1e293b", width: "90%", maxWidth: "600px", borderRadius: "20px", padding: "25px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{categoriaAberta}</h2>
              <X onClick={() => setCategoriaAberta(null)} style={{ cursor: "pointer" }} />
            </div>
            
            <div className="calendar-grid" style={{ textAlign: "center", fontSize: "0.6rem", color: "#64748b", marginBottom: "10px" }}>
              {['D','S','T','Q','Q','S','S'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="calendar-grid">
              {(() => {
                const [ano, mes] = mesFiltro.split('-').map(Number);
                const primeiroDia = new Date(ano, mes - 1, 1).getDay();
                const totalDias = new Date(ano, mes, 0).getDate();
                const gastosDia = gastosFiltrados.filter(g => g.categoria === categoriaAberta).reduce((acc, g) => {
                  const d = new Date(g.data).getDate();
                  acc[d] = (acc[d] || 0) + g.valor;
                  return acc;
                }, {});

                let dias = [];
                for(let i=0; i<primeiroDia; i++) dias.push(<div key={`e-${i}`}/>);
                for(let d=1; d<=totalDias; d++) {
                  dias.push(
                    <div key={d} className="calendar-box" style={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", padding: "4px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <span style={{ color: "#475569", fontWeight: "bold" }}>{d}</span>
                      {gastosDia[d] > 0 && <span style={{ color: "#22c55e", fontSize: "0.6rem", fontWeight: "bold" }}>{gastosDia[d].toFixed(0)}</span>}
                    </div>
                  );
                }
                return dias;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}