export default function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-chain-bg">
      <div className="w-12 h-12 border-4 border-chain-cyan border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-chain-cyan-light font-body text-sm">Chargement…</p>
    </div>
  )
}
