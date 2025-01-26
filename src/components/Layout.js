// components/Layout.js
import Header from '@/components/Header'; 
import Footer from '@/components/Footer';

function Layout({ children }) {
  return (
    <div>
      <Header /> 
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;