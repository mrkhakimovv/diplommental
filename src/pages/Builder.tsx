import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Certificate, CertificateData, latToCyr } from '../components/Certificate';
import { Download, Share2, CheckCircle2, FileDown, Edit3, Database, Save, Trash2, X, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  const [savedCerts, setSavedCerts] = useState<any[]>([]);
  const [showDatabase, setShowDatabase] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLocked, setIsLocked] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDbStatus('connecting');
    const unsubscribe = onSnapshot(collection(db, 'diplomas'), (snapshot) => {
      const diplomas = snapshot.docs.map(doc => ({
        _dbId: doc.id,
        ...doc.data()
      }));
      setSavedCerts(diplomas.sort((a: any, b: any) => b.createdAt - a.createdAt));
      setDbStatus('connected');
    }, (error) => {
      console.error("Firestore Error: ", error);
      setDbStatus('error');
    });
    return () => unsubscribe();
  }, []);

  const handleSaveToDatabase = async () => {
    setSaveStatus('saving');
    try {
      if (data._dbId) {
        await updateDoc(doc(db, 'diplomas', data._dbId), {
           ...data,
           updatedAt: Date.now()
        });
      } else {
        const docRef = await addDoc(collection(db, 'diplomas'), {
          ...data,
          createdAt: Date.now()
        });
        setData({ ...data, _dbId: docRef.id });
      }
      setSaveStatus('saved');
      setIsLocked(true);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
      alert("Xatolik yuz berdi");
    }
  };

  const handleDeleteFromDatabase = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if(confirm("Ushbu diplomni o'chirib yuborishni xohlaysizmi?")) {
      try {
        await deleteDoc(doc(db, 'diplomas', id));
        if (data._dbId === id) {
           setData({
              firstName: '', lastName: '', patronymic: '',
              course: '', duration: '', date: new Date().toISOString().split('T')[0],
              certId: generateRandomID(),
              director: 'A. Alimov', secretary: 'S. Qodirova',
           });
           setIsLocked(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLoadFromDatabase = (cert: any) => {
    setData(cert);
    setIsLocked(true);
    setShowDatabase(false);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleDownload = async () => {
    if (hiddenRef.current) {
      setIsGenerating(true);
      try {
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 500));
        const canvas = await html2canvas(hiddenRef.current, { 
          scale: 3, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('.font-handwriting');
            elements.forEach(el => {
              (el as HTMLElement).style.transform = 'translateY(-0.35em)';
              (el as HTMLElement).style.wordSpacing = '0.15em'; 
              (el as HTMLElement).style.letterSpacing = '0.01em';
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
    if (hiddenRef.current) {
      setIsGenerating(true);
      try {
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 500));
        const canvas = await html2canvas(hiddenRef.current, { 
          scale: 3, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('.font-handwriting');
            elements.forEach(el => {
              (el as HTMLElement).style.transform = 'translateY(-0.35em)';
              (el as HTMLElement).style.wordSpacing = '0.15em'; 
              (el as HTMLElement).style.letterSpacing = '0.01em';
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
            <p className="text-slate-500 text-sm mb-4">Ma'lumotlarni kiriting va diplomni yuklab oling.</p>
            
            {/* DB Connection Status Banner */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${dbStatus === 'connected' ? 'bg-blue-50 border-blue-100 text-blue-700' : dbStatus === 'connecting' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <div className="shrink-0 flex items-center justify-center">
                {dbStatus === 'connected' ? <Wifi size={18} /> : dbStatus === 'connecting' ? <Loader2 size={18} className="animate-spin" /> : <WifiOff size={18} />}
              </div>
              <div className="flex-1">
                {dbStatus === 'connected' ? 'Baza bilan aloqa o\'rnatildi' : dbStatus === 'connecting' ? 'Bazaga ulanmoqda...' : 'Baza bilan aloqa yo\'q! Aloqani tekshiring.'}
              </div>
            </div>
        </div>
        
        <div className="space-y-4 mb-auto relative">
          {isLocked && (
            <div className="absolute inset-0 z-10 bg-slate-50/50 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl border border-slate-200">
               <div className="bg-white p-4 rounded-lg shadow-lg text-center w-full max-w-[280px]">
                 <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                 <h3 className="font-bold text-slate-800 mb-1">Diplom saqlandi</h3>
                 <p className="text-xs text-slate-500 mb-4">Ushbu diplom bazaga saqlandi va tahrirlashdan bloklandi.</p>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => {
                       setIsLocked(false);
                     }}
                     className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded font-medium text-sm hover:bg-slate-50 transition-colors"
                   >
                     Tahrirlash
                   </button>
                   <button 
                     onClick={() => {
                       setData({
                         firstName: '', lastName: '', patronymic: '',
                         course: '', duration: '', date: new Date().toISOString().split('T')[0],
                         certId: generateRandomID(),
                         director: 'A. Alimov', secretary: 'S. Qodirova',
                       });
                       setShowCyrillic(false);
                       setIsLocked(false);
                     }}
                     className="flex-1 bg-slate-900 text-white py-2 rounded font-medium text-sm hover:bg-slate-800 transition-colors"
                   >
                     Yangi
                   </button>
                 </div>
               </div>
            </div>
          )}
          <fieldset disabled={isLocked} className={isLocked ? "opacity-40 blur-[1px] pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
            <div className="space-y-4">
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
                      type="button"
                      onClick={() => setData({...data, certId: generateRandomID()})}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-800 transition-colors disabled:opacity-50"
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
          </fieldset>
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
      <div className="flex-1 relative flex flex-col items-center justify-center space-y-8 bg-slate-100 p-8 overflow-hidden">
         <div className="absolute z-40 top-4 right-4 flex gap-2 items-center">
           {/* DB Connection Status */}
           <div className="mr-2 flex items-center">
             {dbStatus === 'connecting' && (
               <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md text-sm font-medium">
                 <Loader2 size={14} className="animate-spin" />
                 Bazaga ulanmoqda...
               </span>
             )}
             {dbStatus === 'connected' && (
               <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md text-sm font-medium">
                 <Wifi size={14} />
                 Baza ulangan
               </span>
             )}
             {dbStatus === 'error' && (
               <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1.5 rounded-md text-sm font-medium">
                 <WifiOff size={14} />
                 Ulanishda xatolik
               </span>
             )}
           </div>

           {/* Save Status */}
           {saveStatus === 'saving' && (
             <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md text-sm font-medium mr-2">
               <Loader2 size={14} className="animate-spin" />
               Saqlanmoqda...
             </span>
           )}
           {saveStatus === 'saved' && (
             <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-md text-sm font-medium mr-2 animate-pulse">
               <CheckCircle2 size={14} />
               Muvaffaqiyatli saqlandi!
             </span>
           )}
           {saveStatus === 'error' && (
             <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium mr-2">
               <AlertCircle size={14} />
               Saqlashda xatolik!
             </span>
           )}
           <button onClick={handleSaveToDatabase} disabled={saveStatus === 'saving' || dbStatus !== 'connected'} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm text-sm font-semibold hover:bg-slate-50 transition-colors text-slate-700 hover:shadow-md disabled:bg-slate-100 disabled:opacity-75 disabled:cursor-not-allowed">
             <Save size={16} /> Saqlash
           </button>
           <button onClick={() => setShowDatabase(true)} className="flex items-center gap-2 bg-slate-900 border border-slate-900 px-4 py-2 rounded-lg shadow-sm text-sm font-semibold hover:bg-slate-800 transition-colors hover:shadow-md text-white">
             <Database size={16} /> Diplomlar Bazasi
           </button>
         </div>

         <div className="w-full flex justify-center pb-8 overflow-x-auto items-center min-h-[750px] px-4 pt-16">
            <div className="transform scale-[0.4] sm:scale-50 md:scale-[0.6] lg:scale-[0.8] xl:scale-90 origin-center transition-transform">
               {/* Yashirin to'liq o'lchamli diplom — faqat PDF/PNG uchun */}
               <div style={{ position: 'absolute', left: '-9999px', top: 0, width: 1000, height: 700, overflow: 'hidden' }}>
                 <div ref={hiddenRef} style={{ width: 1000, height: 700 }}>
                   <Certificate {...data} />
                 </div>
               </div>

               {/* Ekrandagi ko'rinish */}
               <div style={{ width: '1000px', height: '700px' }}>
                  <Certificate ref={certRef} {...data} />
               </div>
            </div>
         </div>
      </div>

      {showDatabase && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <Database className="text-slate-500" /> Diplomlar Bazasi
              </h3>
              <button onClick={() => setShowDatabase(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {savedCerts.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <Database size={48} className="text-slate-300 mb-4" />
                  Hozircha saqlangan diplomlar yo'q.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="p-4 border-b font-semibold text-slate-600 text-sm">ID</th>
                      <th className="p-4 border-b font-semibold text-slate-600 text-sm">F.I.O</th>
                      <th className="p-4 border-b font-semibold text-slate-600 text-sm">Yo'nalish</th>
                      <th className="p-4 border-b font-semibold text-slate-600 text-sm">Sana</th>
                      <th className="p-4 border-b font-semibold text-slate-600 text-sm w-32 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedCerts.map((cert: any, index: number) => (
                      <tr 
                        key={cert._dbId || index} 
                        onClick={() => handleLoadFromDatabase(cert)}
                        className="border-b hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 text-sm font-mono text-slate-600">{cert.certId}</td>
                        <td className="p-4 font-medium text-slate-800">{cert.lastName} {cert.firstName}</td>
                        <td className="p-4 text-slate-600 text-sm">{cert.course}</td>
                        <td className="p-4 text-sm text-slate-500">{cert.date}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleLoadFromDatabase(cert); }} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Tahrirlash uchun yuklash"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteFromDatabase(cert._dbId, e)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
