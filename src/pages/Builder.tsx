import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Certificate, CertificateData, latToCyr } from '../components/Certificate';
import { Download, Share2, CheckCircle2, FileDown, Edit3 } from 'lucide-react';

export default function Builder() {
  const [data, setData] = useState<CertificateData>({
    firstName: 'Nargiza',
    lastName: 'Yoldosheva',
    patronymic: 'Baxtiyor qizi',
    course: 'Mental arifmetika',
    duration: '1 (bir) oylik',
    date: new Date().toISOString().split('T')[0],
    certId: '2026191',
    director: 'A. Alimov',
    secretary: 'S. Qodirova',
  });
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCyrillic, setShowCyrillic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleDownload = async () => {
    if (certRef.current) {
      setIsGenerating(true);
      try {
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(certRef.current, { 
          scale: 2, 
          useCORS: true,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('.font-handwriting');
            elements.forEach(el => {
              (el as HTMLElement).style.transform = 'translateY(-0.35em)';
            });
          }
        });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${data.firstName || 'diplom'} ${data.lastName || ''}.png`;
        link.click();
      } catch (err) {
        console.error('Error generating image:', err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (certRef.current) {
      setIsGenerating(true);
      try {
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(certRef.current, { 
          scale: 2, 
          useCORS: true,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('.font-handwriting');
            elements.forEach(el => {
              (el as HTMLElement).style.transform = 'translateY(-0.35em)';
            });
          }
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${data.firstName || 'diplom'}_${data.lastName || ''}.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleShare = () => {
    const params: Record<string, string> = {};
    if (data.firstName) params.firstName = data.firstName;
    if (data.lastName) params.lastName = data.lastName;
    if (data.patronymic) params.patronymic = data.patronymic;
    if (data.course) params.course = data.course;
    if (data.duration) params.duration = data.duration;
    if (data.date) params.date = data.date;
    if (data.certId) params.certId = data.certId;
    if (data.firstNameCyr) params.firstNameCyr = data.firstNameCyr;
    if (data.lastNameCyr) params.lastNameCyr = data.lastNameCyr;
    if (data.patronymicCyr) params.patronymicCyr = data.patronymicCyr;
    if (data.courseCyr) params.courseCyr = data.courseCyr;
    if (data.durationCyr) params.durationCyr = data.durationCyr;
    if (data.director) params.director = data.director;
    if (data.secretary) params.secretary = data.secretary;
    if (data.directorCyr) params.directorCyr = data.directorCyr;
    if (data.secretaryCyr) params.secretaryCyr = data.secretaryCyr;

    const queryParams = new URLSearchParams(params);
    const origin = process.env.APP_URL || window.location.origin;
    const url = `${origin}/view?${queryParams.toString()}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const generateRandomID = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 p-8 flex flex-col justify-between overflow-y-auto shrink-0 z-10">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Diplom Generator</h2>
            <p className="text-slate-500 text-sm">Ma'lumotlarni kiriting va diplomni yuklab oling.</p>
        </div>
        
        <div className="space-y-4 mb-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ism va Familiya</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                name="firstName" 
                value={data.firstName}
                onChange={handleChange}
                placeholder="Ismi"
                className="w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
              />
              <input 
                type="text" 
                name="lastName" 
                value={data.lastName}
                onChange={handleChange}
                placeholder="Familiyasi"
                className="w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
              />
            </div>
            <input 
              type="text" 
              name="patronymic" 
              value={data.patronymic}
              onChange={handleChange}
              placeholder="Otasining ismi"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kurs Yo'nalishi va Muddati</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="duration" 
                value={data.duration}
                onChange={handleChange}
                placeholder="1 (bir) oylik"
                className="w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
              />
              <input 
                type="text" 
                name="course" 
                value={data.course}
                onChange={handleChange}
                placeholder="Mental arifmetika"
                className="w-2/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sana</label>
            <input 
              type="date" 
              name="date" 
              value={data.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
            />
          </div>
          
           <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID Raqami</label>
            <div className="flex gap-2">
                <input 
                type="text" 
                name="certId" 
                value={data.certId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
                />
                <button 
                  onClick={() => setData({...data, certId: generateRandomID()})}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-800 transition-colors"
                  title="Yangi ID yaratish"
                >
                  Yangi
                </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rahbariyat</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="director" 
                value={data.director}
                onChange={handleChange}
                placeholder="Direktor"
                className="w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
              />
              <input 
                type="text" 
                name="secretary" 
                value={data.secretary}
                onChange={handleChange}
                placeholder="Kotib"
                className="w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-center cursor-pointer mb-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                checked={showCyrillic}
                onChange={(e) => setShowCyrillic(e.target.checked)}
              />
              <span className="ml-2 text-sm font-medium text-slate-700 flex items-center gap-1">
                 <Edit3 size={14} /> Kiril yozuvini qo'lda tahrirlash
              </span>
            </label>
            
            {showCyrillic && (
              <div className="space-y-4 p-4 mt-2 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      name="firstNameCyr" 
                      value={data.firstNameCyr !== undefined ? data.firstNameCyr : latToCyr(data.firstName)}
                      onChange={handleChange}
                      placeholder="Исми (Kiril)"
                      className="w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none"
                    />
                    <input 
                      type="text" 
                      name="lastNameCyr" 
                      value={data.lastNameCyr !== undefined ? data.lastNameCyr : latToCyr(data.lastName)}
                      onChange={handleChange}
                      placeholder="Фамилияси (Kiril)"
                      className="w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none"
                    />
                  </div>
                  <input 
                    type="text" 
                    name="patronymicCyr" 
                    value={data.patronymicCyr !== undefined ? data.patronymicCyr : latToCyr(data.patronymic)}
                    onChange={handleChange}
                    placeholder="Отасининг исми (Kiril)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none mb-2"
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    name="durationCyr" 
                    value={data.durationCyr !== undefined ? data.durationCyr : latToCyr(data.duration)}
                    onChange={handleChange}
                    placeholder="1 (бир) ойлик"
                    className="w-1/3 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none"
                  />
                  <input 
                    type="text" 
                    name="courseCyr" 
                    value={data.courseCyr !== undefined ? data.courseCyr : latToCyr(data.course)}
                    onChange={handleChange}
                    placeholder="Ментал арифметика"
                    className="w-2/3 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="directorCyr" 
                    value={data.directorCyr !== undefined ? data.directorCyr : latToCyr(data.director || '')}
                    onChange={handleChange}
                    placeholder="Директор (Kiril)"
                    className="w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none"
                  />
                  <input 
                    type="text" 
                    name="secretaryCyr" 
                    value={data.secretaryCyr !== undefined ? data.secretaryCyr : latToCyr(data.secretary || '')}
                    onChange={handleChange}
                    placeholder="Котиб (Kiril)"
                    className="w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button 
             onClick={handleDownloadPDF}
             disabled={isGenerating}
             className="w-full flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isGenerating ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <FileDown size={18} /> 
            )}
            {isGenerating ? 'Yuklanmoqda...' : 'PDF yuklab olish'}
          </button>

          <button 
             onClick={handleDownload}
             disabled={isGenerating}
             className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isGenerating ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Download size={18} /> 
            )}
            {isGenerating ? 'Yuklanmoqda...' : 'PNG yuklab olish'}
          </button>
          
          <button 
             onClick={handleShare}
             className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:shadow-md text-slate-700 py-3 rounded-lg font-semibold transition-shadow shadow-sm"
          >
            {copiedLink ? <CheckCircle2 size={18} className="text-green-600" /> : <Share2 size={18} />} 
            {copiedLink ? "Link nusxalandi!" : "Ulashish uchun link olinishi"}
          </button>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              QR kod skaner qilinganda, foydalanuvchi ushbu diplomning PDF yoki PNG formatini avtomatik ravishda yuklab olish imkoniyatiga ega bo'ladi.
            </p>
          </div>
        </div>

      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-slate-100 p-8 overflow-hidden">
         <div className="w-full flex justify-center pb-8 overflow-x-auto items-center min-h-[750px] px-4">
            <div className="transform scale-[0.4] sm:scale-50 md:scale-[0.6] lg:scale-[0.8] xl:scale-90 origin-center transition-transform">
               {/* Fixed dimensions ensure standard print quality */}
               <div style={{ width: '1000px', height: '700px' }}>
                  <Certificate ref={certRef} {...data} />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
