import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white font-outfit">
      <Header />
      <main className="flex-grow pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
