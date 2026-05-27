import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Music, Music2, Heart, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RSVPData {
  id?: string;
  name?: string;
  status?: string;
  message?: string;
  createdAt?: any;
}

const FloatingDust = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 15,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute bg-accent rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}vw`,
            top: `110vh`,
            opacity: 0,
            boxShadow: `0 0 ${p.size * 2}px var(--color-accent)`
          }}
          animate={{
            y: [0, -window.innerHeight * 1.5],
            x: [0, Math.random() * 60 - 30],
            opacity: [0, Math.random() * 0.5 + 0.1, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

const BackgroundOrnament = () => (
  <>
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden opacity-[0.04] mix-blend-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="relative w-[150vw] h-[150vw] md:w-[90vw] md:h-[90vw] rounded-full flex items-center justify-center border border-accent/20"
        style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 10deg, var(--color-accent) 10deg 12deg)' }}
      >
        <div className="absolute w-[75%] h-[75%] border border-accent/30 rounded-full" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, var(--color-accent) 0deg 2deg, transparent 2deg 15deg)' }}></div>
        <div className="absolute w-[45%] h-[45%] border border-accent/20 rounded-full"></div>
      </motion.div>
    </div>
  </>
);

const WelcomeCover = ({ onOpen, guestName }: { onOpen: () => void, guestName: string }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vh] immersive-blur-1 animate-blur-1 rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] immersive-blur-2 animate-blur-2 rounded-full"></div>
      </div>
      <div className="absolute inset-0 opacity-[0.03] traditional-pattern animate-pattern pointer-events-none"></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center text-center p-12 max-w-md w-[85%] glass-panel"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-light mb-4 serif text-text-main tracking-tight leading-none"
        >
          Undangan <span className="text-accent italic">Mepandes</span>
        </motion.h1>

        <div className="w-16 h-[1px] bg-accent/20 mt-8 mb-10" />

        <h3 className="text-xl serif text-text-main font-medium tracking-wide">
          I Kadek Evam Wira Sanjaya
        </h3>

        <div className="w-16 h-[1px] bg-accent/20 mt-8 mb-10" />

        <p className="text-[10px] text-text-muted mb-3 uppercase tracking-[0.2em]">Kepada Yth. Bapak/Ibu/Saudara</p>
        <h2 className="text-2xl serif text-text-main mb-10 font-medium tracking-wide">{guestName}</h2>

        <button
          onClick={onOpen}
          className="bg-accent text-primary px-8 py-3 text-[11px] font-sans font-bold uppercase tracking-widest cursor-pointer hover:bg-accent-light transition-colors border border-accent"
        >
          <span>Buka Undangan</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

const SectionHeading = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="text-center mb-16 flex flex-col items-center">
    {subtitle && <p className="uppercase tracking-[0.3em] text-[10px] text-accent mb-4 opacity-80">{subtitle}</p>}
    <h2 className="text-4xl md:text-5xl serif text-text-main font-light tracking-tight">
      <span className="text-accent italic mr-2">{title.split(' ')[0]}</span> {title.split(' ').slice(1).join(' ')}
    </h2>
    <div className="flex justify-center items-center mt-6 space-x-4">
      <div className="w-12 h-[1px] bg-accent/30" />
      <div className="w-1.5 h-1.5 rotate-45 bg-accent/60" />
      <div className="w-12 h-[1px] bg-accent/30" />
    </div>
  </div>
);

const CandidateCard = ({ name, parents, index }: { name: string, parents: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.2, duration: 0.8 }}
    className="flex flex-col items-center text-center p-6"
  >
    <h3 className="text-2xl sm:text-3xl md:text-4xl serif text-accent mb-4 font-medium tracking-wide whitespace-nowrap sm:whitespace-normal">{name}</h3>
    <p className="text-xs md:text-sm text-text-muted uppercase tracking-[0.2em] leading-loose italic opacity-80">
      Putra dari<br />
      <span className="text-white font-medium not-italic text-base sm:text-lg md:text-xl block mt-2">{parents}</span>
    </p>
  </motion.div>
);

export default function Invitation() {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchParams] = useSearchParams();
  const audioRef = useRef<HTMLAudioElement>(null);

  // RSVP Form States
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [wishes, setWishes] = useState<RSVPData[]>([]);

  const rawGuestName = searchParams.get('to');
  const guestName = rawGuestName ? rawGuestName.replace(/-/g, ' ') : 'Tamu Undangan';

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch initial wishes
    const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: RSVPData[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as RSVPData);
      });
      setWishes(data);
    }, (error) => console.error("Could not fetch wishes", error));

    return () => unsubscribe();
  }, []);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !status) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'rsvps'), {
        name,
        status,
        message,
        createdAt: serverTimestamp()
      });

      setSubmitSuccess(true);
      setName('');
      setStatus('');
      setMessage('');

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };

  // Mengatur volume musik (0.0 sampai 1.0)
  // Ubah angka 0.5 di bawah ini sesuai selera (0.5 = 50% volume)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen relative font-sans text-text-main selection:bg-accent selection:text-primary overflow-hidden">

      <BackgroundOrnament />
      <FloatingDust />

      <AnimatePresence>
        {!isOpened && <WelcomeCover guestName={guestName} onOpen={() => {
          setIsOpened(true);
          setIsPlaying(true);
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Gagal putar:", e));
          }
        }} />}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpened ? 1 : 0 }}
        onClick={toggleAudio}
        className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-accent flex items-center justify-center text-primary shadow-2xl border border-accent/40 rounded-sm cursor-pointer hover:bg-accent-light transition-colors"
        aria-label="Putar/Jeda Musik"
        title="Putar/Jeda Musik"
      >
        {isPlaying ? <Music className="animate-pulse" size={20} /> : <Music2 size={20} />}
      </motion.button>

      {isOpened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="fixed inset-0 bg-primary -z-20" />
          <div className="fixed inset-0 opacity-20 pointer-events-none -z-10">
            <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vh] immersive-blur-1 animate-blur-1 rounded-full"></div>
            <div className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vh] immersive-blur-2 animate-blur-2 rounded-full"></div>
          </div>
          <div className="fixed inset-0 bg-primary/50 -z-10 pointer-events-none" />
          <div className="fixed inset-0 opacity-[0.03] traditional-pattern animate-pattern pointer-events-none -z-10"></div>

          <div className="fixed inset-y-0 left-8 border-l border-accent/10 pointer-events-none -z-10 hidden md:block"></div>
          <div className="fixed inset-y-0 right-8 border-r border-accent/10 pointer-events-none -z-10 hidden md:block"></div>

          <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="text-center max-w-3xl mx-auto z-10 glass-panel p-12 lg:p-20 relative"
            >
              <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-accent/30 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-accent/30 pointer-events-none" />

              <h2 className="text-accent italic text-2xl md:text-3xl serif font-normal mb-8">Om Swastiastu</h2>
              <p className="serif text-3xl md:text-5xl lg:text-5xl font-light leading-snug mb-8 tracking-tight">
                “Om Awighnamastu<br /> <span className="italic text-text-muted text-2xl md:text-4xl font-light mt-2 block">Namo Siddham”</span>
              </p>
              <div className="w-[1px] h-16 bg-accent/30 mx-auto mb-8" />
              <p className="text-[13px] md:text-sm leading-loose text-text-muted max-w-xl mx-auto font-light px-4">
                Atas asung kertha wara nugraha Ida Sang Hyang Widhi Wasa,
                kami akan menyelenggarakan Upacara Nyurud Ayu Mepandes/Potong gigi putra kami.
              </p>
            </motion.div>
          </section>

          <section className="py-16 px-4 relative">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 gap-12 max-w-xl mx-auto">
                <CandidateCard
                  index={0}
                  name="I Kadek Evam Wira Sanjaya"
                  parents="I Wayan Suwira & Ni Nyoman Murniasih"
                />
              </div>
            </div>
          </section>

          <section className="py-32 px-4 relative">
            <div className="max-w-4xl mx-auto">
              <SectionHeading title="Waktu & Tempat" />

              <div className="mt-16 max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="glass-panel text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10" />
                  <div className="w-full h-full border border-accent/20 p-10">
                    <div className="space-y-6">
                      <div className="flex flex-col items-center">
                        <Calendar className="text-accent mb-2" size={24} strokeWidth={1.5} />
                        <p className="font-sans font-medium tracking-wide text-sm opacity-90">Kamis, 11 Juni 2026</p>
                      </div>

                      <div className="flex flex-col items-center">
                        <Clock className="text-accent mb-2" size={24} strokeWidth={1.5} />
                        <p className="font-sans font-medium tracking-wide text-sm opacity-90">16:00 WITA - Selesai</p>
                      </div>

                      <div className="w-16 h-[1px] bg-accent/20 mx-auto my-4" />

                      <div className="flex flex-col items-center text-sm text-text-muted">
                        <MapPin className="text-accent mb-2" size={20} strokeWidth={1.5} />
                        <p className="mb-1 text-text-main font-medium tracking-wide">Rumah</p>
                        <p className="opacity-80 leading-relaxed font-light">Banjar Kaja Desa Lembongan<br />Nusa Penida, Klungkung, Bali</p>
                      </div>
                    </div>

                    <a
                      href="https://maps.app.goo.gl/A2rry8UpwWQfqYVr9?g_st=ic"
                      className="inline-block mt-8 border border-accent text-accent px-6 py-2 text-[10px] font-sans uppercase font-bold tracking-[0.2em] hover:bg-accent/10 transition-colors"
                    >
                      Buka Peta
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-24 px-4 relative">
            <div className="max-w-2xl mx-auto">
              <SectionHeading subtitle="Kehadiran" title="RSVP & Ucapan" />

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="glass-panel"
              >
                <div className="w-full h-full border border-accent/20 p-8 md:p-12">
                  <form className="space-y-6" onSubmit={handleRSVPSubmit}>
                    <div>
                      <label htmlFor="rsvpName" className="block text-[10px] font-sans uppercase tracking-[0.2em] text-accent mb-2 opacity-80">Nama Lengkap</label>
                      <input
                        id="rsvpName"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border-b border-accent/30 focus:border-accent text-white px-0 py-3 outline-none transition-colors font-light text-sm"
                        placeholder="Masukkan nama Anda..."
                      />
                    </div>

                    <div>
                      <label htmlFor="rsvpStatus" className="block text-[10px] font-sans uppercase tracking-[0.2em] text-accent mb-2 opacity-80">Kehadiran</label>
                      <select
                        id="rsvpStatus"
                        required
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-primary border-b border-accent/30 focus:border-accent text-white px-0 py-3 outline-none transition-colors appearance-none font-light text-sm"
                      >
                        <option value="" disabled>Apakah Anda akan hadir?</option>
                        <option value="hadir">Ya, Saya akan hadir</option>
                        <option value="tidak">Maaf, Saya tidak bisa hadir</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="rsvpMessage" className="block text-[10px] font-sans uppercase tracking-[0.2em] text-accent mb-2 opacity-80">Ucapan & Doa</label>
                      <textarea
                        id="rsvpMessage"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-transparent border-b border-accent/30 focus:border-accent text-white px-0 py-3 outline-none transition-colors resize-none font-light text-sm"
                        placeholder="Tuliskan ucapan dan doa Anda..."
                      />
                    </div>

                    {submitSuccess && (
                      <p className="text-green-400 text-xs text-center uppercase tracking-widest my-4">Konfirmasi Terkirim!</p>
                    )}

                    <button
                      disabled={isSubmitting || !name || !status}
                      className="w-full bg-accent disabled:opacity-50 text-primary py-4 mt-8 text-xs font-sans font-bold tracking-[0.2em] uppercase hover:bg-accent-light transition-colors flex items-center justify-center space-x-2 border border-accent"
                    >
                      <span>{isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}</span>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </section>

          <footer className="pt-32 pb-12 text-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] traditional-pattern animate-pattern pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl serif mb-6 tracking-tight font-light">Terima Kasih</h2>
              <p className="text-text-muted font-light leading-relaxed mb-12 text-sm opacity-80">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.<br /><br />
                <span className="text-accent italic text-2xl serif font-normal">Om Santih Santih Santih Om</span>
              </p>

              <div className="w-16 h-[1px] bg-accent/30 mb-8" />
              <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-accent opacity-80 mb-12">
                Keluarga Bpk. I Wayan Suwira
              </p>

              {/* Marquee Ucapan */}
              {wishes.length > 0 && (
                <div className="w-full overflow-hidden border-y border-accent/10 py-3 mt-8">
                  <div className="whitespace-nowrap animate-marquee flex gap-12">
                    {wishes.filter(w => w.message && w.message.trim() !== '').map((wish, idx) => (
                      <div key={idx} className="inline-flex items-center gap-2">
                        <Heart size={10} className="text-accent" />
                        <span className="text-text-main font-medium italic serif text-lg">{wish.name}</span>
                        <span className="text-text-muted text-sm mx-2">—</span>
                        <span className="text-text-muted font-light text-sm">{wish.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sponsor Logos Section */}
              <div className="mt-16 w-full flex flex-col items-center">
                <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-accent/70 mb-6">
                  Powered By
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 max-w-lg mx-auto">
                  {/* Sponsor 1 - hyCorp (Transparent) */}
                  <div className="flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer h-15">
                    <img 
                      src="/sponsor_hycorp.png" 
                      alt="hyCorp Logo" 
                      className="h-full object-contain brightness-50 hover:brightness-100 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Sponsor 2 - Wx Host (Transparent) */}
                  <div className="flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer h-15">
                    <img 
                      src="/sponsor_wxhost.png" 
                      alt="Wx Host Logo" 
                      className="h-full object-contain brightness-50 hover:brightness-100 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </footer>

        </motion.div>
      )}
      {/* Audio Element: Ganti URL di src= dengan link musik MP3 Anda */}
      <audio
        ref={audioRef}
        src="/Musik.mp3"
        loop
        preload="auto"
        title="Musik Latar Belakang"
      />

    </div>
  );
}
