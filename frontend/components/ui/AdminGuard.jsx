import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem('adminRole');
    if (!role) {
      router.replace('/staff');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;
  return children;
}
