import React, { useState, useEffect } from 'react';
import { Copy, Check, Link as LinkIcon, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RSVPData {
  id: string;
  name: string;
  status: string;
  message: string;
  created_at: string;
}

export default function Admin() {
  const [guestName, setGuestName] = useState('');
  const [copied, setCopied] = useState(false);
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: RSVPData[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          id: doc.id,
          name: docData.name,
          status: docData.status,
          message: docData.message,
          created_at: docData.createdAt?.toDate().toISOString() || new Date().toISOString()
        });
      });
      setRsvps(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateLink = () => {
    const baseUrl = window.location.origin;
    if (!guestName.trim()) return baseUrl;
    // Format name: replace spaces with hyphens
    const formattedName = guestName.trim().replace(/\s+/g, '-');
    return `${baseUrl}/?to=${formattedName}`;
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ucapan ini?')) return;

    try {
      await deleteDoc(doc(db, 'rsvps', id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleCopy = async () => {
    const link = generateLink();

    try {
      // Use modern clipboard API if available and in secure context (HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback for insecure context (like local IP address over HTTP)
        const textArea = document.createElement("textarea");
        textArea.value = link;

        // Prevent scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        // eslint-disable-next-line deprecation/deprecation
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
          alert('Tidak dapat menyalin otomatis di jaringan lokal (HTTP). Silakan blok text link di atas dan salin manual.');
          return;
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin:', err);
      alert('Tidak dapat menyalin otomatis. Silakan salin manual link di atas.');
    }
  };

  return (
    <div className="min-h-screen bg-primary text-text-main font-sans selection:bg-accent selection:text-primary flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.03] traditional-pattern pointer-events-none"></div>

      <div className="glass-panel w-full max-w-lg p-8 relative z-10">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-[1px] bg-accent"></div>
          <span className="text-[10px] tracking-[0.4em] uppercase text-accent font-sans font-medium">Admin Panel</span>
        </div>

        <h1 className="text-3xl serif text-center mb-8 tracking-wide">Buat Link Undangan</h1>

        <div className="space-y-6">
          <div>
            <label htmlFor="guestName" className="block text-[10px] uppercase tracking-[0.2em] text-accent mb-2 opacity-80">Nama Tamu</label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-transparent border-b border-accent/30 focus:border-accent text-white px-0 py-3 outline-none transition-colors font-light text-base"
              placeholder="Contoh: Bpk. Wayan / Semeton Lembongan"
            />
          </div>

          <div>
            <label htmlFor="invitationLink" className="block text-[10px] uppercase tracking-[0.2em] text-accent mb-2 opacity-80">Link Undangan</label>
            <div className="flex items-center gap-2 w-full bg-primary-light border border-accent/20 p-3 rounded-sm">
              <LinkIcon size={16} className="text-text-muted flex-shrink-0" />
              <input
                id="invitationLink"
                type="text"
                readOnly
                value={generateLink()}
                className="w-full bg-transparent outline-none text-sm text-text-muted font-light truncate"
                placeholder="Link Undangan"
                title="Link Undangan"
              />
            </div>
          </div>

          <button
            onClick={handleCopy}
            disabled={!guestName.trim()}
            className="w-full bg-accent text-primary py-4 mt-8 text-xs font-bold tracking-[0.2em] uppercase hover:bg-accent-light transition-colors flex items-center justify-center space-x-2 border border-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Salin Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="glass-panel w-full max-w-4xl p-8 mt-12 relative z-10 overflow-hidden">
        <h2 className="text-2xl serif text-center mb-8 tracking-wide">Daftar Kehadiran & Ucapan</h2>

        {isLoading ? (
          <p className="text-center text-text-muted font-light">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-accent/20">
                  <th className="py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-accent opacity-80 font-normal">Nama</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-accent opacity-80 font-normal">Kehadiran</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-accent opacity-80 font-normal">Ucapan</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-accent opacity-80 font-normal">Waktu</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-[0.2em] text-accent opacity-80 font-normal">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted font-light">Belum ada data RSVPs</td>
                  </tr>
                ) : (
                  rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-accent/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-medium text-sm">{rsvp.name}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${rsvp.status === 'hadir' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'} text-xs rounded-full border ${rsvp.status === 'hadir' ? 'border-green-400/20' : 'border-red-400/20'}`}>
                          {rsvp.status === 'hadir' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span className="capitalize">{rsvp.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-text-muted font-light max-w-xs truncate" title={rsvp.message}>{rsvp.message || '-'}</td>
                      <td className="py-4 px-4 text-xs text-text-muted">{new Date(rsvp.created_at).toLocaleString('id-ID')}</td>
                      <td className="py-4 px-4">
                        <button onClick={() => handleDelete(rsvp.id)} className="text-red-400 hover:text-red-300 opacity-70 hover:opacity-100 transition-opacity" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
