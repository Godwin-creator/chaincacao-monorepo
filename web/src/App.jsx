import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleGuard from './components/auth/RoleGuard'
import LoadingState from './components/ui/LoadingState'
import PublicLayout from './components/layout/PublicLayout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// ── Pages publiques (lazy) ──────────────────────────────────────────────────
const Home        = lazy(() => import('./pages/public/Home'))
const About       = lazy(() => import('./pages/public/About'))
const HowItWorks  = lazy(() => import('./pages/public/HowItWorks'))
const Verify      = lazy(() => import('./pages/public/Verify'))

// ── Layouts (lazy) ──────────────────────────────────────────────────────────
const CooperativeLayout = lazy(() => import('./components/layout/CooperativeLayout'))
const ProcessorLayout   = lazy(() => import('./components/layout/ProcessorLayout'))
const ExporterLayout    = lazy(() => import('./components/layout/ExporterLayout'))
const VerifierLayout    = lazy(() => import('./components/layout/VerifierLayout'))

// ── Pages coopérative (lazy) ────────────────────────────────────────────────
const CoopDashboard = lazy(() => import('./pages/cooperative/Dashboard'))
const LotsReceived  = lazy(() => import('./pages/cooperative/LotsReceived'))
const TransferLot   = lazy(() => import('./pages/cooperative/TransferLot'))

// ── Pages transformateur (lazy) ─────────────────────────────────────────────
const ProcessorDashboard = lazy(() => import('./pages/processor/Dashboard'))
const QualityEntry       = lazy(() => import('./pages/processor/QualityEntry'))

// ── Pages exportateur (lazy) ────────────────────────────────────────────────
const ExporterDashboard = lazy(() => import('./pages/exporter/Dashboard'))
const EUDRCertificate   = lazy(() => import('./pages/exporter/EUDRCertificate'))
const ExportRecords     = lazy(() => import('./pages/exporter/ExportRecords'))

// ── Pages vérificateur UE (lazy) ────────────────────────────────────────────
const VerifierDashboard = lazy(() => import('./pages/verifier/Dashboard'))
const LotInspection     = lazy(() => import('./pages/verifier/LotInspection'))

// ── Pages d'erreur (lazy) ───────────────────────────────────────────────────
const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const NotFound     = lazy(() => import('./pages/NotFound'))

const wrap = (Component) => (
  <Suspense fallback={<LoadingState />}>
    <Component />
  </Suspense>
)

const protectedLayout = (role, Layout) => (
  <ProtectedRoute>
    <RoleGuard role={role}>
      <Suspense fallback={<LoadingState />}>
        <Layout />
      </Suspense>
    </RoleGuard>
  </ProtectedRoute>
)

const router = createBrowserRouter([
  // ── Routes publiques (avec Header + Footer) ───────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/',              element: wrap(Home) },
      { path: '/about',         element: wrap(About) },
      { path: '/how-it-works',  element: wrap(HowItWorks) },
      { path: '/verify',        element: wrap(Verify) },
      { path: '/verify/:lotId', element: wrap(Verify) },
    ],
  },

  // ── Routes d'authentification ─────────────────────────────────────────────
  { path: '/login',  element: <Login /> },
  { path: '/signup', element: <Signup /> },

  // ── Espace coopérative ────────────────────────────────────────────────────
  {
    path: '/cooperative',
    element: protectedLayout('cooperative', CooperativeLayout),
    children: [
      { index: true,                element: wrap(CoopDashboard) },
      { path: 'lots-received',      element: wrap(LotsReceived) },
      { path: 'transfer-lot',       element: wrap(TransferLot) },
    ],
  },

  // ── Espace transformateur ─────────────────────────────────────────────────
  {
    path: '/processor',
    element: protectedLayout('processor', ProcessorLayout),
    children: [
      { index: true,          element: wrap(ProcessorDashboard) },
      { path: 'quality-entry', element: wrap(QualityEntry) },
    ],
  },

  // ── Espace exportateur ────────────────────────────────────────────────────
  {
    path: '/exporter',
    element: protectedLayout('exporter', ExporterLayout),
    children: [
      { index: true,                element: wrap(ExporterDashboard) },
      { path: 'eudr-certificate',   element: wrap(EUDRCertificate) },
      { path: 'export-records',     element: wrap(ExportRecords) },
    ],
  },

  // ── Espace vérificateur UE ────────────────────────────────────────────────
  {
    path: '/verifier',
    element: protectedLayout('verifier', VerifierLayout),
    children: [
      { index: true,         element: wrap(VerifierDashboard) },
      { path: 'lot-inspection', element: wrap(LotInspection) },
    ],
  },

  // ── Pages d'erreur ────────────────────────────────────────────────────────
  { path: '/unauthorized', element: wrap(Unauthorized) },
  { path: '*',             element: wrap(NotFound) },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
