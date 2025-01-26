import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className= "bg-purple-400 p-4 flex justify-center items-center shadow-md">
            <div className="text-white text-sm">
                <p>&copy; {new Date().getFullYear()} <span className="font-semibold">Solent Social</span>. all rights reserved.</p>
            </div>
        </footer> 
    );
}

