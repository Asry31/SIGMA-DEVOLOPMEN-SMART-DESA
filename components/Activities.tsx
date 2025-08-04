import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { db } from '../services/firebase';
import { EditIcon, TrashIcon } from './icons';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const initialFormState = {
    name: '',
    date: '',
    location: '',
    description: '',
    status: 'Akan Datang'
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('activities').orderBy('date', 'desc').onSnapshot((snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      setActivities(activitiesData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      setFormData(selectedActivity);
    } else {
      setFormData(initialFormState);
    }
  }, [selectedActivity]);

  const handleOpenModal = (activity: Activity | null = null) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.location) {
      alert("Nama, tanggal, dan lokasi kegiatan wajib diisi.");
      return;
    }

    try {
      if (selectedActivity) {
        await db.collection('activities').doc(selectedActivity.id).update(formData);
      } else {
        await db.collection('activities').add(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving activity: ", error);
      alert("Gagal menyimpan kegiatan.");
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      try {
        await db.collection('activities').doc(id).delete();
      } catch (error) {
        console.error("Error deleting activity: ", error);
        alert("Gagal menghapus kegiatan.");
      }
    }
  };

  const getStatusColor = (status: 'Akan Datang' | 'Berlangsung' | 'Selesai') => {
    switch (status) {
      case 'Akan Datang': return 'border-blue-500';
      case 'Berlangsung': return 'border-yellow-500';
      case 'Selesai': return 'border-green-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-secondary rounded-xl shadow-lg p-6 w-full max-w-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-light mb-4">{selectedActivity ? 'Edit Kegiatan' : 'Buat Kegiatan Baru'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nama Kegiatan*" value={formData.name} onChange={handleFormChange} className="p-2 bg-primary rounded-lg md:col-span-2" required />
              <input type="date" name="date" placeholder="Tanggal*" value={formData.date} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <input type="text" name="location" placeholder="Lokasi*" value={formData.location} onChange={handleFormChange} className="p-2 bg-primary rounded-lg" required />
              <textarea name="description" placeholder="Deskripsi Kegiatan" value={formData.description} onChange={handleFormChange} className="p-2 bg-primary rounded-lg md:col-span-2 h-24" />
              <select name="status" value={formData.status} onChange={handleFormChange} className="p-2 bg-primary rounded-lg md:col-span-2">
                <option>Akan Datang</option>
                <option>Berlangsung</option>
                <option>Selesai</option>
              </select>
              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-primary text-light font-bold rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg">Simpan Kegiatan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-light">Daftar Kegiatan Desa</h3>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-accent text-secondary font-bold rounded-lg hover:bg-sky-400 transition-colors duration-200">
          Buat Kegiatan Baru
        </button>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-medium animate-pulse-slow">Memuat kegiatan...</div>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className={`bg-secondary rounded-xl shadow-lg p-6 border-l-4 ${getStatusColor(activity.status)} flex flex-col justify-between hover:shadow-accent/20 hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fade-in-up`} style={{ animationDelay: `${index * 75}ms` }}>
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-light mb-1">{activity.name}</h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-primary`}>{activity.status}</span>
                </div>
                <p className="text-sm text-medium mb-4">{new Date(activity.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} - {activity.location}</p>
                <p className="text-sm text-gray-300 min-h-[40px]">{activity.description}</p>
              </div>
              <div className="mt-4 flex justify-end items-center space-x-2">
                <button onClick={() => handleOpenModal(activity)} className="text-blue-400 hover:text-blue-300 p-1"><EditIcon className="w-5 h-5" /></button>
                <button onClick={() => handleDeleteActivity(activity.id)} className="text-red-500 hover:text-red-400 p-1"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-secondary rounded-xl text-medium">
          <p>Belum ada kegiatan yang ditambahkan.</p>
        </div>
      )}
    </div>
  );
};

export default Activities;