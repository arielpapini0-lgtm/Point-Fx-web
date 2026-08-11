import React, { useState, useEffect } from "react";
import { supabase } from './supabaseClient';

export default function RankingWeb() {
  const [atletas, setAtletas] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros seleccionados
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [filtroEscuela, setFiltroEscuela] = useState("TODAS");

  // Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      
      // Traemos atletas y sus escuelas asociadas
      const { data: atletasData, error: errAtletas } = await supabase
        .from('atletas')
        .select(`
          id,
          nombre,
          categoria,
          points,
          escuelas ( id, nombre )
        `)
        .order('points', { ascending: false });

      // Traemos la lista de escuelas para el filtro
      const { data: escuelasData, error: errEscuelas } = await supabase
        .from('escuelas')
        .select('id, nombre')
        .order('nombre', { ascending: true });

      if (!errAtletas && atletasData) setAtletas(atletasData);
      if (!errEscuelas && escuelasData) setEscuelas(escuelasData);
      
      setCargando(false);
    };

    fetchData();

    // Actualización en tiempo real vía Supabase Realtime
    const subscription = supabase
      .channel('public:atletas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atletas' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Extraer categorías únicas disponibles en los atletas para armar el selector dinámico
  const categoriasDisponibles = ["TODAS", ...new Set(atletas.map(a => a.categoria).filter(Boolean))];

  // Lógica de filtrado de atletas
  const atletasFiltrados = atletas.filter(atleta => {
    const coincideCategoria = filtroCategoria === "TODAS" || atleta.categoria === filtroCategoria;
    const coincideEscuela = filtroEscuela === "TODAS" || String(atleta.escuelas?.id) === String(filtroEscuela);
    return coincideCategoria && coincideEscuela;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 select-none" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            RANKING OFICIAL
          </h1>
          <p className="text-xs text-cyan-600/80 font-bold tracking-[0.4em] uppercase mt-2">
            POSICIONES EN TIEMPO REAL • WKC ARGENTINA
          </p>
        </div>

        {/* 🔍 PANEL DE FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-[#0a0f16]/90 border border-cyan-900/50 p-4 rounded-2xl backdrop-blur-md">
          <div>
            <label className="block mb-1 text-[10px] text-cyan-500 font-bold tracking-widest uppercase">FILTRAR POR CATEGORÍA:</label>
            <select 
              value={filtroCategoria} 
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full bg-[#05080f] border border-cyan-900/50 text-cyan-100 px-3 py-2 rounded-xl outline-none focus:border-cyan-400 font-mono text-xs uppercase cursor-pointer"
            >
              {categoriasDisponibles.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-cyan-500 font-bold tracking-widest uppercase">FILTRAR POR ESCUELA / DOJO:</label>
            <select 
              value={filtroEscuela} 
              onChange={(e) => setFiltroEscuela(e.target.value)}
              className="w-full bg-[#05080f] border border-cyan-900/50 text-cyan-100 px-3 py-2 rounded-xl outline-none focus:border-cyan-400 font-mono text-xs uppercase cursor-pointer"
            >
              <option value="TODAS">--- TODAS LAS ESCUELAS ---</option>
              {escuelas.map(esc => (
                <option key={esc.id} value={esc.id}>{esc.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLA DE POSICIONES */}
        <div className="bg-[#0a0f16]/90 border border-cyan-900/50 rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.1)] backdrop-blur-md overflow-hidden">
          <div className="grid grid-cols-12 bg-cyan-950/40 border-b border-cyan-900/50 px-6 py-4 text-[10px] font-black tracking-widest text-cyan-400 uppercase">
            <div className="col-span-2 text-center"># POS</div>
            <div className="col-span-5">ATLETA</div>
            <div className="col-span-3">CATEGORÍA</div>
            <div className="col-span-2 text-right">PUNTOS</div>
          </div>

          {cargando ? (
            <div className="text-center py-16 text-cyan-500 font-mono text-sm tracking-widest animate-pulse">
              CARGANDO POSICIONES...
            </div>
          ) : atletasFiltrados.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-sm tracking-widest">
              NO SE ENCONTRARON ATLETAS CON LOS FILTROS SELECCIONADOS.
            </div>
          ) : (
            atletasFiltrados.map((atleta, index) => {
              const esPrimero = index === 0 && filtroCategoria === "TODAS" && filtroEscuela === "TODAS";
              const esSegundo = index === 1 && filtroCategoria === "TODAS" && filtroEscuela === "TODAS";
              const esTercero = index === 2 && filtroCategoria === "TODAS" && filtroEscuela === "TODAS";

              let badgeColor = "bg-slate-900 text-slate-400 border-slate-800";
              if (esPrimero) badgeColor = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
              if (esSegundo) badgeColor = "bg-slate-300/20 text-slate-200 border-slate-300/50";
              if (esTercero) badgeColor = "bg-amber-700/20 text-amber-500 border-amber-600/50";

              return (
                <div 
                  key={atleta.id} 
                  className={`grid grid-cols-12 items-center px-6 py-4 border-b border-cyan-950/30 transition-colors hover:bg-cyan-950/20 ${esPrimero ? 'bg-yellow-500/5' : ''}`}
                >
                  <div className="col-span-2 flex justify-center">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${badgeColor}`}>
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="col-span-5 pr-2">
                    <div className="font-bold text-sm tracking-wide text-cyan-100 uppercase truncate">
                      {atleta.nombre}
                    </div>
                    <div className="text-[10px] text-slate-500 tracking-wider uppercase truncate">
                      {atleta.escuelas?.nombre || "LIBRE / SIN ESCUELA"}
                    </div>
                  </div>

                  <div className="col-span-3 text-xs text-slate-400 font-mono tracking-wider truncate pr-2">
                    {atleta.categoria || "GENERAL"}
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="font-black text-lg text-cyan-400 tracking-widest font-mono drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                      {atleta.points}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}