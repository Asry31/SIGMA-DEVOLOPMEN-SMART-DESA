import React, { useState } from 'react';
import { generateDocument } from '../services/geminiService';
import { DocumentIcon } from './icons';

const DocumentTemplates = [
  {
    id: 1,
    name: 'Surat Pengantar KTP',
    icon: DocumentIcon,
    prompt: 'Buatkan surat pengantar untuk pembuatan KTP baru atas nama [Nama Lengkap], lahir di [Tempat Lahir] pada tanggal [Tanggal Lahir]. Alamat: [Alamat Lengkap]. NIK: [Nomor NIK]. Nomor KK: [Nomor KK].'
  },
  {
    id: 2,
    name: 'Surat Keterangan Tidak Mampu',
    icon: DocumentIcon,
    prompt: 'Buatkan Surat Keterangan Tidak Mampu (SKTM) untuk keperluan [Sebutkan Keperluan, misal: pengajuan beasiswa sekolah] atas nama [Nama Kepala Keluarga]. Alamat: [Alamat Lengkap]. Pekerjaan: [Pekerjaan]. Jumlah tanggungan keluarga: [Jumlah] orang.'
  },
  {
    id: 3,
    name: 'Surat Keterangan Usaha',
    icon: DocumentIcon,
    prompt: 'Buatkan Surat Keterangan Usaha (SKU) yang menerangkan bahwa [Nama Pemilik Usaha] memiliki usaha [Jenis Usaha] yang berlokasi di [Alamat Usaha]. Usaha tersebut telah berjalan sejak tahun [Tahun Mulai Usaha]. Surat ini diperlukan untuk [Keperluan, misal: pengajuan pinjaman bank].'
  },
  {
    id: 4,
    name: 'Surat Pengumuman Desa',
    icon: DocumentIcon,
    prompt: 'Buatkan surat pengumuman untuk seluruh warga desa mengenai kegiatan kerja bakti pembersihan lingkungan yang akan dilaksanakan pada hari [Hari], tanggal [Tanggal Lengkap], pukul [Waktu Mulai]. Titik kumpul di [Lokasi Kumpul].'
  },
];

const Documents: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setGeneratedDoc('');
    try {
      const result = await generateDocument(prompt);
      setGeneratedDoc(result);
    } catch (error) {
      console.error("Error generating document:", error);
      setGeneratedDoc("Gagal membuat dokumen. Pastikan prompt jelas dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Templates Section */}
      <div className="lg:col-span-1 bg-secondary rounded-xl shadow-lg p-6 opacity-0 animate-fade-in-up">
        <h3 className="text-xl font-bold mb-4">Template Berkas</h3>
        <div className="space-y-3">
          {DocumentTemplates.map((template, index) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template.prompt)}
              className="flex items-center p-3 bg-primary rounded-lg cursor-pointer hover:bg-accent hover:text-secondary transition-colors duration-200 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <template.icon className="h-6 w-6 mr-3" />
              <span>{template.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Document Generator */}
      <div className="lg:col-span-2 bg-secondary rounded-xl shadow-lg p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-xl font-bold mb-4">Asisten Pembuat Berkas AI</h3>
        <form onSubmit={handleGenerateDoc} className="space-y-4">
          <div>
            <label htmlFor="doc-prompt" className="block text-sm font-medium text-medium mb-2">
              Jelaskan atau lengkapi template dokumen yang ingin Anda buat:
            </label>
            <textarea
              id="doc-prompt"
              rows={6}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Pilih template di samping atau tulis permintaan Anda di sini. Contoh: Buat surat pengumuman untuk kegiatan kerja bakti hari Minggu, 17 Agustus 2024, jam 7 pagi. Kumpul di balai desa."
              className="w-full p-3 bg-primary rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !prompt}
            className="w-full py-3 bg-accent text-secondary font-bold rounded-lg hover:bg-sky-400 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'AI sedang menulis...' : 'Buat Dokumen'}
          </button>
        </form>

        {(isLoading || generatedDoc) && (
          <div className="mt-6 animate-fade-in">
            <h4 className="font-bold text-lg mb-2">Hasil Dokumen:</h4>
            <div className="p-4 bg-primary rounded-lg min-h-[200px] text-light whitespace-pre-wrap font-serif">
              {isLoading ? <span className="animate-pulse-slow">Memproses...</span> : generatedDoc}
            </div>
            {!isLoading && generatedDoc && (
              <button
                onClick={() => navigator.clipboard.writeText(generatedDoc)}
                className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                Salin Teks
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;