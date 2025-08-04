import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

const systemInstruction = `Anda adalah "SIGMA", asisten AI yang cerdas, ramah, dan sangat membantu untuk administrasi desa di Indonesia.
Tujuan utama Anda adalah untuk membantu operator desa dalam tugas-tugas mereka, seperti mengelola data penduduk, membuat surat resmi, merencanakan kegiatan, dan menjawab pertanyaan terkait peraturan desa.
Selalu berikan jawaban yang jelas, terstruktur, dan dalam Bahasa Indonesia yang baik dan benar.
Jika diminta membuat surat atau pengumuman, gunakan format yang formal dan sesuai standar administrasi di Indonesia.
Jika Anda tidak tahu jawabannya, katakan terus terang dan jangan mengarang informasi.
Prioritaskan kemudahan dan efisiensi bagi pengguna.`;

function getChatInstance(): Chat {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
        });
    }
    return chat;
}

export const getAiChatResponseStream = async (message: string) => {
    const chatInstance = getChatInstance();
    
    // The chat instance is stateful and handles history internally.
    // We just need to send the new message.
    const response = await chatInstance.sendMessageStream({ message });
    return response;
};

export const generateReport = async (data: { population: number; activities: number; aidPrograms: number; }): Promise<string> => {
    const prompt = `Buat ringkasan laporan mingguan untuk kepala desa berdasarkan data berikut:
- Total Penduduk: ${data.population} jiwa
- Kegiatan Aktif Minggu Ini: ${data.activities} kegiatan
- Program Bantuan Sosial Berjalan: ${data.aidPrograms} program

Berikan analisis singkat dan saran (jika ada) dalam format poin-poin. Gunakan bahasa yang formal dan lugas.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in generateReport:", error);
        return "Gagal menghasilkan laporan. Silakan coba lagi nanti.";
    }
};

export const generateDocument = async (prompt: string): Promise<string> => {
    const fullPrompt = `Anda adalah asisten administrasi desa. Buatkan draf dokumen resmi berdasarkan permintaan berikut. Gunakan format surat resmi Indonesia, termasuk kop surat sederhana (kosongkan isinya), nomor surat (gunakan format X/XX/PEMDES/TAHUN), perihal, isi surat, dan tempat untuk tanda tangan kepala desa.

Permintaan Pengguna: "${prompt}"`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in generateDocument:", error);
        return "Gagal menghasilkan dokumen. Silakan coba lagi nanti.";
    }
};