import React, { useState, useEffect } from 'react';
import { SocialAidProgram } from '../types';
import { db } from '../services/firebase';
import { EditIcon, TrashIcon } from './icons';

const SocialAid: React.FC = () => {
  const [programs, setPrograms] = useState<SocialAidProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<SocialAidProgram | null>(null);

  const initialFormState = {
    name: '',
    target: '',
    budget: '',
    distributionDate: '',
    recipients: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('socialAid').onSnapshot((snapshot) => {
      const programsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialAidProgram));
      setPrograms(programsData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      setFormData({
        ...selectedProgram,
        budget: String(selectedProgram.budget),
        recipients: String(selectedProgram.recipients)
      });
    } else {
      setFormData(initialFormState);
    }
  }, [selectedProgram]);

  const handleOpenModal = (program: SocialAidProgram | null = null) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.budget || !formData.recipients) {
      alert("Nama program, anggaran, dan jumlah penerima wajib diisi.");
      return;
    }

    const dataToSave = {
      ...formData,
      budget: Number(formData.budget),
      recipients: Number(formData.recipients)
    };

    try {
      if (selectedProgram) {
        await db.collection('socialAid').doc(selectedProgram.id).update(dataToSave);
      } else {
        await db.collection('socialAid').add(dataToSave);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving program: ", error);
      alert("Gagal menambahkan program.");
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus program bantuan ini?")) {
      try {
        await db.collection('socialAid').doc(id).delete();
      } catch (error) {
        console.error("Error deleting program: ", error);
        alert("Gagal menghapus program.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-secondary rounded-xl shadow-lg p-6 w-full max-w-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-light mb-4">{selectedProgram ? 'Edit Program Bantuan' : 'Tambah Program Bantuan Baru'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nama Program*" value={formData.name} onChange={handleFormChange} className="p-2 bg-primary rounded-lg md:col-span-2" required />
              <input type="text" name="target" placeholder="Target Penerima" value={formData.target} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" />
              <input type="number" name="budget" placeholder="Anggaran (Rp)*" value={formData.budget} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <input type="text" name="distributionDate" placeholder="Jadwal Penyaluran" value={formData.distributionDate} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" />
              <input type="number" name="recipients" placeholder="Jumlah Penerima (KK)*" value={formData.recipients} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-primary text-light font-bold rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg">Simpan Program</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-light">Program Bantuan Sosial</h3>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg hover:bg-sky-400 transition-colors duration-200">
          Tambah Program Baru
        </button>
      </div>
      <div className="overflow-x-auto bg-secondary rounded-xl shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-primary">
            <tr>
              <th className="p-4 font-semibold">Nama Program</th>
              <th className="p-4 font-semibold">Target Penerima</th>
              <th className="p-4 font-semibold">Anggaran</th>
              <th className="p-4 font-semibold">Jadwal Penyaluran</th>
              <th className="p-4 font-semibold text-center">Jumlah Penerima</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center p-10 text-medium animate-pulse-slow">Memuat data...</td></tr>
            ) : programs.length > 0 ? (
              programs.map((program, index) => (
                <tr key={program.id} className="border-b border-primary hover:bg-primary/50 opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="p-4 font-semibold">{program.name}</td>
                  <td className="p-4 text-medium">{program.target}</td>
                  <td className="p-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(program.budget)}</td>
                  <td className="p-4">{program.distributionDate}</td>
                  <td className="p-4 text-center">{program.recipients} KK</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <button onClick={() => handleOpenModal(program)} className="text-blue-400 hover:text-blue-300 p-1"><EditIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteProgram(program.id)} className="text-red-500 hover:text-red-400 p-1"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-10 text-medium">Belum ada program bantuan yang ditambahkan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SocialAid;