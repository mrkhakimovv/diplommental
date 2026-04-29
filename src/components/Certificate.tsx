import { QRCodeSVG } from 'qrcode.react';
import React, { forwardRef } from 'react';
import { coatOfArmsBase64 } from '../assets/coatOfArms';

export interface CertificateData {
  firstName: string;
  lastName: string;
  patronymic: string;
  course: string;
  duration: string;
  date: string;
  certId: string;
  firstNameCyr?: string;
  lastNameCyr?: string;
  patronymicCyr?: string;
  courseCyr?: string;
  durationCyr?: string;
  director?: string;
  secretary?: string;
  directorCyr?: string;
  secretaryCyr?: string;
  _dbId?: string;
}

export const latToCyr = (text: string) => {
  if (!text) return '';
  const map: Record<string, string> = {
    "O'": "Ў", "o'": "ў", "G'": "Ғ", "g'": "ғ", "Sh": "Ш", "sh": "ш", "Ch": "Ч", "ch": "ч",
    "Yo": "Ё", "yo": "ё", "Ya": "Я", "ya": "я", "Yu": "Ю", "yu": "ю", "Ts": "Ц", "ts": "ц",
    "A": "А", "a": "а", "B": "Б", "b": "б", "D": "Д", "d": "д", "E": "Е", "e": "е",
    "F": "Ф", "f": "ф", "G": "Г", "g": "г", "H": "Ҳ", "h": "ҳ", "I": "И", "i": "и",
    "J": "Ж", "j": "ж", "K": "К", "k": "к", "L": "Л", "l": "л", "M": "М", "m": "м",
    "N": "Н", "n": "н", "O": "О", "o": "о", "P": "П", "p": "п", "Q": "Қ", "q": "қ",
    "R": "Р", "r": "р", "S": "С", "s": "с", "T": "Т", "t": "т", "U": "У", "u": "у",
    "V": "В", "v": "в", "X": "Х", "x": "х", "Y": "Й", "y": "й", "Z": "З", "z": "з"
  };
  let result = text;
  const multi = ["O'", "o'", "G'", "g'", "Sh", "sh", "Ch", "ch", "Yo", "yo", "Ya", "ya", "Yu", "yu", "Ts", "ts"];
  for (const m of multi) {
      result = result.split(m).join(map[m]);
  }
  return result.split('').map(c => map[c] || c).join('');
};

const monthsUz = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const monthsCyr = ["январ", "феврал", "март", "апрел", "май", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"];

export const Certificate = forwardRef<HTMLDivElement, CertificateData>(
  ({ firstName, lastName, patronymic, course, duration, date, certId, firstNameCyr, lastNameCyr, patronymicCyr, courseCyr, durationCyr, director = 'A. Alimov', secretary = 'S. Qodirova', directorCyr, secretaryCyr, _dbId }, ref) => {
    const params: Record<string, string> = {};
    if (firstName) params.firstName = firstName;
    if (lastName) params.lastName = lastName;
    if (patronymic) params.patronymic = patronymic;
    if (course) params.course = course;
    if (duration) params.duration = duration;
    if (date) params.date = date;
    if (certId) params.certId = certId;
    if (firstNameCyr) params.firstNameCyr = firstNameCyr;
    if (lastNameCyr) params.lastNameCyr = lastNameCyr;
    if (patronymicCyr) params.patronymicCyr = patronymicCyr;
    if (courseCyr) params.courseCyr = courseCyr;
    if (durationCyr) params.durationCyr = durationCyr;
    if (director) params.director = director;
    if (secretary) params.secretary = secretary;
    if (directorCyr) params.directorCyr = directorCyr;
    if (secretaryCyr) params.secretaryCyr = secretaryCyr;

    const origin = process.env.APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://diplom.app');
    const queryParams = new URLSearchParams(params);
    const verifyUrl = _dbId ? `${origin}/view/${_dbId}` : `${origin}/view?${queryParams.toString()}`;

    const parsedDate = date ? new Date(date) : new Date();
    const day = parsedDate.getDate();
    const monthIdx = parsedDate.getMonth();
    const yearStr = String(parsedDate.getFullYear());

    const handwritingStyle = "font-handwriting absolute left-0 right-0 text-center whitespace-nowrap overflow-visible leading-none";
    
    // html2canvas bo'shliqlarni yo'qotadi
    // Yechim: har bir so'zni alohida span ga o'rab, ular orasiga mustahkam bo'shliq qo'yamiz
    const WordSpan = ({ text, className, style, gap = '0.3em' }: { text: string; className?: string; style?: React.CSSProperties; gap?: string }) => {
      const words = (text || '').split(' ').filter(Boolean);
      return (
        <span className={className} style={{ ...style, display: className?.includes('absolute') ? undefined : 'inline' }}>
          {words.map((word, i) => (
            <React.Fragment key={i}>
              <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{word}</span>
              {i < words.length - 1 && <span style={{ display: 'inline-block', width: gap, minWidth: gap, flexShrink: 0 }}>{' '}</span>}
            </React.Fragment>
          ))}
        </span>
      );
    };
    const lineStyle = "border-b relative";

    const SealSVG = () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0, opacity: 0.15 }}>
          <img 
            src={coatOfArmsBase64} 
            alt="watermark" 
            style={{ width: '380px', height: '380px', objectFit: 'contain' }}
          />
      </div>
    );

    const renderLeftPage = () => (
      <div className="flex-1 relative p-6 border-b-2 border-r-2 border-solid overflow-hidden flex flex-col m-2 rounded-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', zIndex: 10 }}>
        <SealSVG />
        <div className="text-center font-sans tracking-wide font-semibold mb-2 text-[15px]" style={{ color: '#334155' }}>
          O'ZBEKISTON RESPUBLIKASI
        </div>
        <div className="text-center font-sans text-[15px] mb-6" style={{ color: '#334155' }}>
          DIPLOM № <span className="font-handwriting text-[28px] underline underline-offset-4 px-2" style={{ color: '#2c5282', textDecorationColor: '#718096' }}>{certId || ' '}</span>
        </div>

        <div className="flex items-end mb-2 relative" style={{ zIndex: 10 }}>
            <span className="whitespace-nowrap mr-2 text-[13px]" style={{ color: '#334155' }}>Mazkur diplom egasi</span>
            <div className={`flex-1 text-center h-8 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                <WordSpan text={lastName} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
            </div>
        </div>
        <div className={`text-center h-[34px] mb-1 relative ${lineStyle}`} style={{ zIndex: 10, borderColor: '#718096' }}>
             <WordSpan text={`${firstName} ${patronymic}`} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
        </div>
        <div className="text-center text-[10px] mb-8 font-sans" style={{ color: '#64748b' }}>(familiyasi, ismi, otasining ismi)</div>

        <div className="text-center text-[14px] leading-[32px] flex flex-col relative mb-4" style={{ color: '#1e293b', zIndex: 10 }}>
             <div className="flex items-center justify-center flex-wrap">
                 <span className="font-semibold" style={{ whiteSpace: 'pre' }}>Shu haqdakim, u   "ILM NURI" o'quv markazi</span>
             </div>
             <div className="flex items-center justify-center w-full mt-1">
                 <div className={`px-2 min-w-[200px] h-8 relative ${lineStyle}`} style={{ borderColor: '#718096' }}>
                     <WordSpan text={duration} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
                 </div>
                 <WordSpan text="muddatli kursi dasturini" className="ml-2 font-semibold" gap="0.28em" />
             </div>
             <div className="flex items-center justify-center w-full mt-2">
                 <div className={`px-4 w-[350px] h-8 relative ${lineStyle}`} style={{ borderColor: '#718096' }}>
                     <WordSpan text={course} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
                 </div>
             </div>
             <div className="mt-2 text-center w-full font-semibold">
                 <WordSpan text="bo'yicha muvaffaqiyatli yakunladi" gap="0.28em" />
             </div>
        </div>

        <div className="flex justify-between items-end mt-auto text-[13px] relative" style={{ zIndex: 20 }}>
             <div className="shrink-0 self-end mb-2 mr-4 pointer-events-auto">
                <div className="p-1 border border-solid bg-white" style={{ borderColor: '#e2e8f0' }}>
                    <QRCodeSVG value={verifyUrl} size={64} level={"L"} fgColor="#0f172a" />
                </div>
             </div>
             
             <div className="flex-col gap-5 flex w-full pb-2">
                 <div className="flex items-end">
                     <span className="w-[60px]" style={{ color: '#1e293b' }}>Direktor:</span>
                     <div className={`flex-1 mx-2 text-center h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                         <WordSpan text={director} className={`${handwritingStyle} text-[26px]`} style={{ color: '#2c5282', bottom: '6px' }} />
                     </div>
                 </div>
                 <div className="flex items-end">
                     <span className="w-[60px]" style={{ color: '#1e293b' }}>Kotib:</span>
                     <div className={`flex-1 mx-2 text-center h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                         <WordSpan text={secretary} className={`${handwritingStyle} text-[26px]`} style={{ color: '#2c5282', bottom: '6px' }} />
                     </div>
                 </div>
             </div>
        </div>
        
        <div className="mt-6 flex flex-col gap-2 text-[13px] w-full" style={{ zIndex: 10, color: '#1e293b' }}>
            <div className="flex items-end flex-wrap h-6">
               Sho'rchi tumani 20
               <span className={`w-8 text-center mx-1 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{yearStr.slice(2)}</span>
               </span> 
                yil "
               <span className={`w-10 text-center mx-1 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{day}</span>
               </span>
                "
               <span className={`px-2 min-w-[70px] text-center ml-1 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{monthsUz[monthIdx]}</span>
               </span>
            </div>
            <div className="flex items-end h-6 mt-1">
               Ro'yxat raqami № 
               <span className={`px-2 min-w-[100px] text-center ml-2 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{certId}</span>
               </span>
            </div>
        </div>
      </div>
    );

    const renderRightPage = () => (
      <div className="flex-1 relative p-6 border-b-2 border-l-2 border-solid overflow-hidden flex flex-col m-2 rounded-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', zIndex: 10 }}>
        <SealSVG />
        <div className="text-center font-sans tracking-wide font-semibold mb-2 text-[15px]" style={{ color: '#334155' }}>
          ЎЗБЕКИСТОН РЕСПУБЛИКАСИ
        </div>
        <div className="text-center font-sans text-[15px] mb-6" style={{ color: '#334155' }}>
          ДИПЛОМ № <span className="font-handwriting text-[28px] underline underline-offset-4 px-2" style={{ color: '#2c5282', textDecorationColor: '#718096' }}>{certId || ' '}</span>
        </div>

        <div className="flex items-end mb-2 relative" style={{ zIndex: 10 }}>
            <span className="whitespace-nowrap mr-2 text-[13px]" style={{ color: '#334155' }}>Мазкур диплом эгаси</span>
            <div className={`flex-1 text-center h-8 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                <WordSpan text={typeof lastNameCyr === 'string' && lastNameCyr.trim() !== '' ? lastNameCyr : latToCyr(lastName)} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
            </div>
        </div>
        <div className={`text-center h-[34px] mb-1 relative ${lineStyle}`} style={{ zIndex: 10, borderColor: '#718096' }}>
             <WordSpan text={`${typeof firstNameCyr === 'string' && firstNameCyr.trim() !== '' ? firstNameCyr : latToCyr(firstName)} ${typeof patronymicCyr === 'string' && patronymicCyr.trim() !== '' ? patronymicCyr : latToCyr(patronymic)}`} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
        </div>
        <div className="text-center text-[10px] mb-8 font-sans" style={{ color: '#64748b' }}>(фамилияси, исми, отасининг исми)</div>

        <div className="text-center text-[14px] leading-[32px] flex flex-col relative mb-4" style={{ color: '#1e293b', zIndex: 10 }}>
             <div className="flex items-center justify-center flex-wrap">
                 <span className="font-semibold" style={{ whiteSpace: 'pre' }}>Шу ҳақдаким, у   "ILM NURI" ўқув маркази</span>
             </div>
             <div className="flex items-center justify-center w-full mt-1">
                 <div className={`px-2 min-w-[200px] h-8 relative ${lineStyle}`} style={{ borderColor: '#718096' }}>
                     <WordSpan text={typeof durationCyr === 'string' && durationCyr.trim() !== '' ? durationCyr : latToCyr(duration)} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
                 </div>
                 <WordSpan text="муддатли курси дастурини" className="ml-2 font-semibold" gap="0.28em" />
             </div>
             <div className="flex items-center justify-center w-full mt-2">
                 <div className={`px-4 w-[350px] h-8 relative ${lineStyle}`} style={{ borderColor: '#718096' }}>
                     <WordSpan text={typeof courseCyr === 'string' && courseCyr.trim() !== '' ? courseCyr : latToCyr(course)} className={`${handwritingStyle} text-[36px]`} style={{ color: '#2c5282', bottom: '10px' }} />
                 </div>
             </div>
             <div className="mt-2 text-center w-full font-semibold">
                 <WordSpan text="бўйича муваффақиятли якунлади" gap="0.28em" />
             </div>
        </div>

        <div className="flex justify-between items-end mt-auto text-[13px] relative" style={{ zIndex: 20 }}>
             <div className="w-[74px] shrink-0 self-end mb-2 mr-4"></div>
             
             <div className="flex-col gap-5 flex w-full pb-2">
                 <div className="flex items-end">
                     <span className="w-[60px]" style={{ color: '#1e293b' }}>Директор:</span>
                     <div className={`flex-1 mx-2 text-center h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                         <WordSpan text={typeof directorCyr === 'string' && directorCyr.trim() !== '' ? directorCyr : latToCyr(director)} className={`${handwritingStyle} text-[26px]`} style={{ color: '#2c5282', bottom: '6px' }} />
                     </div>
                 </div>
                 <div className="flex items-end">
                     <span className="w-[60px]" style={{ color: '#1e293b' }}>Котиб:</span>
                     <div className={`flex-1 mx-2 text-center h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                         <WordSpan text={typeof secretaryCyr === 'string' && secretaryCyr.trim() !== '' ? secretaryCyr : latToCyr(secretary)} className={`${handwritingStyle} text-[26px]`} style={{ color: '#2c5282', bottom: '6px' }} />
                     </div>
                 </div>
             </div>
        </div>
        
        <div className="mt-6 flex flex-col gap-2 text-[13px] w-full" style={{ zIndex: 10, color: '#1e293b' }}>
            <div className="flex items-end flex-wrap h-6">
               Шўрчи тумани 20
               <span className={`w-8 text-center mx-1 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{yearStr.slice(2)}</span>
               </span> 
                йил "
               <span className={`w-10 text-center mx-1 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{day}</span>
               </span>
                "
               <span className={`px-2 min-w-[70px] text-center ml-1 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{monthsCyr[monthIdx]}</span>
               </span>
            </div>
            <div className="flex items-end h-6 mt-1">
               Рўйхат рақами № 
               <span className={`px-2 min-w-[100px] text-center ml-2 inline-block h-6 ${lineStyle}`} style={{ borderColor: '#718096' }}>
                  <span className={`${handwritingStyle} text-[24px]`} style={{ color: '#2c5282', bottom: '6px' }}>{certId}</span>
               </span>
            </div>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        className="w-[1000px] h-[700px] shadow-2xl flex font-sans gap-2 p-2 relative"
        style={{ backgroundColor: '#c8102e', borderRadius: '4px' }}
      >
         <div className="absolute top-0 bottom-0 left-1/2 w-4 -translate-x-1/2 pointer-events-none" style={{ zIndex: 0, backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0))' }}></div>
         {renderLeftPage()}
         {renderRightPage()}
      </div>
    );
  }
);

Certificate.displayName = 'Certificate';
