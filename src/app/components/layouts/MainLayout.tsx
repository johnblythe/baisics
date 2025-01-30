import Footer from "@/components/Footer"
import Header from "@/components/Header"
import TawkChat from "@/components/TawkChat"
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <TawkChat />
      <Footer />
    </>
  )
}