import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    username: '',
    role: 'server',
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Identifiants invalides');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    // Validation de l'email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(registerForm.email)) {
      setRegisterError('Veuillez entrer une adresse email valide');
      return;
    }

    // Validation du mot de passe
    if (registerForm.password.length < 6) {
      setRegisterError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation du nom d'utilisateur
    if (registerForm.username.length < 3) {
      setRegisterError(
        "Le nom d'utilisateur doit contenir au moins 3 caractères"
      );
      return;
    }

    try {
      // Vérifier si l'email est déjà utilisé
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', registerForm.username)
        .single();

      if (existingUser) {
        throw new Error("Ce nom d'utilisateur est déjà utilisé");
      }

      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });

      if (authError) {
        console.error("Erreur d'authentification:", authError);
        if (authError.message) {
          if (authError.message.includes('already registered')) {
            throw new Error('Cet email est déjà utilisé');
          }
          if (authError.message.includes('invalid')) {
            throw new Error("L'adresse email n'est pas valide");
          }
        }
        throw new Error(
          'Erreur lors de la création du compte. Veuillez réessayer.'
        );
      }

      if (authData.user) {
        console.log('Utilisateur créé avec succès:', authData.user);

        // Créer le profil utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: registerForm.username,
              role: registerForm.role,
            },
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Erreur détaillée de profil:', profileError);

          // Supprimer l'utilisateur auth si la création du profil échoue
          await supabase.auth.admin.deleteUser(authData.user.id);

          if (profileError.message) {
            if (profileError.message.includes('duplicate key')) {
              throw new Error("Ce nom d'utilisateur est déjà utilisé");
            }
            if (
              profileError.message.includes('violates foreign key constraint')
            ) {
              throw new Error(
                "Erreur lors de la création du profil. L'ID utilisateur n'est pas valide."
              );
            }
          }
          throw new Error(
            `Erreur lors de la création du profil: ${
              profileError.message || 'Erreur inconnue'
            }`
          );
        }

        if (profileData) {
          console.log('Profil créé avec succès:', profileData);
          setRegisterSuccess('Utilisateur créé avec succès !');
          setRegisterForm({
            email: '',
            password: '',
            username: '',
            role: 'server',
          });
          setTimeout(() => {
            setIsRegisterModalOpen(false);
            setRegisterSuccess('');
          }, 2000);
        }
      }
    } catch (error) {
      console.error(
        "Erreur détaillée lors de la création de l'utilisateur:",
        error
      );
      setRegisterError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'utilisateur. Veuillez réessayer."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Connexion
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-200 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white 
                         bg-white dark:bg-gray-700 rounded-t-md 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 
                         transition-colors duration-200 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white 
                         bg-white dark:bg-gray-700 rounded-b-md 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 
                         transition-colors duration-200 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium 
                       rounded-md text-white bg-blue-600 hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       transition-colors duration-200
                       disabled:bg-blue-400 dark:disabled:bg-blue-600 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium 
                       rounded-md text-white bg-green-600 hover:bg-green-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                       transition-colors duration-200"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Créer un compte
            </button>
          </div>
        </form>
      </div>

      {/* Modal d'inscription */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Créer un nouvel utilisateur
            </h2>

            {registerError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                {registerError}
              </div>
            )}

            {registerSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-md">
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="register-email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="register-password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="register-username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="register-username"
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      username: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="register-role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Rôle
                </label>
                <select
                  id="register-role"
                  value={registerForm.role}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, role: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="server">Serveur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Créer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
