import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/site/PublicLayout';
import { useSeo } from '@/lib/seo';
import { breadcrumbJsonLd, organizationJsonLd, routeSeo, SITE_URL } from '@/seo/site';
import { DEFAULT_AUTHOR_NAME } from '@/seo/eeat';

const route = routeSeo('/about')!;
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
];

export default function About() {
  useSeo({
    title: route.title,
    description: route.description,
    path: route.path,
    jsonLd: [
      breadcrumbJsonLd(crumbs),
      { '@context': 'https://schema.org', '@type': 'AboutPage', url: `${SITE_URL}/about`, mainEntity: organizationJsonLd() },
    ],
  });
  return (
    <PublicLayout crumbs={crumbs}>
      <article className="prose prose-invert max-w-3xl">
        <h1>About Predictiv</h1>
        <p className="lead">
          Predictiv exists to connect more people with the right practitioners in their area, and to make it easier to understand
          who you actually need to see.
        </p>
        <h2>Blog author</h2>
        <p>{DEFAULT_AUTHOR_NAME}</p>
        <h2>Why we built it</h2>
        <p>
          When something hurts or does not feel right, the first question is often the hardest one: who do I see? A physiotherapist,
          a chiropractor, a biokineticist or a GP? Predictiv answers that in plain language and then helps you find a trusted
          practice nearby, starting in Rondebosch and the Southern Suburbs of Cape Town.
        </p>
        <h2>How it works</h2>
        <ul>
          <li>Search local practitioners by type and suburb on our <Link to="/practitioners">practitioner directory</Link>.</li>
          <li>Or <Link to="/assistant">describe your problem</Link> and see which type of practitioner is usually the best fit.</li>
          <li>Book directly with the practice. Predictiv is free and does not take a cut of your appointment.</li>
        </ul>
        <h2>Built with clinical input</h2>
        <p>
          Predictiv is built with input from registered healthcare practitioners in Cape Town. Its guidance is directional only and is
          never a diagnosis. In an emergency, call an ambulance or go to your nearest emergency unit.
        </p>
        <h2>For practitioners</h2>
        <p>
          Predictiv is free while it is in testing. Listings are compiled from practices' own public websites and any practice can ask
          to update or remove its listing at any time. To get listed, update your details or be removed, email{' '}
          <a href="mailto:predictivpty@gmail.com">predictivpty@gmail.com</a>.
        </p>
      </article>
    </PublicLayout>
  );
}
