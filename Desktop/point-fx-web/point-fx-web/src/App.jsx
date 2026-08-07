import React, { useState, useMemo, useEffect } from 'react';

// === IMPORTACIÓN DE TUS LOGOS Y RECURSOS DESDE ASSETS ===
import logoMendez from './assets/logo-mendez.png';
import logoKosho from './assets/logo-kosho.png';
import logoCdk from './assets/logo-cdk.png';
import logoPointFx from './assets/logo-pointfx.png';
import logoWkc from './assets/logo-wkc.png';
import medallaOro from './assets/medalla-oro.png';
import medallaPlata from './assets/medalla-plata.png';
import medallaBronce from './assets/medalla-bronce.png';
import coronaImg from './assets/corona.png';
import { supabase } from './supabaseClient';

// Función para asignar el logo dinámicamente según el ID de Supabase
const getLogoForSchool = (id) => {
  switch(id) {
    case 1: return logoMendez; // ID 1 = American Chaiu Do Kwan (Team Méndez)
    case 2: return logoKosho;  // ID 2 = Kenpo Kosho Ryu
    case 3: return logoCdk;    // Si agregás la otra escuela como ID 3
    default: return logoPointFx; // Un logo por defecto si el ID no coincide
  }
};

export default function PointFxPortal() {
  const [escuelas, setEscuelas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [activeTab, setActiveTab] = useState("RANKING");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("Todas");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Ordenar escuelas por puntaje
  const sortedSchools = useMemo(() => {
    return [...escuelas].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [escuelas]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Traemos las escuelas
      let { data: dataEscuelas, error: errEscuelas } = await supabase
        .from('escuelas')
        .select(`
          id, nombre, ciudad, sensei, points, golds, silvers, bronzes,
          atletas (id, nombre, categoria, points, golds, rank, status)
        `);

      if (dataEscuelas) {
        setEscuelas(dataEscuelas);
      }
      if (errEscuelas) console.error("Error escuelas:", errEscuelas);

      // 2. Traemos los eventos (ordenados por ID)
      let { data: dataEventos, error: errEventos } = await supabase
        .from('eventos')
        .select('*')
        .order('id', { ascending: true });

      if (dataEventos) {
        setEventos(dataEventos);
      }
      if (errEventos) console.error("Error eventos:", errEventos);

      setLoading(false);
    };

    fetchData();
  }, []);

  // Lista aplanada de todos los atletas ordenada por puntos
  const allAthletes = useMemo(() => {
    return escuelas
      .flatMap(s => (s.atletas || []).map(a => ({ 
        ...a, 
        schoolName: s.nombre, 
        schoolLogoImg: getLogoForSchool(s.id) 
      })))
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [escuelas]);

  // Obtener lista única de categorías para los filtros de atletas
  const allCategories = useMemo(() => {
    const validCategories = allAthletes.map(a => a.categoria).filter(Boolean);
    return ["Todas", ...new Set(validCategories)];
  }, [allAthletes]);

  // Filtrar atletas por categoría seleccionada
  const filteredAthletes = useMemo(() => {
    if (selectedCategory === "Todas") return allAthletes;
    return allAthletes.filter(a => a.categoria === selectedCategory);
  }, [allAthletes, selectedCategory]);

  const filteredSchools = sortedSchools.filter(school => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (school.nombre || "").toLowerCase().includes(searchLower) || 
      (school.ciudad || "").toLowerCase().includes(searchLower) ||
      (school.sensei || "").toLowerCase().includes(searchLower);
    
    const matchesCity = filterCity === "Todas" || school.ciudad === filterCity;
    return matchesSearch && matchesCity;
  });

  const allCities = ["Todas", ...new Set(escuelas.map(s => s.ciudad).filter(Boolean))];

  const TabButton = ({ label, icon }) => (
    <button 
      onClick={() => { setActiveTab(label); setSelectedSchool(null); }}
      className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 border ${
        activeTab === label 
          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 border-blue-400/40' 
          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80 border-transparent'
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  );

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-blue-600 selection:text-white pb-24 relative overflow-hidden bg-[#07090f]">
      
      {/* FONDO DE ESTADIO REAL */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07090f]">
        <img src="/estadio.png" alt="Fondo Estadio" className="absolute inset-0 w-full h-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-[#07090f]/50 z-10"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full z-10"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] bg-red-600/15 blur-[150px] rounded-full z-10"></div>
      </div>

      {/* HEADER */}
      <header className="border-b border-zinc-800/80 bg-[#0b0e14]/90 backdrop-blur sticky top-0 z-50 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={logoPointFx} alt="Point FX" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              <img src={logoWkc} alt="WKC Argentina" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-widest text-white uppercase italic">
                  POINT <span className="text-cyan-400 not-italic">FX</span>
                </h1>
                <span className="bg-blue-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 font-bold uppercase font-mono">Portal Oficial</span>
              </div>
              <p className="text-zinc-400 text-[10px] tracking-widest uppercase font-mono">Sistema de Gestión y Telemetría de Torneos</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 bg-zinc-950/90 border border-zinc-800/80 p-1.5 rounded-2xl shadow-inner">
            <TabButton label="RANKING" icon="🏆" />
            <TabButton label="CALENDARIO" icon="📅" />
            <TabButton label="ATLETAS" icon="🥋" />
            <TabButton label="REGLAMENTO" icon="📜" />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 relative z-10">
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-cyan-400 font-mono animate-pulse">Cargando datos desde la liga...</span>
          </div>
        ) : activeTab === "RANKING" && (
          <div className="animate-fadeIn space-y-10">
            {!selectedSchool ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800/80 pb-6 gap-6">
                  <div>
                    <span className="text-cyan-400 text-xs font-black uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 font-mono">Circuito Oficial 2026</span>
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mt-2">Tabla Anual de Escuelas</h2>
                    <p className="text-zinc-300 text-sm mt-1 font-mono">Puntaje sincronizado en tiempo real desde el software de control Point FX.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl backdrop-blur font-mono shadow-xl">
                    <div className="text-center px-4 border-r border-zinc-800">
                      <span className="block text-cyan-400 font-black text-lg">{escuelas.length}</span>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Dojos</span>
                    </div>
                    <div className="text-center px-4 border-r border-zinc-800">
                      <span className="block text-white font-black text-lg">{allAthletes.length}</span>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Atletas</span>
                    </div>
                    <div className="text-center px-4">
                      <span className="block text-red-400 font-black text-lg">3/5</span>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Fechas</span>
                    </div>
                  </div>
                </div>

                {/* PODIO DE ESCUELAS CON ESTÉTICA HUD */}
                {sortedSchools.length >= 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
                    
                    {/* 2do LUGAR */}
                    <div onClick={() => setSelectedSchool(sortedSchools[1])} className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-cyan-500/40 via-blue-600/20 to-zinc-800 cursor-pointer transition transform hover:-translate-y-2 group shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                      <div className="rounded-[26px] bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-6 backdrop-blur-xl border border-cyan-500/30 text-center relative">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <img src={medallaPlata} alt="Plata" className="w-10 h-10 object-contain drop-shadow-md" />
                          <span className="bg-zinc-800 text-cyan-300 font-black px-3 py-0.5 rounded-full text-xs border border-cyan-500/40 font-mono">2° LUGAR</span>
                        </div>
                        <div className="h-20 my-5 flex items-center justify-center">
                          <img src={getLogoForSchool(sortedSchools[1].id)} alt={sortedSchools[1].nombre} className="max-h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition" />
                        </div>
                        <h3 className="font-extrabold text-xl text-white">{sortedSchools[1].nombre}</h3>
                        <p className="text-xs text-zinc-300 mb-5 font-mono">{sortedSchools[1].ciudad}</p>
                        <div className="bg-zinc-950/90 border border-zinc-800 py-3 rounded-2xl font-mono shadow-inner">
                          <span className="text-3xl font-black text-zinc-200">{sortedSchools[1].points || 0}</span>
                          <span className="text-[10px] font-bold text-zinc-500 block uppercase">PUNTOS</span>
                        </div>
                      </div>
                    </div>

                    {/* 1er LUGAR (LÍDER HUD) */}
                    <div onClick={() => setSelectedSchool(sortedSchools[0])} className="relative rounded-[28px] p-[2px] bg-gradient-to-b from-cyan-400 via-blue-500 to-zinc-900 cursor-pointer transform md:-translate-y-4 transition group shadow-2xl shadow-cyan-500/20">
                      <div className="rounded-[26px] bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-7 backdrop-blur-xl border border-cyan-400/50 text-center relative shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                          <img src={coronaImg} alt="Corona" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(234,179,8,0.9)] animate-bounce mb-[-6px] z-10" />
                          <span className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-black px-4 py-1 rounded-full text-xs tracking-widest shadow-lg font-mono border border-cyan-200/50">LÍDER ANUAL</span>
                        </div>
                        <div className="h-28 my-6 flex items-center justify-center">
                          <img src={getLogoForSchool(sortedSchools[0].id)} alt={sortedSchools[0].nombre} className="max-h-full object-contain drop-shadow-[0_10px_25px_rgba(6,182,212,0.6)] group-hover:scale-110 transition animate-pulse" />
                        </div>
                        <h3 className="font-black text-2xl md:text-3xl text-white">{sortedSchools[0].nombre}</h3>
                        <p className="text-xs text-cyan-300 font-bold mb-5 font-mono">{sortedSchools[0].ciudad}</p>
                        <div className="bg-blue-950/50 border border-cyan-400/50 py-4 rounded-2xl font-mono shadow-inner">
                          <span className="text-4xl font-black text-cyan-400">{sortedSchools[0].points || 0}</span>
                          <span className="text-[10px] font-black text-cyan-200 block uppercase tracking-widest mt-0.5">PUNTOS TOTALES</span>
                        </div>
                      </div>
                    </div>

                    {/* 3er LUGAR */}
                    <div onClick={() => setSelectedSchool(sortedSchools[2])} className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-cyan-500/40 via-blue-600/20 to-zinc-800 cursor-pointer transition transform hover:-translate-y-2 group shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                      <div className="rounded-[26px] bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-6 backdrop-blur-xl border border-cyan-500/30 text-center relative">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <img src={medallaBronce} alt="Bronce" className="w-10 h-10 object-contain drop-shadow-md" />
                          <span className="bg-zinc-800 text-amber-500 font-black px-3 py-0.5 rounded-full text-xs border border-amber-500/40 font-mono">3° LUGAR</span>
                        </div>
                        <div className="h-20 my-5 flex items-center justify-center">
                          <img src={getLogoForSchool(sortedSchools[2].id)} alt={sortedSchools[2].nombre} className="max-h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition" />
                        </div>
                        <h3 className="font-extrabold text-xl text-white">{sortedSchools[2].nombre}</h3>
                        <p className="text-xs text-zinc-300 mb-5 font-mono">{sortedSchools[2].ciudad}</p>
                        <div className="bg-zinc-950/90 border border-zinc-800 py-3 rounded-2xl font-mono shadow-inner">
                          <span className="text-3xl font-black text-amber-600">{sortedSchools[2].points || 0}</span>
                          <span className="text-[10px] font-bold text-zinc-500 block uppercase">PUNTOS</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* BUSCADOR */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
                  <div className="relative w-full md:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus-within:border-cyan-500/50 transition">
                    <input 
                      type="text" 
                      placeholder="🔍 Buscar por escuela, ciudad o sensei..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent w-full px-4 py-3 pl-10 text-sm font-mono outline-none text-white placeholder:text-zinc-600"
                    />
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {allCities.map((city) => {
                      const isActive = filterCity === city;
                      return (
                        <button 
                          key={city}
                          onClick={() => setFilterCity(city)}
                          className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest border transition-all duration-200 uppercase font-mono ${
                            isActive 
                              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-105' 
                              : 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white hover:bg-zinc-800'
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TABLA DE ESCUELAS */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                  <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400 uppercase font-mono font-black tracking-widest">
                    <span>Ranking / Escuela</span>
                    <span>Medallero & Rendimiento</span>
                  </div>
                  
                  <div className="divide-y divide-zinc-800/80">
                    {filteredSchools.map((school, index) => (
                      <div 
                        key={school.id}
                        onClick={() => setSelectedSchool(school)}
                        className="p-5 flex items-center justify-between hover:bg-zinc-800/60 transition cursor-pointer group"
                      >
                        <div className="flex items-center space-x-5">
                          <span className={`font-mono font-black text-lg w-10 text-center ${
                            index === 0 ? 'text-cyan-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-600'
                          }`}>
                            #{index + 1}
                          </span>
                          <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 p-2 flex items-center justify-center shrink-0">
                            <img src={getLogoForSchool(school.id)} alt={school.nombre} className="w-full h-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-white group-hover:text-cyan-400 transition">{school.nombre}</h3>
                            <p className="text-xs text-zinc-300 font-mono mt-0.5">📍 {school.ciudad} • <span className="text-white font-bold">{school.sensei}</span></p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="hidden md:flex items-center space-x-3 text-xs font-bold text-zinc-300 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 font-mono">
                            <span className="text-yellow-400">🥇 {school.golds || 0}</span>
                            <span className="text-zinc-600">|</span>
                            <span className="text-zinc-300">🥈 {school.silvers || 0}</span>
                            <span className="text-zinc-600">|</span>
                            <span className="text-amber-600">🥉 {school.bronzes || 0}</span>
                          </div>
                          
                          <div className="text-right font-mono">
                            <span className="text-3xl font-black text-cyan-400">{school.points || 0}</span>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-widest">PTS</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* VISTA DETALLE DE ESCUELA CON RANKING DE SUS ATLETAS */
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-fadeIn backdrop-blur-md">
                <div className="p-8 bg-zinc-950 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-zinc-900 rounded-2xl border border-zinc-800 p-3 flex items-center justify-center shrink-0">
                      <img src={getLogoForSchool(selectedSchool.id)} alt={selectedSchool.nombre} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black uppercase text-white">{selectedSchool.nombre}</h2>
                        <span className="bg-blue-600/20 text-cyan-400 text-xs px-3 py-1 rounded-lg border border-blue-600/30 font-black font-mono">{selectedSchool.ciudad}</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 font-mono">Sensei: <strong className="text-white">{selectedSchool.sensei}</strong> • Plantel y Ranking Interno.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedSchool(null)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-xs px-5 py-3 rounded-xl transition uppercase font-black tracking-wider border border-zinc-700 font-mono"
                  >
                    ← Volver al Ranking General
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-zinc-950/60 border-b border-zinc-800 font-mono">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Pts</span>
                    <span className="text-3xl font-black text-cyan-400 block mt-1">{selectedSchool.points || 0} pts</span>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Oro</span>
                    <span className="text-3xl font-black text-yellow-400 block mt-1">🥇 {selectedSchool.golds || 0}</span>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Plata</span>
                    <span className="text-3xl font-black text-zinc-300 block mt-1">🥈 {selectedSchool.silvers || 0}</span>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Bronce</span>
                    <span className="text-3xl font-black text-amber-600 block mt-1">🥉 {selectedSchool.bronzes || 0}</span>
                  </div>
                </div>

                {/* RANKING INTERNO DE ATLETAS DE LA ESCUELA */}
                <div className="p-8">
                  <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest mb-6 font-mono">Ranking Interno de Atletas ({selectedSchool.nombre})</h3>
                  {selectedSchool.atletas && selectedSchool.atletas.length > 0 ? (
                    <div className="space-y-3 font-mono">
                      {[...selectedSchool.atletas].sort((a, b) => (b.points || 0) - (a.points || 0)).map((comp, idx) => (
                        <div key={comp.id} onClick={() => setSelectedAthlete({ ...comp, schoolName: selectedSchool.nombre, schoolLogoImg: getLogoForSchool(selectedSchool.id) })} className="bg-zinc-950 border border-zinc-800 hover:border-cyan-500/40 p-5 rounded-2xl flex justify-between items-center transition cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <span className="font-black text-cyan-400 text-lg w-8">#{idx + 1}</span>
                            <div>
                              <h4 className="font-black text-white text-base font-sans">{comp.nombre}</h4>
                              <p className="text-xs text-zinc-300">🥋 {comp.categoria} • Estado: <span className="text-cyan-300">{comp.status || 'Activo'}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-cyan-400 font-black text-2xl">{comp.points || 0} pts</span>
                            <span className="text-xs text-yellow-400 block">🥇 {comp.golds || 0} Títulos</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm italic font-mono">No hay competidores cargados para esta escuela.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "CALENDARIO" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Calendario Oficial de Torneos</h2>
              <p className="text-zinc-300 text-sm font-mono">Cronograma de fechas, sedes y estados de competencia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((ev) => (
                <div key={ev.id} className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-md">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-zinc-300 bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800 font-mono">{ev.fecha}</span>
                      <span className={`text-[10px] px-3 py-1 rounded-xl font-black uppercase font-mono border ${ev.estado === 'FINALIZADO' ? 'bg-blue-900/30 text-cyan-400 border-cyan-800' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                        {ev.estado}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">{ev.nombre}</h3>
                    <p className="text-xs text-zinc-300 mt-2 font-mono">📍 {ev.ubicacion}</p>
                  </div>
                  <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400">Ganador: <strong className="text-white">{ev.ganador}</strong></span>
                    <span className="text-cyan-400 font-black text-sm">+{ev.puntos} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PESTAÑA ATLETAS (CON FILTRO DE CATEGORÍAS Y PODIO TOP 3) --- */}
        {activeTab === "ATLETAS" && (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-4 gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white">Hall of Fame - Atletas Destacados</h2>
                <p className="text-zinc-300 text-sm font-mono">Ranking individual y podios por categoría de edad.</p>
              </div>

              {/* FILTRO DE CATEGORÍAS */}
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
                {allCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest border transition-all duration-200 uppercase font-mono whitespace-nowrap ${
                        isActive 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-105' 
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PODIO DE ATLETAS (TOP 3 DE LA CATEGORÍA SELECCIONADA) */}
            {filteredAthletes.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
                
                {/* 2do PUESTO ATLETA */}
                <div onClick={() => setSelectedAthlete(filteredAthletes[1])} className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-cyan-500/40 via-blue-600/20 to-zinc-800 cursor-pointer transition transform hover:-translate-y-2 group">
                  <div className="rounded-[26px] bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-6 backdrop-blur-xl border border-cyan-500/30 text-center relative">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <img src={medallaPlata} alt="Plata" className="w-10 h-10 object-contain drop-shadow-md" />
                      <span className="bg-zinc-800 text-cyan-300 font-black px-3 py-0.5 rounded-full text-xs border border-cyan-500/40 font-mono">2° ATLETA</span>
                    </div>
                    <div className="h-20 my-4 flex items-center justify-center">
                      <div className="w-14 h-14 bg-zinc-950 rounded-2xl border border-zinc-800 p-1.5 flex items-center justify-center">
                        <img src={filteredAthletes[1].schoolLogoImg} alt="" className="max-h-full object-contain" />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-xl text-white font-sans">{filteredAthletes[1].nombre}</h3>
                    <p className="text-xs text-cyan-400 mb-5 font-mono">🥋 {filteredAthletes[1].categoria}</p>
                    <div className="bg-zinc-950/90 border border-zinc-800 py-3 rounded-2xl font-mono shadow-inner">
                      <span className="text-3xl font-black text-zinc-200">{filteredAthletes[1].points || 0}</span>
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase">PUNTOS</span>
                    </div>
                  </div>
                </div>

                {/* 1er PUESTO ATLETA (LÍDER HUD) */}
                <div onClick={() => setSelectedAthlete(filteredAthletes[0])} className="relative rounded-[28px] p-[2px] bg-gradient-to-b from-cyan-400 via-blue-500 to-zinc-900 cursor-pointer transform md:-translate-y-4 transition group shadow-2xl shadow-cyan-500/20">
                  <div className="rounded-[26px] bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-7 backdrop-blur-xl border border-cyan-400/50 text-center relative shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <img src={coronaImg} alt="Corona" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(234,179,8,0.9)] animate-bounce mb-[-6px] z-10" />
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-black px-4 py-1 rounded-full text-xs tracking-widest shadow-lg font-mono border border-cyan-200/50">LÍDER CATEGORÍA</span>
                    </div>
                    <div className="h-24 my-4 flex items-center justify-center">
                      <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-cyan-500/40 p-2 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <img src={filteredAthletes[0].schoolLogoImg} alt="" className="max-h-full object-contain animate-pulse" />
                      </div>
                    </div>
                    <h3 className="font-black text-2xl md:text-3xl text-white font-sans">{filteredAthletes[0].nombre}</h3>
                    <p className="text-xs text-cyan-300 font-bold mb-5 font-mono">🥋 {filteredAthletes[0].categoria}</p>
                    <div className="bg-blue-950/50 border border-cyan-400/50 py-4 rounded-2xl font-mono shadow-inner">
                      <span className="text-4xl font-black text-cyan-400">{filteredAthletes[0].points || 0}</span>
                      <span className="text-[10px] font-black text-cyan-200 block uppercase tracking-widest mt-0.5">PUNTOS TOTALES</span>
                    </div>
                  </div>
                </div>

                {/* 3er PUESTO ATLETA */}
                <div onClick={() => setSelectedAthlete(filteredAthletes[2])} className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-cyan-500/40 via-blue-600/20 to-zinc-800 cursor-pointer transition transform hover:-translate-y-2 group">
                  <div className="rounded-[26px] bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-6 backdrop-blur-xl border border-cyan-500/30 text-center relative">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <img src={medallaBronce} alt="Bronce" className="w-10 h-10 object-contain drop-shadow-md" />
                      <span className="bg-zinc-800 text-amber-500 font-black px-3 py-0.5 rounded-full text-xs border border-amber-500/40 font-mono">3° ATLETA</span>
                    </div>
                    <div className="h-20 my-4 flex items-center justify-center">
                      <div className="w-14 h-14 bg-zinc-950 rounded-2xl border border-zinc-800 p-1.5 flex items-center justify-center">
                        <img src={filteredAthletes[2].schoolLogoImg} alt="" className="max-h-full object-contain" />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-xl text-white font-sans">{filteredAthletes[2].nombre}</h3>
                    <p className="text-xs text-amber-500 mb-5 font-mono">🥋 {filteredAthletes[2].categoria}</p>
                    <div className="bg-zinc-950/90 border border-zinc-800 py-3 rounded-2xl font-mono shadow-inner">
                      <span className="text-3xl font-black text-amber-600">{filteredAthletes[2].points || 0}</span>
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase">PUNTOS</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TABLA RESTO DE ATLETAS FILTRADOS */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="p-5 bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-300 uppercase font-mono font-black tracking-widest flex justify-between">
                <span>Atleta / Categoría & Escuela</span>
                <span>Puntaje General</span>
              </div>
              <div className="divide-y divide-zinc-800">
                {filteredAthletes.map((athlete, idx) => (
                  <div 
                    key={athlete.id} 
                    onClick={() => setSelectedAthlete(athlete)}
                    className="p-5 flex items-center justify-between hover:bg-zinc-800/50 transition font-mono cursor-pointer group"
                  >
                    <div className="flex items-center space-x-5">
                      <span className={`font-black w-8 text-center text-lg ${idx === 0 ? 'text-cyan-400' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                        #{idx + 1}
                      </span>
                      <div className="w-12 h-12 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                        <img src={athlete.schoolLogoImg} alt="" className="max-h-full object-contain group-hover:scale-110 transition" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base font-sans group-hover:text-cyan-400 transition">{athlete.nombre}</h4>
                        <p className="text-xs text-zinc-300 mt-0.5">🥋 {athlete.categoria} • <span className="text-cyan-300 font-bold">{athlete.schoolName}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-cyan-400">{athlete.points || 0} pts</span>
                      <span className="text-xs text-yellow-400 block mt-0.5">🥇 {athlete.golds || 0} Títulos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "REGLAMENTO" && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Reglamento Oficial Point FX</h2>
              <p className="text-zinc-300 text-sm font-mono">Normativa de puntuación y categorías de la liga.</p>
            </div>

            <div className="space-y-4 text-sm text-zinc-200">
              <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                <h3 className="font-black text-white text-base mb-2 text-cyan-400 uppercase font-mono">1. Sistema de Puntuación Anual</h3>
                <p>Cada torneo otorga puntos directos a la escuela según las medallas obtenidas (Oro: 30 pts, Plata: 15 pts, Bronce: 5 pts). Estos puntajes se consolidan automáticamente en la tabla anual.</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                <h3 className="font-black text-white text-base mb-2 text-cyan-400 uppercase font-mono">2. Pesajes y Categorías Oficiales</h3>
                <p>Los competidores deben registrarse obligatoriamente en su respectiva categoría de edad (Infantil, Juvenil, Adulto, Senior). El peso exacto es registrado por la balanza oficial en el software de control.</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                <h3 className="font-black text-white text-base mb-2 text-cyan-400 uppercase font-mono">3. Tecnología de Control (Software Point FX)</h3>
                <p>Todas las mesas de control operan de manera exclusiva con el software de escritorio **Point FX**, garantizando transparencia absoluta y visualización en tiempo real.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL DE ATLETA --- */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-cyan-500/50 rounded-3xl w-full max-w-md p-6 relative shadow-[0_0_30px_rgba(6,182,212,0.2)] font-mono">
            <button 
              onClick={() => setSelectedAthlete(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/80 w-8 h-8 rounded-full flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="text-center pb-6 border-b border-zinc-800">
              <div className="w-16 h-16 bg-blue-600/20 text-cyan-400 mx-auto rounded-2xl border border-cyan-500/30 flex items-center justify-center text-2xl font-black mb-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                🥋
              </div>
              <h3 className="text-2xl font-black text-white font-sans">{selectedAthlete.nombre}</h3>
              <p className="text-xs text-cyan-400 mt-1 uppercase tracking-widest">{selectedAthlete.categoria} • <span className="text-white">{selectedAthlete.schoolName || selectedSchool?.nombre}</span></p>
            </div>

            <div className="py-6 space-y-4">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Historial de Últimos Torneos</h4>
              <div className="space-y-2">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-zinc-300">Copa de la Vendimia (Mendoza)</span>
                  <span className="text-yellow-400 font-bold">🥇 1° Puesto</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-zinc-300">Torneo Regional Centro</span>
                  <span className="text-zinc-300 font-bold">🥈 2° Puesto</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-zinc-300">Torneo Nacional - Fecha 1</span>
                  <span className="text-yellow-400 font-bold">🥇 1° Puesto</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedAthlete(null)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition shadow-lg shadow-blue-600/30"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-6 mt-20 text-center text-xs text-zinc-400 border-t border-zinc-800/80 pt-8 font-mono tracking-widest uppercase">
        Point FX League Management System • System Developed by Ariel Papini
      </footer>
    </div>
  );
}