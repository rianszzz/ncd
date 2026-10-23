import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const metaByPath: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'NCD • Komunitas Riset & Rekayasa Perangkat Lunak | NEXA Tech Labs',
    description: 'Wadah kolaborasi independen mahasiswa untuk rekayasa perangkat lunak, riset siber, dan transparansi organisasi.',
  },
  '/about': {
    title: 'Tentang & Visi Kami • NCD',
    description: 'Mengenal sejarah, nilai riset, tata kelola independen, dan naungan NEXA Tech Labs Ecosystem.',
  },
  '/team': {
    title: 'Struktur Pengurus & Tim • NCD',
    description: 'Daftar pengurus dan kontributor aktif pengembang sistem Nusantara Cyber Developer.',
  },
  '/projects': {
    title: 'Katalog Proyek & Riset • NCD',
    description: 'Koleksi aplikasi, riset siber, dan infrastruktur komputasi buatan mahasiswa NCD.',
  },
  '/join': {
    title: 'Pendaftaran Terbuka • NCD',
    description: 'Formulir rekrutmen terbuka untuk bergabung dalam riset teknologi dan pengembangan proyek NCD.',
  },
  '/app/finance': {
    title: 'Buku Kas Terbuka & Transparansi • NCD',
    description: 'Laporan arus kas real-time berbasis Maker-Checker dengan bukti nota mutasi kas terverifikasi.',
  },
  '/login': {
    title: 'Portal Pengurus • NCD',
    description: 'Autentikasi verifikator dan bendahara pengelola keuangan organisasi NCD.',
  },
  '/terms': {
    title: 'Syarat & Ketentuan • NCD',
    description: 'Pedoman keanggotaan, aturan kode etik, dan ketentuan operasional NEXA Community Development.',
  },
  '/privacy': {
    title: 'Kebijakan Privasi (UU PDP) • NCD',
    description: 'Prinsip perlindungan data pribadi dan hak pemilik data sesuai UU No. 27 Tahun 2022.',
  },
}

export function RouteMeta() {
  const location = useLocation()

  useEffect(() => {
    const current = metaByPath[location.pathname] || {
      title: 'Halaman Tidak Ditemukan • NCD',
      description: 'Halaman yang Anda tuju tidak ditemukan pada sistem NEXA Community Development.',
    }

    document.title = current.title

    let descMeta = document.querySelector('meta[name="description"]')
    if (!descMeta) {
      descMeta = document.createElement('meta')
      descMeta.setAttribute('name', 'description')
      document.head.appendChild(descMeta)
    }
    descMeta.setAttribute('content', current.description)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', current.title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', current.description)

    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) twTitle.setAttribute('content', current.title)
    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc) twDesc.setAttribute('content', current.description)
  }, [location.pathname])

  return null
}
