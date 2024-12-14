import Image from "next/image";
import Link from 'next/link'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Head from 'next/head'
import Body from './home/page';



export default function Home({children}) {
  return (
    <>
        <Head>
            <link rel="shortcut icon" href="/image/favicon.ico" />
            <title>Solent Social App</title>
        </Head>
        <Navbar />
        <main>
          <Body />
        </main>
        <Footer />
        </>
  );
}
