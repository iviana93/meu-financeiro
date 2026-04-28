import { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Trash2, Plus, Wallet, PieChart, List, Calendar as CalendarIcon, X } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [usuario, setUsuario] = useState("Igor");
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

    await addDoc(collection(db, "gastos"), { valor, descricao: desc, categoria, quem: usuario, data: new Date().toISOString() });
    setInput("");
  };

  const deletarGasto = async (id) => {
    if (window.confirm("Remover este registro?")) await deleteDoc(doc(db, "gastos", id));
  };

  const gastosFiltrados = gastos.filter(g => g.data.startsWith(mesFiltro));
  const totalMes = gastosFiltrados.reduce((acc, g) => acc + g.valor, 0);
  const totalIgor = gastosFiltrados.filter(g => g.quem === "Igor").reduce((acc, g) => acc + g.valor, 0);
  const totalTamires = gastosFiltrados.filter(g => g.quem === "Tamires").reduce((acc, g) => acc + g.valor, 0);
  const resumoCategorias = gastosFiltrados.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
    return acc;
  }, {});

  return (
    <div className="container">
      <style>{`
        .container { background-color: #0f172a; min-height: 100vh; color: #f8fafc; padding: 20px; font-family: 'Inter', sans-serif; }
        .content { max-width: 1200px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
        .total-valor { font-size: 2.8rem; font-weight: 900; color: #22c55e; line-height: 1; }
        .grid-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 30px; }
        
        /* Ajuste do Input para Celular */
        .input-box { background: #1e293b; padding: 15px; border-radius: 20px; border: 1px solid #334155; margin-bottom: 30px; }
        .user-row { display: flex; gap: 10px; margin-bottom: 12px; }
        .user-btn { flex: 1; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 0.8rem; transition: 0.3s; background: #0f172a; color: #475569; }
        .input-field-row { display: flex; gap: 10px; align-items: center; background: #0f172a; padding: 5px 15px; border-radius: 12px; border: 1px solid #334155; }
        
        .cal-tag { font-size: 10px; padding: 1px 4px; border-radius: 3px; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; }

        @media (max-width: 768px) {
          .header { flex-direction: column; align-items: center; text-align: center; }
          .grid-layout { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="content">
        <header className="header">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", margin: 0 }}>Dashboard Financeiro</h1>
            <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} 
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "white", padding: "8px", borderRadius: "8px", marginTop: "10px" }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>IGOR: R${totalIgor.toFixed(2)} | TAMIRES: R${totalTamires.toFixed(2)}</div>
            <div className="total-valor">R$ {totalMes.toFixed(2)}</div>
          </div>
        </header>

        {/* NOVO DESIGN DE INPUT MAIS ESPAÇOSO */}
        <div className="input-box">
          <div className="user-row">
            <button className="user-btn" onClick={() => setUsuario("Igor")} style={{ background: usuario === "Igor" ? "#22c55e" : "#0f172a", color: usuario === "Igor" ? "white" : "#475569" }}>IGOR</button>
            <button className="user-btn" onClick={() => setUsuario("Tamires")} style={{ background: usuario === "Tamires" ? "#a29bfe" : "#0f172a", color: usuario === "Tamires" ? "white" : "#475569" }}>TAMIRES</button>
          </div>
          <div className="input-field-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarGasto()}
              placeholder="Digite: 50 mercado..."
              style={{ backgroundColor: "transparent", border: "none", color: "white", outline: "none", fontSize: "16px", flex: 1, padding: "10px 0" }}
            />
            <button onClick={adicionarGasto} style={{ backgroundColor: "#22c55e", border: "none", borderRadius: "8px", width: "40px", height: "40px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="grid-layout">
          <section>
            <h3 style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "15px" }}><List size={16}/> LANÇAMENTOS</h3>
            {gastosFiltrados.map(g => (
              <div key={g.id} style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "15px", marginBottom: "10px", display: "flex", justifyContent: "space-between", border: "1px solid #334155" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "3px", height: "30px", backgroundColor: categoriasConf[g.categoria]?.cor }} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{g.descricao}</div>
                    <span style={{ fontSize: "0.6rem", color: g.quem === "Igor" ? "#22c55e" : "#a29bfe", fontWeight: "900" }}>{g.quem.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: "800" }}>R$ {g.valor.toFixed(2)}</span>
                  <Trash2 size={16} onClick={() => deletarGasto(g.id)} style={{ color: "#475569", cursor: "pointer" }} />
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "15px" }}><PieChart size={16}/> POR CATEGORIA</h3>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "20px", padding: "20px", border: "1px solid #334155" }}>
              {Object.keys(categoriasConf).map(cat => (
                <div key={cat} onClick={() => setCategoriaAberta(cat)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #334155", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{cat}</span>
                  <span style={{ fontWeight: "800" }}>R$ {(resumoCategorias[cat] || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL COM TAGS DE NOME NO CALENDÁRIO */}
      {categoriaAberta && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.98)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#1e293b", width: "95%", maxWidth: "500px", borderRadius: "25px", padding: "20px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{categoriaAberta}</h2>
              <X onClick={() => setCategoriaAberta(null)} />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
              {(() => {
                const [ano, mes] = mesFiltro.split('-').map(Number);
                const primeiroDia = new Date(ano, mes - 1, 1).getDay();
                const totalDias = new Date(ano, mes, 0).getDate();
                
                // Mapeia quem gastou em qual dia
                const mapaDias = gastosFiltrados.filter(g => g.categoria === categoriaAberta).reduce((acc, g) => {
                  const d = new Date(g.data).getDate();
                  if (!acc[d]) acc[d] = { total: 0, users: new Set() };
                  acc[d].total += g.valor;
                  acc[d].users.add(g.quem);
                  return acc;
                }, {});

                let blocos = [];
                for(let i=0; i<primeiroDia; i++) blocos.push(<div key={`v-${i}`}/>);
                for(let d=1; d<=totalDias; d++) {
                  const info = mapaDias[d];
                  blocos.push(
                    <div key={d} style={{ backgroundColor: "#0f172a", height: "75px", borderRadius: "10px", border: "1px solid #334155", padding: "4px", display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.65rem", color: "#475569" }}>{d}</span>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
                        {info && Array.from(info.users).map(u => (
                          <div key={u} className="cal-tag" style={{ backgroundColor: u === "Igor" ? "#22c55e33" : "#a29bfe33", color: u === "Igor" ? "#22c55e" : "#a29bfe" }}>{u[0]}</div>
                        ))}
                        {info && <span style={{ fontSize: "0.75rem", fontWeight: "900", color: "white" }}>{info.total.toFixed(0)}</span>}
                      </div>
                    </div>
                  );
                }
                return blocos;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}