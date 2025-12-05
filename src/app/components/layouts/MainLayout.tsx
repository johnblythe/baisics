import Footer from "@/components/Footer"
import Header from "@/components/Header"
import TawkChat from "@/components/TawkChat"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-14 sm:pt-16">
        {children}
      </main>
      <TawkChat />
      <Footer />
    </div>
  )
}
