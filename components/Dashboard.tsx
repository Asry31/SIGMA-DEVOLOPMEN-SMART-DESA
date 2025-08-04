import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import { PopulationIcon, ActivityIcon, SocialAidIcon, DocumentIcon } from './icons';
import { generateReport } from '../services/geminiService';
import { db } from '../services/firebase';
import { Resident } from '../types';

interface DashboardProps {
  setPage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setPage }) => {
  const navigate = useNavigate();
  const [report, setReport] = useState('');
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [stats, setStats] = useState({ population: 0, activities: 0, aidPrograms: 0, documents: 78 });
  const [demographics, setDemographics] = useState([
    { name: 'Balita', value: 0 },
    { name: 'Anak-Anak', value: 0 },
    { name: 'Remaja', value: 0 },
    { name: 'Dewasa', value: 0 },
    { name: 'Lansia', value: 0 },
  ]);

  useEffect(() => {
    const fetchStatsAndDemographics = async () => {
      try {
        const populationSnapshot = await db.collection("residents").get();
        const activitiesSnapshot = await db.collection("activities").get();
        const socialAidSnapshot = await db.collection("socialAid").get();

        setStats(prev => ({
          ...prev,
          population: populationSnapshot.size,
          activities: activitiesSnapshot.size,
          aidPrograms: socialAidSnapshot.size,
        }));

        // Process demographics
        const residentsData = populationSnapshot.docs.map(doc => doc.data() as Resident);
        const demoData = { balita: 0, anak: 0, remaja: 0, dewasa: 0, lansia: 0 };
        residentsData.forEach(resident => {
          const age = resident.age;
          if (age <= 5) demoData.balita++;
          else if (age <= 11) demoData.anak++;
          else if (age <= 25) demoData.remaja++;
          else if (age <= 55) demoData.dewasa++;
          else demoData.lansia++;
        });

        setDemographics([
          { name: 'Balita', value: demoData.balita },
          { name: 'Anak-Anak', value: demoData.anak },
          { name: 'Remaja', value: demoData.remaja },
          { name: 'Dewasa', value: demoData.dewasa },
          { name: 'Lansia', value: demoData.lansia },
        ]);

      } catch (error) {
        console.error("Error fetching stats and demographics:", error);
      }
    };
    fetchStatsAndDemographics();
  }, []);

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setReport('');
    try {
      const summary = await generateReport({
        population: stats.population,
        activities: stats.activities,
        aidPrograms: stats.aidPrograms,
      });
      setReport(summary);
    } catch (error) {
      console.error("Error generating report:", error);
      setReport("Gagal membuat laporan. Silakan coba lagi.");
    } finally {
      setIsReportLoading(false);
    }
  };

  const statCards = [
    { icon: <PopulationIcon className="h-8 w-8 text-white" />, title: "Total Penduduk", value: stats.population.toLocaleString(), color: "bg-blue-500" },
    { icon: <ActivityIcon className="h-8 w-8 text-white" />, title: "Total Kegiatan", value: stats.activities.toLocaleString(), color: "bg-green-500" },
    { icon: <SocialAidIcon className="h-8 w-8 text-white" />, title: "Program Bantuan", value: stats.aidPrograms.toLocaleString(), color: "bg-yellow-500" },
    { icon: <DocumentIcon className="h-8 w-8 text-white" />, title: "Surat Terbit", value: stats.documents.toLocaleString(), color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={card.title} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-secondary rounded-xl p-6 shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-bold mb-4">Demografi Penduduk</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demographics} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #374151', color: '#F1F5F9' }}
                cursor={{ fill: '#1E293B' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#38BDF8" name="Jumlah Jiwa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-secondary rounded-xl p-6 shadow-lg space-y-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xl font-bold mb-2">Aksi Cepat</h3>
          <button onClick={() => { navigate('/population'); setPage('Manajemen Kependudukan'); }} className="w-full text-left p-4 bg-primary rounded-lg hover:bg-accent hover:text-secondary transition-colors duration-200 flex items-center">
            <PopulationIcon className="h-6 w-6 mr-3" /> Tambah Penduduk Baru
          </button>
          <button onClick={() => { navigate('/activities'); setPage('Manajemen Kegiatan'); }} className="w-full text-left p-4 bg-primary rounded-lg hover:bg-accent hover:text-secondary transition-colors duration-200 flex items-center">
            <ActivityIcon className="h-6 w-6 mr-3" /> Buat Kegiatan Desa
          </button>
          <button onClick={() => { navigate('/documents'); setPage('Administrasi Berkas'); }} className="w-full text-left p-4 bg-primary rounded-lg hover:bg-accent hover:text-secondary transition-colors duration-200 flex items-center">
            <DocumentIcon className="h-6 w-6 mr-3" /> Buat Surat Pengantar
          </button>
        </div>
      </div>

      {/* AI Report Section */}
      <div className="bg-secondary rounded-xl p-6 shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Laporan Ringkas AI</h3>
          <button
            onClick={handleGenerateReport}
            disabled={isReportLoading}
            className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg hover:bg-sky-400 transition-colors duration-200 disabled:bg-gray-500"
          >
            {isReportLoading ? 'Membuat...' : 'Buat Laporan Mingguan'}
          </button>
        </div>
        {report && (
          <div className="p-4 bg-primary rounded-lg prose prose-invert max-w-none text-light whitespace-pre-wrap animate-fade-in">
            <p>{report}</p>
          </div>
        )}
        {isReportLoading && (
          <div className="p-4 bg-primary rounded-lg text-center">
            <p className="text-medium animate-pulse-slow">AI sedang berpikir...</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;