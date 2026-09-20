import { PublicLayout } from '@/components/site/PublicLayout';
import { useSeo } from '@/lib/seo';

const CONTACT = 'predictivpty@gmail.com';

export default function Join() {
  useSeo({
    title: 'List your practice | Predictiv',
    description:
      'Ask to list, update, or remove a Predictiv directory listing in Cape Town. Listings are compiled from public practice websites until claimed.',
    path: '/join',
  });

  return (
    <PublicLayout crumbs={[{ name: 'Home', path: '/' }, { name: 'List your practice', path: '/join' }]}>
      <article className="max-w-2xl space-y-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">List your practice</h1>
        <p className="text-lg text-muted-foreground">
          Predictiv is in testing in Cape Town. Practitioner sign-up is not self-serve yet. Directory
          cards marked as unclaimed were compiled from the practice&apos;s own public website — they
          are not claimed or managed by the practitioner until we hear from you.
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2">
          <li>Ask to be listed, or to update a listing we already compiled</li>
          <li>Claim a listing so you can manage your own profile later</li>
          <li>Ask us to remove a listing at any time</li>
        </ul>
        <p>
          Email{' '}
          <a className="text-primary underline underline-offset-4" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>{' '}
          with your practice name, suburb, and what you would like us to do.
        </p>
      </article>
    </PublicLayout>
  );
}
