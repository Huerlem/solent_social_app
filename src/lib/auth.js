// src/lib/auth.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseClient';

// Função para cadastrar o usuário
export async function signup(email, password, name) {
  try {
    // Cria o usuário na autenticação
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualiza o perfil do usuário com o nome
    if (name) {
      await updateProfile(user, { displayName: name });
    }

    // Cria o documento do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: name || '',
      createdAt: serverTimestamp(),
      isAdmin: false, // por padrão, usuários não são admin
      lastLogin: serverTimestamp()
    });

    return user;
  } catch (error) {
    console.error("Erro ao se cadastrar", error);
    throw error;
  }
}

export async function login(email, password, router) {
  try {
    validateEmailAndPassword(email, password);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verifica se o usuário existe no Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // Se não existir, cria o documento do usuário
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName || '',
        createdAt: serverTimestamp(),
        isAdmin: false,
        lastLogin: serverTimestamp()
      });
    } else {
      // Atualiza o último login
      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }

    // Verifica se o usuário é admin
    const isAdmin = userDoc.data()?.isAdmin || false;

    // Redireciona com base no status de admin
    if (router) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }

    return user;
  } catch (error) {
    console.error("Erro ao fazer login", error);
    throw error;
  }
}

// Função para validar email e senha
function validateEmailAndPassword(email, password) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email é obrigatório e deve ser uma string.');
  }

  if (!password || typeof password !== 'string') {
    throw new Error('Senha é obrigatória e deve ser uma string.');
  }
}

// Função para fazer logout do usuário
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao fazer logout", error);
    throw error;
  }
}

// Função para verificar autenticação (para API routes)
export async function verifyAuth(req) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return null;

    const user = await auth.currentUser;
    if (!user) return null;

    // Verifica se o usuário existe no Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      return null;
    }

    // Retorna o usuário com dados adicionais do Firestore
    return {
      ...user,
      isAdmin: userDoc.data().isAdmin || false,
      userData: userDoc.data()
    };
  } catch (error) {
    console.error('Error in auth verification:', error);
    return null;
  }
}

// Helper function to check if a user is admin
export async function isUserAdmin(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}