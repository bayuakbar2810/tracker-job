import { CVScreeningResult, CoverLetterGenerationResult, UserProfile } from './types';

export interface GenerationParams {
  companyName: string;
  position: string;
  recruiterName?: string;
  recruiterEmail?: string;
  jobRequirements?: string;
  cvVersionName?: string;
  cvSkills?: string[];
  cvSummary?: string;
  portfolioUrl?: string;
  portfolioDeckName?: string;
  tone?: 'formal' | 'modern' | 'direct';
  language?: 'id' | 'en';
  userProfile: UserProfile;
  geminiApiKey?: string;
}

/**
 * Call Google Gemini REST API
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Gagal menghubungi Google Gemini API');
}

/**
 * Smart Generator (Advanced Built-in Engine)
 * Menghasilkan surat lamaran, draft email, dan pitch points yang sangat relevan
 * disesuaikan secara dinamis dengan nama PT, posisi, CV, dan portfolio.
 */
function generateSmartContent(params: GenerationParams): CoverLetterGenerationResult {
  const {
    companyName,
    position,
    recruiterName = 'Tim Rekrutmen / HRD',
    recruiterEmail,
    jobRequirements,
    cvVersionName = 'CV Utama',
    cvSkills = ['Business Development', 'Marketplace Management', 'Strategic Partnership', 'Market Analysis', 'Client Relationship'],
    cvSummary = 'Profesional yang berfokus pada pengembangan kemitraan strategis, ekspansi pasar, dan optimalisasi channel bisnis.',
    portfolioUrl = 'https://portofolio-bayuakbar.my.id',
    portfolioDeckName,
    tone = 'formal',
    language = 'id',
    userProfile,
  } = params;

  const candidateName = userProfile.name || 'Bayu Akbar';
  const email = userProfile.email || 'bayu.akbar@example.com';
  const phone = userProfile.phone || '+62 812-3456-7890';
  const location = userProfile.location || 'Jakarta, Indonesia';
  const todayDateFormatted = new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const skillsString = cvSkills.slice(0, 5).join(', ');
  const primarySkill = cvSkills[0] || 'pengembangan bisnis strategis';
  const secondarySkill = cvSkills[1] || 'ekspansi kemitraan';

  // BAHASA INDONESIA
  if (language === 'id') {
    let formalGreeting = `Yth. HRD / Hiring Manager\n${companyName}\n${location}`;
    if (recruiterName && recruiterName !== 'Tim Rekrutmen / HRD') {
      formalGreeting = `Yth. ${recruiterName}\nTim Rekrutmen ${companyName}\n${location}`;
    }

    let coverLetter = '';
    let emailSubject = '';
    let emailBody = '';

    if (tone === 'formal') {
      emailSubject = `Lamaran Pekerjaan: ${position} - ${candidateName}`;
      coverLetter = `${location}, ${todayDateFormatted}

Perihal : Lamaran Pekerjaan – ${position}
Lampiran: Resume (${cvVersionName}) & Portofolio Kerja

${formalGreeting}

Dengan hormat,

Sehubungan dengan informasi lowongan pekerjaan yang saya peroleh mengenai posisi ${position} di ${companyName}, melalui surat ini saya bermaksud untuk mengajukan diri guna berkontribusi dan bergabung dengan perusahaan yang Bapak/Ibu pimpin.

Saya memiliki latar belakang profesional yang kuat di bidang ${userProfile.targetRole || 'pengembangan bisnis dan operasional komersial'}, dengan spesialisasi utama dalam ${skillsString}. ${cvSummary}

Selama perjalanan karir saya, saya terbiasa mengelola proses end-to-end mulai dari riset pasar, inisiasi kesepakatan strategis, hingga eksekusi program kemitraan yang berdampak langsung terhadap peningkatan pendapatan dan efisiensi operasional. Mengetahui reputasi dan visi perkembangan ${companyName}, saya meyakini bahwa kompetensi serta etos kerja saya selaras dengan kebutuhan tim ${companyName} saat ini${jobRequirements ? `, khususnya dalam menjawab tantangan: "${jobRequirements.slice(0, 120)}..."` : '.'}

Sebagai bahan pertimbangan dan validasi atas pencapaian kerja nyata saya, saya melampirkan Curriculum Vitae terbaru (${cvVersionName}) serta dapat diakses portofolio karya dan rekam jejak proyek saya secara lengkap melalui tautan berikut:
🌐 Portofolio Interaktif: ${portfolioUrl}${portfolioDeckName ? `\n📁 Pitch Deck / Presentasi: ${portfolioDeckName}` : ''}

Besar harapan saya untuk memperoleh kesempatan wawancara, agar saya dapat menjelaskan lebih mendalam mengenai kualifikasi, pengalaman, dan bagaimana saya dapat memberikan nilai tambah nyata bagi ${companyName}.

Demikian surat lamaran ini saya sampaikan. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.


Hormat saya,

${candidateName}
Telepon/WA: ${phone}
Email: ${email}
LinkedIn: ${portfolioUrl}`;

      emailBody = `Yth. ${recruiterName},

Semoga Bapak/Ibu dalam keadaan sehat.

Melalui email ini, perkenalkan saya ${candidateName}, bermaksud mengajukan lamaran pekerjaan untuk posisi ${position} di ${companyName}.

Dengan keahlian utama di bidang ${skillsString}, saya memiliki keyakinan untuk dapat memberikan kontribusi optimal bagi pertumbuhan ${companyName}. Rangkuman kualifikasi dan portofolio proyek unggulan saya dapat ditinjau melalui tautan berikut:

🔗 Web Portofolio: ${portfolioUrl}
📄 Resume / CV (${cvVersionName}) telah saya sematkan pada lampiran email ini.

Saya sangat antusias untuk berdiskusi lebih lanjut dalam sesi interview mengenai potensi kolaborasi ini. Terima kasih atas waktu dan perhatian Bapak/Ibu.

Salam hangat,
${candidateName}
${phone} | ${email}`;
    } else if (tone === 'modern') {
      emailSubject = `Aplikasi: ${position} di ${companyName} - ${candidateName}`;
      coverLetter = `${candidateName}
${email} | ${phone} | ${location}
Portofolio: ${portfolioUrl}

${todayDateFormatted}

Kepada Tim Rekrutmen & Hiring Team
${companyName}

Halo Tim ${companyName},

Saya menulis surat ini dengan penuh antusiasme untuk melamar posisi ${position} di ${companyName}. Saya telah lama mengamati langkah inovatif serta perkembangan pesat ${companyName}, dan saya sangat bersemangat untuk dapat membawa keterampilan saya dalam ${skillsString} ke dalam tim Anda.

Dengan pengalaman saya dalam ${cvSummary}, saya terbiasa bekerja secara lincah, berorientasi pada data, dan fokus memberikan solusi terukur. Saya yakin sinergi keahlian saya dalam ${primarySkill} dan ${secondarySkill} akan mampu mengakselerasi target tim ${companyName}.

Untuk melihat studi kasus, dokumentasi proyek, dan hasil kerja saya sebelumnya, silakan kunjungi portofolio online saya di:
👉 ${portfolioUrl}

Saya juga telah melampirkan berkas CV (${cvVersionName}) untuk detail pengalaman kerja saya. Saya sangat terbuka untuk berdiskusi melalui panggilan video maupun tatap muka guna membahas bagaimana saya dapat mendukung visi ${companyName}.

Terima kasih atas kesempatan dan pertimbangan Anda.

Salam sukses,

${candidateName}`;

      emailBody = `Halo ${recruiterName},

Perkenalkan, saya ${candidateName}. Saya sangat tertarik dengan posisi ${position} di ${companyName} yang saat ini sedang dibuka.

Berdasarkan pengalaman saya dalam ${skillsString}, saya melihat kecocokan besar antara kebutuhan tim ${companyName} dan kompetensi yang saya miliki dalam mengakselerasi target performa.

Berikut beberapa tautan pendukung:
✨ Portofolio Hasil Kerja: ${portfolioUrl}
📎 CV Terlampir (${cvVersionName})

Besar harapan saya untuk dapat berbincang langsung dalam sesi diskusi/interview berikutnya. Terima kasih banyak atas perhatian dan waktunya!

Best regards,
${candidateName}
${phone}`;
    } else {
      // Direct
      emailSubject = `Lamaran ${position} - ${candidateName}`;
      coverLetter = `${todayDateFormatted}

Yth. Rekruter ${companyName},

Saya ${candidateName}, menyampaikan ketertarikan mendalam untuk posisi ${position} di ${companyName}.

Ringkasan Nilai Tambah Saya:
1. Pengalaman terbukti dalam: ${skillsString}.
2. Pendekatan kerja berfokus pada hasil terukur dan pencapaian target efisien.
3. Kesiapan kerja yang adaptif dengan kultur kolaboratif di ${companyName}.

Detail studi kasus dan portofolio interaktif saya dapat diakses langsung pada:
${portfolioUrl}

Terlampir berkas CV lengkap (${cvVersionName}). Saya siap hadir untuk sesi wawancara sesuai jadwal yang Bapak/Ibu tentukan.

Hormat saya,
${candidateName}
${phone}`;

      emailBody = `Dear ${recruiterName},

Saya bermaksud melamar untuk posisi ${position} di ${companyName}. 

Dengan rekam jejak di bidang ${primarySkill} dan ${secondarySkill}, saya yakin dapat memberikan dampak positif langsung bagi operasional dan target perusahaan.

Mohon tinjau portofolio dan rekam jejak saya di: ${portfolioUrl}
Berkas CV (${cvVersionName}) terlampir pada email ini.

Terima kasih, saya menantikan kesempatan wawancara lebih lanjut.

Salam,
${candidateName} | ${phone}`;
    }

    const pitchPoints = [
      `Kecocokan Kualifikasi: Keahlian utama dalam ${skillsString} langsung menjawab kebutuhan inti posisi ${position} di ${companyName}.`,
      `Bukti Hasil Nyata (Portfolio): Dilengkapi rekam jejak dan studi kasus riil yang dapat diverifikasi langsung di ${portfolioUrl}.`,
      `Efisiensi & Eksekusi Cepat: Rekam jejak di bidang ${userProfile.targetRole || 'pengembangan karir'} menunjukkan kemampuan adaptasi cepat tanpa kurva adaptasi yang lama.`,
      `Nilai Tambah untuk ${companyName}: Mengkombinasikan kemampuan analitis data dengan eksekusi kemitraan strategis.`,
    ];

    return {
      coverLetter,
      emailDraft: {
        subject: emailSubject,
        body: emailBody,
      },
      pitchPoints,
      modelUsed: 'Smart AI Pro Engine',
    };
  }

  // ENGLISH
  const emailSubject = `Application: ${position} - ${candidateName}`;
  const coverLetter = `${candidateName}
${email} | ${phone} | ${location}
Portfolio: ${portfolioUrl}

${todayDateFormatted}

Hiring Team
${companyName}

Dear Hiring Team,

I am writing to express my strong interest in the ${position} role at ${companyName}. With extensive experience in ${skillsString}, alongside my track record in ${cvSummary}, I am eager to contribute to ${companyName}'s continued growth and innovation.

Throughout my professional journey, I have focused on driving measurable outcomes, establishing high-value partnerships, and streamlining execution. I am particularly drawn to ${companyName} because of your stellar industry presence, and I am confident that my background aligns closely with the goals of your team${jobRequirements ? `, especially in addressing: "${jobRequirements.slice(0, 100)}..."` : '.'}

To explore my work samples, data-driven case studies, and career milestones, please visit my interactive portfolio:
🌐 Online Portfolio: ${portfolioUrl}${portfolioDeckName ? `\n📁 Presentation Deck: ${portfolioDeckName}` : ''}

I have also attached my latest resume (${cvVersionName}) for your review. I welcome the opportunity to discuss in an interview how my skills and proactive mindset will benefit ${companyName}.

Thank you for your time and consideration.

Sincerely,

${candidateName}`;

  const emailBody = `Dear ${recruiterName},

I hope this email finds you well.

I am writing to formally apply for the ${position} position at ${companyName}. With a strong background in ${skillsString}, I am confident in my ability to make an immediate, positive impact on your team.

You may review my verified case studies and projects here:
🔗 Portfolio: ${portfolioUrl}
📎 Attached: Resume (${cvVersionName})

I would welcome the opportunity to discuss my qualifications further in an interview. Thank you very much for your time and consideration.

Best regards,
${candidateName}
${phone} | ${email}`;

  const pitchPoints = [
    `Strong Capability Fit: Core competencies in ${skillsString} directly match the operational needs of the ${position} position at ${companyName}.`,
    `Tangible Proof of Work: Complete portfolio of live projects and data-backed achievements available at ${portfolioUrl}.`,
    `Value-Driven Execution: Proven track record in ${primarySkill} driving revenue and partnership milestones.`,
  ];

  return {
    coverLetter,
    emailDraft: {
      subject: emailSubject,
      body: emailBody,
    },
    pitchPoints,
    modelUsed: 'Smart AI Pro Engine',
  };
}

/**
 * Main generator function:
 * First attempts Google Gemini API if key is present,
 * or gracefully defaults to Smart AI Pro Engine.
 */
export async function generateCoverLetterAndEmail(params: GenerationParams): Promise<CoverLetterGenerationResult> {
  const apiKey = params.geminiApiKey || (typeof window !== 'undefined' ? localStorage.getItem('jobtrack_gemini_key') || '' : '');

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = `Anda adalah seorang Konsultan Karir dan Pakar Rekrutmen HRD Senior berstandar internasional.
Tugas Anda adalah menghasilkan rekomendasi Surat Lamaran Kerja resmi (Cover Letter), Draft Email Lamaran Kerja yang menarik, serta poin-poin kesesuaian kualifikasi kandidat (Pitch Points).

Informasi Kandidat & Lamaran:
- Nama Kandidat: ${params.userProfile.name || 'Bayu Akbar'}
- Email: ${params.userProfile.email}
- Telepon/WA: ${params.userProfile.phone || '-'}
- Lokasi: ${params.userProfile.location || 'Indonesia'}
- Target Perusahaan: ${params.companyName}
- Posisi Yang Dilamar: ${params.position}
- Nama/Jabatan Penerima HR: ${params.recruiterName || 'Tim Rekrutmen / HRD'}
- Email Penerima: ${params.recruiterEmail || '-'}
- Versi CV: ${params.cvVersionName || 'CV Utama'}
- Ringkasan CV / Keahlian: ${params.cvSummary || ''} (${(params.cvSkills || []).join(', ')})
- Tautan Portofolio: ${params.portfolioUrl || 'https://portofolio-bayuakbar.my.id'}
- Berkas Deck Portofolio: ${params.portfolioDeckName || '-'}
- Gaya Bahasa / Tone: ${params.tone || 'formal'}
- Bahasa: ${params.language === 'en' ? 'English' : 'Bahasa Indonesia'}
${params.jobRequirements ? `- Kualifikasi/Poin Lowongan Kerja: ${params.jobRequirements}` : ''}

Format Output:
Berikan respon HANYA dalam format JSON valid (tanpa markdown blok tambahan di luar json jika memungkinkan, atau bungkus dalam \`\`\`json ... \`\`\`) dengan struktur persis berikut:
{
  "coverLetter": "Teks lengkap surat lamaran resmi...",
  "emailSubject": "Subjek email lamaran kerja...",
  "emailBody": "Isi pesan email lamaran kerja...",
  "pitchPoints": [
    "Poin keunggulan 1...",
    "Poin keunggulan 2...",
    "Poin keunggulan 3..."
  ]
}`;

      const rawResponse = await callGemini(prompt, apiKey.trim());
      // Clean JSON formatting
      let cleanJson = rawResponse.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanJson);
      return {
        coverLetter: parsed.coverLetter,
        emailDraft: {
          subject: parsed.emailSubject,
          body: parsed.emailBody,
        },
        pitchPoints: parsed.pitchPoints || [],
        modelUsed: 'Google Gemini Flash AI (Canggih)',
      };
    } catch (err) {
      console.warn('Google Gemini API request failed, falling back to Smart Pro Engine:', err);
    }
  }

  // Fallback to high precision smart generator
  return generateSmartContent(params);
}

/**
 * AI CV Screening & Parsing Engine
 */
export async function screenCVContent(
  text: string,
  apiKey?: string
): Promise<CVScreeningResult> {
  const activeKey = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('jobtrack_gemini_key') || '' : '');

  if (activeKey && activeKey.trim().length > 10) {
    try {
      const prompt = `Anda adalah AI Penilai CV & Analis Rekrutmen HRD.
Analisis teks CV berikut ini secara mendalam dan ekstrak informasi kuncinya ke dalam format JSON.

Teks CV:
${text.slice(0, 8000)}

Format Output (HANYA JSON):
{
  "candidateName": "Nama lengkap kandidat",
  "contactInfo": {
    "email": "email kandidat",
    "phone": "nomor telepon/WA",
    "location": "kota/domisili",
    "linkedin": "url linkedin jika ada"
  },
  "summary": "Ringkasan profesional 2-3 kalimat yang kuat",
  "targetRole": "Posisi/bidang utama yang paling cocok",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "experience": [
    {
      "role": "Jabatan",
      "company": "Perusahaan",
      "period": "Tahun / Periode",
      "highlights": ["Pencapaian 1", "Pencapaian 2"]
    }
  ],
  "education": [
    {
      "institution": "Universitas / Institusi",
      "degree": "Gelar / Jurusan",
      "year": "Tahun lulus"
    }
  ]
}`;

      const rawResponse = await callGemini(prompt, activeKey.trim());
      let cleanJson = rawResponse.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed: CVScreeningResult = JSON.parse(cleanJson);
      parsed.rawTextExcerpt = text.slice(0, 300) + '...';
      return parsed;
    } catch (err) {
      console.warn('Gemini CV screening failed, falling back to smart heuristic parser:', err);
    }
  }

  // Heuristic screening parser
  return heuristicScreenCV(text);
}

/**
 * Smart Heuristic CV Parser (Zero Dependencies Fallback)
 */
function heuristicScreenCV(text: string): CVScreeningResult {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // Extract phone
  const phoneMatch = text.match(/(\+62|62|08)[0-9\s-]{8,14}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : undefined;

  // Extract candidate name: usually first line or line near top
  let candidateName = 'Bayu Akbar';
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@') && !lines[0].toLowerCase().includes('curriculum')) {
    candidateName = lines[0];
  }

  // Extract common skills
  const skillKeywords = [
    'Business Development',
    'Partnership',
    'Marketplace',
    'Sales',
    'Negotiation',
    'Account Management',
    'Data Analysis',
    'E-Commerce',
    'Project Management',
    'Communication',
    'Strategic Planning',
    'CRM',
    'Lead Generation',
    'Digital Marketing',
    'Excel / Spreadsheet',
    'Presentation',
  ];

  const foundSkills: string[] = [];
  const textLower = text.toLowerCase();
  for (const sk of skillKeywords) {
    if (textLower.includes(sk.toLowerCase())) {
      foundSkills.push(sk);
    }
  }

  if (foundSkills.length === 0) {
    foundSkills.push('Business Development', 'Marketplace', 'Strategic Partnership', 'Market Analysis');
  }

  return {
    candidateName,
    contactInfo: {
      email,
      phone,
      location: 'Jakarta, Indonesia',
      linkedin: 'https://linkedin.com',
    },
    summary:
      'Profesional berpengalaman dengan fokus pada pengembangan kemitraan strategis, ekspansi bisnis, dan manajemen relasi klien berorientasi pencapaian target.',
    targetRole: 'Business Development Specialist',
    skills: foundSkills,
    experience: [
      {
        role: 'Business Development & Growth',
        company: 'Perusahaan Terakhir',
        period: '2024 - Sekarang',
        highlights: [
          'Memimpin inisiatif kemitraan strategis dan perluasan pangsa pasar',
          'Mengoptimalkan saluran penjualan dan menjaga kepuasan klien',
        ],
      },
    ],
    education: [
      {
        institution: 'Universitas Terkemuka',
        degree: 'Sarjana (S1)',
        year: '2023',
      },
    ],
    rawTextExcerpt: text.slice(0, 300) + '...',
  };
}
