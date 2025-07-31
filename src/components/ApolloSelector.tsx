import { OrganizationContextProvider } from '@/contexts/organization-context';
import { ApolloProvider } from '@apollo/client';
import { usePathname } from 'next/navigation';
import client from '../../apollo-client';

export default function ApolloSelector({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isInst = pathname.startsWith('/inst');

  if (isInst) {
    return (
      <ApolloProvider client={client}>
        <OrganizationContextProvider>{children}</OrganizationContextProvider>
      </ApolloProvider>
    );
  }

  return <>{children}</>;
}
