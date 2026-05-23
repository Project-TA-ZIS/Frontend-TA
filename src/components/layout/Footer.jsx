import React from 'react'

function Footer() {
  return (
    <>
     {/* ─── FOOTER PUBLIK ─── */}
        <footer className="w-full bg-[#0F766E] px-5 sm:px-8 md:px-12 lg:px-20 py-10 md:py-12 shadow-xl mt-10">
          {/* Grid: 1 kolom di mobile, 3 kolom di layar besar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">

            {/* KOLOM 1: Logo & Deskripsi */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-[#0F766E] font-bold text-xl">D</span>
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-xl leading-tight tracking-wide">
                    DASAWISMA
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
                    LENTENG AGUNG
                  </p>
                </div>
              </div>
              <p className="text-emerald-50/80 text-sm font-medium leading-relaxed">
                Platform transparansi pengelolaan Zakat, Infaq, & Shodaqoh terpadu untuk kesejahteraan warga Lenteng Agung dan sekitarnya.
              </p>
            </div>

            {/* KOLOM 2: Kontak & Alamat */}
            <div className="flex flex-col gap-6">
              {/* Kontak */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                  Hubungi Kami
                </h3>
                <div className="flex items-center gap-3 text-emerald-50/90 text-sm font-medium">
                  <div className="w-8 h-8 bg-emerald-700/50 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <span>+62 812-3456-7890</span>
                </div>
              </div>

              {/* Alamat */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                  Alamat Sekretariat
                </h3>
                <div className="flex items-start gap-3 text-emerald-50/90 text-sm font-medium leading-relaxed">
                  <div className="w-8 h-8 bg-emerald-700/50 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <span>Jl. Raya Lenteng Agung, RT.04/RW.01, Kec. Jagakarsa, Jakarta Selatan, 12610</span>
                </div>
              </div>
            </div>

            {/* KOLOM 3: Google Maps */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                Lokasi Kami
              </h3>
              <div className="w-full rounded-xl overflow-hidden border-2 border-emerald-600/40 shadow-lg">
                <iframe
                  title="Lokasi Kantor Kelurahan Lenteng Agung"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.541259771385!2d106.83489457499127!3d-6.3238211936656565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69edc13106a5f7%3A0x37ec1ef890d0cd3e!2sKantor%20Kelurahan%20Lenteng%20Agung!5e0!3m2!1sid!2sid!4v1779281927310!5m2!1sid!2sid"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full block"
                ></iframe>
              </div>
            </div>

          </div>

          {/* Garis Bawah (Copyright) */}
          <div className="mt-10 md:mt-12 pt-6 border-t border-emerald-600/50 text-center flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <p className="text-xs text-emerald-200/60 font-medium">
              &copy; {new Date().getFullYear()} Sistem Dasawisma Lenteng Agung. All rights reserved.
            </p>
            <p className="text-xs text-emerald-200/60 font-medium">
              Dibuat untuk transparansi & amanah.
            </p>
          </div>
        </footer>
    </>
  )
}

export default Footer