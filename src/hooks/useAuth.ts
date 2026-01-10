import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, setProfile, setLoading, logout } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, profile, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        dispatch(setUser({ id: session.user.id, email: session.user.email || '' }));
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileData) {
          dispatch(setProfile(profileData));
        }
      } else {
        dispatch(logout());
      }
      dispatch(setLoading(false));
    });

    // Then check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser({ id: session.user.id, email: session.user.email || '' }));
        
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            if (profileData) {
              dispatch(setProfile(profileData));
            }
            dispatch(setLoading(false));
          });
      } else {
        dispatch(setLoading(false));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch(logout());
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  };
};
