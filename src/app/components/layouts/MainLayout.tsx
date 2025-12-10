import Footer from "@/components/Footer"
import Header from "@/components/Header"
import TawkChat from "@/components/TawkChat"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow pt-16 lg:pt-20 bg-gradient-to-b from-[#F8FAFC] to-white">
        {children}
      </main>
      <TawkChat />
      <Footer />
    </div>
  )
}
