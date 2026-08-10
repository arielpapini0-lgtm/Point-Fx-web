import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';

export default function Login() {
  return (
    <div className="flex justify-center items-center h-screen bg-[#07090f]">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-zinc-800">
        <h2 className="text-white text-xl font-black mb-6 text-center">Panel Admin Point FX</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </div>
    </div>
  );
}