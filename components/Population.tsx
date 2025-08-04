import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Resident } from '../types';
import { UserIcon, EditIcon, TrashIcon, UploadIcon, InfoIcon } from './icons';
import { db } from '../services/firebase';

const Population: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    name: '',
    nik: '',
    kk: '',
    age: '',
    gender: 'Laki-laki',
    address: '',
    status: 'Aktif'
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('residents').onSnapshot((snapshot) => {
      const residentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resident));
      setResidents(residentsData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedResident) {
      setFormData({ ...selectedResident, age: String(selectedResident.age) });
    } else {
      setFormData(initialFormState);
    }
  }, [selectedResident]);

  const handleOpenModal = (resident: Resident | null = null) => {
    setSelectedResident(resident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResident(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nik || !formData.kk || !formData.age) {
      alert("Harap isi semua field yang wajib.");
      return;
    }

    const dataToSave = { ...formData, age: Number(formData.age) };

    try {
      if (selectedResident) {
        await db.collection('residents').doc(selectedResident.id).update(dataToSave);
      } else {
        await db.collection('residents').add(dataToSave);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert(`Gagal menyimpan data penduduk. Error: ${error}`);
    }
  };

  const handleDeleteResident = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data penduduk ini?")) {
      try {
        await db.collection('residents').doc(id).delete();
      } catch (error) {
        console.error("Error deleting resident: ", error);
        alert("Gagal menghapus data penduduk.");
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    let successCount = 0;
    let skippedCount = 0;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      const batch = db.batch();

      jsonData.forEach((row) => {
        const name = row['Nama Lengkap'];
        const nik = String(row['NIK'] || '');
        const kk = String(row['No. KK'] || '');
        const age = Number(row['Usia']);
        const gender = row['Jenis Kelamin'];
        const address = row['Alamat'] || '';
        const status = row['Status'];

        const isValidGender = ['Laki-laki', 'Perempuan'].includes(gender);
        const isValidStatus = ['Aktif', 'Pindah', 'Meninggal'].includes(status);

        if (name && nik && kk && !isNaN(age) && isValidGender && isValidStatus) {
          const newResident: Omit<Resident, 'id'> = { name, nik, kk, age, gender, address, status };
          const residentRef = db.collection('residents').doc();
          batch.set(residentRef, newResident);
          successCount++;
        } else {
          skippedCount++;
        }
      });

      if (successCount > 0) {
        await batch.commit();
      }
      alert(`Impor selesai! Berhasil menambahkan ${successCount} data penduduk. Gagal/dilewati: ${skippedCount} data.`);

    } catch (error) {
      console.error("Error importing data: ", error);
      alert(`Gagal mengimpor file. Pastikan format file benar. Error: ${error}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const filteredResidents = useMemo(() => {
    return residents
      .filter(resident => {
        if (statusFilter !== 'Semua' && resident.status !== statusFilter) {
          return false;
        }
        return resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || resident.nik.includes(searchTerm);
      });
  }, [searchTerm, statusFilter, residents]);

  const getStatusColor = (status: 'Aktif' | 'Pindah' | 'Meninggal') => {
    switch (status) {
      case 'Aktif': return 'bg-green-500/20 text-green-400';
      case 'Pindah': return 'bg-yellow-500/20 text-yellow-400';
      case 'Meninggal': return 'bg-red-500/20 text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-secondary rounded-xl shadow-lg p-6 w-full max-w-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-light mb-4">{selectedResident ? 'Edit Data Penduduk' : 'Tambah Penduduk Baru'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nama Lengkap*" value={formData.name} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <input type="text" name="nik" placeholder="NIK*" value={formData.nik} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <input type="text" name="kk" placeholder="No. KK*" value={formData.kk} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <input type="number" name="age" placeholder="Usia*" value={formData.age} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <select name="gender" value={formData.gender} onChange={handleFormChange} className="p-2 bg-primary rounded-lg">
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
              <input type="text" name="address" placeholder="Alamat" value={formData.address} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" />
              <select name="status" value={formData.status} onChange={handleFormChange} className="p-2 bg-primary rounded-lg">
                <option>Aktif</option>
                <option>Pindah</option>
                <option>Meninggal</option>
              </select>
              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-primary text-light font-bold rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Modal for Excel Import */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-secondary rounded-xl shadow-lg p-6 w-full max-w-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-light mb-4">Panduan Format Excel</h3>
            <p className="text-medium mb-4">Pastikan file Excel atau CSV Anda memiliki header (judul kolom) yang persis seperti di bawah ini di baris pertama. Urutan kolom tidak menjadi masalah.</p>
            <ul className="list-disc list-inside space-y-2 text-light mb-4 bg-primary/50 p-4 rounded-lg">
              <li><code className="bg-primary px-2 py-1 rounded">Nama Lengkap</code> (Teks) - Wajib</li>
              <li><code className="bg-primary px-2 py-1 rounded">NIK</code> (Angka/Teks) - Wajib</li>
              <li><code className="bg-primary px-2 py-1 rounded">No. KK</code> (Angka/Teks) - Wajib</li>
              <li><code className="bg-primary px-2 py-1 rounded">Usia</code> (Angka) - Wajib</li>
              <li><code className="bg-primary px-2 py-1 rounded">Jenis Kelamin</code> (Teks: 'Laki-laki' atau 'Perempuan') - Wajib</li>
              <li><code className="bg-primary px-2 py-1 rounded">Alamat</code> (Teks) - Opsional</li>
              <li><code className="bg-primary px-2 py-1 rounded">Status</code> (Teks: 'Aktif', 'Pindah', atau 'Meninggal') - Wajib</li>
            </ul>
            <div className="flex justify-end">
              <button onClick={() => setIsInfoModalOpen(false)} className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg">Mengerti</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-secondary rounded-xl shadow-lg p-6 opacity-0 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-light md:mb-0">Daftar Penduduk</h3>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-lg bg-primary text-light focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-primary text-light focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option>Semua</option>
              <option>Aktif</option>
              <option>Pindah</option>
              <option>Meninggal</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .csv" style={{ display: 'none' }} disabled={isImporting} />
              <button onClick={handleImportClick} disabled={isImporting} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200 flex items-center space-x-2 disabled:bg-gray-500 disabled:cursor-wait">
                <UploadIcon className="h-5 w-5" />
                <span>{isImporting ? 'Mengimpor...' : 'Import'}</span>
              </button>
              <button onClick={() => setIsInfoModalOpen(true)} className="p-2.5 bg-primary text-light rounded-lg hover:bg-medium/30" aria-label="Info format impor">
                <InfoIcon className="h-5 w-5" />
              </button>
            </div>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg hover:bg-sky-400 transition-colors duration-200 flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary">
              <tr>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">NIK</th>
                <th className="p-4 font-semibold">Usia</th>
                <th className="p-4 font-semibold">Gender</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center p-10 text-medium animate-pulse-slow">Memuat data...</td></tr>
              ) : filteredResidents.length > 0 ? (
                filteredResidents.map((resident, index) => (
                  <tr key={resident.id} className="border-b border-primary hover:bg-primary/50 opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="p-4">{resident.name}</td>
                    <td className="p-4 font-mono">{resident.nik}</td>
                    <td className="p-4">{resident.age}</td>
                    <td className="p-4">{resident.gender}</td>
                    <td className="p-4">{resident.address}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resident.status)}`}>
                        {resident.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button onClick={() => handleOpenModal(resident)} className="text-blue-400 hover:text-blue-300 p-1"><EditIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteResident(resident.id)} className="text-red-500 hover:text-red-400 p-1"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-10 text-medium">Data penduduk tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Population;