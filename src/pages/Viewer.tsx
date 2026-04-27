import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Certificate, CertificateData } from '../components/Certificate';
import { Download, AlertCircle, Home, FileCheck2, FileDown } from 'lucide-react';

export default function Viewer() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<CertificateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkData: CertificateData = {
      firstName: searchParams.get('firstName') || '',
      lastName: searchParams.get('lastName') || '',
      patronymic: searchParams.get('patronymic') || '',
      course: searchParams.get('course') || '',
      duration: searchParams.get('duration') || '',
      date: searchParams.get('date') || '',
      certId: searchParams.get('certId') || '',
      firstNameCyr: searchParams.get('firstNameCyr') || undefined,
      lastNameCyr: searchParams.get('lastNameCyr') || undefined,
      patronymicCyr: searchParams.get('patronymicCyr') || undefined,
      courseCyr: searchParams.get('courseCyr') || undefined,
      durationCyr: searchParams.get('durationCyr') || undefined,
      director: searchParams.get('director') || 'A. Alimov',
      secretary: searchParams.get('secretary') || 'S. Qodirova',
      directorCyr: searchParams.get('directorCyr') || undefined,
      secretaryCyr: searchParams.get('secretaryCyr') || undefined
    };
    
    // Validating if basic data exists to render something meaningful
    if (checkData.firstName || checkData.lastName || checkData.course || checkData.certId) {
        setData(checkData);
    }
  }, [searchParams]);

  const handleDownload = async () => {
    if (certRef.current && data) {
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
    if (certRef.current && data) {
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

  if (!data) {
     return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-slate-100 flex flex-col items-center">
               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
               </div>
               <h1 className="text-2xl font-bold text-slate-800 mb-3 font-serif">Diplom Topilmadi</h1>
               <p className="text-slate-600 mb-8 leading-relaxed">
                  Murojaat qilingan QR kod noto'g'ri bo'lishi yoki o'chirilgan bo'lishi mumkin. Qayta urinib ko'ring yoki ta'lim muassasasiga murojaat qiling.
               </p>
               <Link to="/" className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 border border-slate-800 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all">
                 <Home className="w-5 h-5 mr-2" /> Bosh sahifaga qaytish
               </Link>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center pt-8 pb-16 px-4 font-sans">
       
       <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-900 text-center md:text-left flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
               <FileCheck2 className="w-6 h-6 text-slate-700" />
             </div>
             <div>
                <h1 className="text-2xl font-bold font-sans mb-1">Haqiqiy Diplom</h1>
                <p className="text-slate-500 text-sm">Ushbu diplomning tizimdagi elektron tasdiqlangan nusxasi</p>
             </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <Link to="/" className="flex-1 md:flex-none px-6 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-full font-medium transition-shadow shadow-sm flex items-center justify-center gap-2">
                <Home size={16} /> Yaratish
             </Link>
             <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex-1 md:flex-none px-6 py-2 bg-[#dc2626] border border-[#dc2626] hover:bg-[#b91c1c] text-white shadow-sm min-w-[180px] rounded-full font-medium transition-shadow flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
             >
                {isGenerating ? (
                   <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <FileDown size={16} />
                )}
                {isGenerating ? 'Yuklanmoqda...' : 'PDF yuklab olish'}
             </button>
             <button 
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 md:flex-none px-6 py-2 bg-slate-900 border border-slate-900 hover:shadow-md text-white shadow-sm min-w-[180px] rounded-full font-medium transition-shadow flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
             >
                {isGenerating ? (
                   <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <Download size={16} />
                )}
                {isGenerating ? 'Yuklanmoqda...' : 'PNG yuklab olish'}
             </button>
          </div>
       </div>

       <div className="w-full flex justify-center py-6 px-4 overflow-hidden">
          <div className="transform scale-[0.4] sm:scale-50 md:scale-[0.6] lg:scale-[0.8] xl:scale-90 origin-top shadow-2xl rounded-sm overflow-hidden bg-white">
              <div style={{ width: 1000, height: 700 }}>
                 <Certificate ref={certRef} {...data} />
              </div>
          </div>
       </div>

       <p className="text-slate-500 text-sm mt-8 mx-auto text-center max-w-lg">
           Yuqoridagi "Yuklab Olish" tugmalari orqali ushbu diplomning asl nusxasini mobil qurilmangizga yoki kompyuteringizga PDF yoxud PNG formatida saqlab olishingiz mumkin.
       </p>
    </div>
  );
}
