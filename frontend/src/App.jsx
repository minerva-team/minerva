import AppRoutes from './routes/AppRoutes'
import { Toaster } from '@/components/ui/sonner'   

function App() {
  return (
    <>
      <AppRoutes />
      
      <Toaster 
        position="top-left" 
        dir="rtl"
        toastOptions={{
          classNames: {
            toast: 'group flex items-center gap-3 backdrop-blur-xl bg-[#1c1c1e]/90 border border-white/[0.08] text-white rounded-2xl p-4 shadow-2xl',
            title: 'text-sm font-medium text-white',
            description: 'text-xs text-white/60',
            success: 'border-green-500/20 bg-green-500/10 text-green-400',
            error: 'border-red-500/20 bg-red-500/10 text-red-400',
            icon: 'group-data-[type=error]:text-red-400 group-data-[type=success]:text-green-400 group-data-[type=loading]:text-primaryC',
          },
        }}
      />
    </>
  )
}

export default App