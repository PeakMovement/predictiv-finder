-- DO NOT RUN THIS during the Lovable Cloud cutover.
-- supabase/backup/professionals.sql already contains these listings (and the
-- later Claremont / Newlands / Pinelands rows). Running this seed after that
-- import hits the unique slug index or inserts a second copy of each practice.
--
-- APPLIED LIVE on 2026-09-16 after Justin's explicit go-ahead in chat. Kept here
-- for history/reproducibility. (Originally blocked from running automatically by
-- this session's own safety guardrail, which treats writing real production
-- rows differently from a schema migration -- it required his explicit
-- confirmation in chat before running.)
--
-- Real practitioners found within ~5km of Rondebosch via public web search,
-- 2026-09-16. Sourced from each practice's own website/directory listing --
-- see web/README.md and the delivered spreadsheet (rondebosch_practitioners_5km.xlsx)
-- for citations. None of these practitioners have signed up to Predictiv or
-- consented to a listing; is_claimed = false marks that, and calendly_url
-- points at their own site/booking page (there is no Predictiv-native
-- booking for these). Requires the companion migration
-- supabase/migrations/20260916000001_allow_directory_only_listings.sql to
-- have been applied first (makes user_id nullable, adds is_claimed).

insert into public.professionals
  (user_id, name, profession, location, suburb, latitude, longitude, slug,
   practice_name, bio, contact_number, calendly_url, is_approved, is_claimed)
values
(null, 'Marcela Cawood', 'Physiotherapist', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'marcela-cawood-physiotherapy', 'Marcela Cawood Physiotherapy',
 'Physiotherapy practice at 84 Campground Road, Rondebosch. Listing compiled from the practice''s own website; not yet claimed by the practitioner.',
 '074 420 2000', 'https://www.cwphysio.co.za/', true, false),

(null, 'Carin Kinnell', 'Physiotherapist', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'kinnell-physiotherapy', 'Kinnell Physiotherapy',
 'Physiotherapist based in Rondebosch. Listing compiled from the practitioner''s own booking page; street address and phone were not publicly listed. Not yet claimed by the practitioner.',
 null, 'https://kinnell-physiotherapy.bookem.com/contact', true, false),

(null, 'N. Choto & A. Thorne', 'Physiotherapist', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'choto-thorne-rondebosch-medical-centre', 'Rondebosch Medical Centre',
 'Physiotherapists at Room F104, Stonefountain Terrace, Rondebosch Medical Centre. Listing compiled from the medical centre''s shared doctors directory; not yet claimed.',
 '021 685 9261', 'https://www.rondeboschmc.com/doctors.html', true, false),

(null, 'E. Dreyer', 'Physiotherapist', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'e-dreyer-rondebosch-medical-centre', 'Rondebosch Medical Centre',
 'Physiotherapist at Suite 2016, Stonefountain Terrace, Rondebosch Medical Centre. Listing compiled from the medical centre''s shared doctors directory; not yet claimed.',
 '021 685 1531', 'https://www.rondeboschmc.com/doctors.html', true, false),

(null, 'T. Mckinnon', 'Physiotherapist', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 't-mckinnon-rondebosch-medical-centre', 'Rondebosch Medical Centre',
 'Physiotherapist at Room 304, Summit House, Rondebosch Medical Centre. Listing compiled from the medical centre''s shared doctors directory; not yet claimed.',
 '081 406 6044', 'https://www.rondeboschmc.com/doctors.html', true, false),

(null, 'Halinka Paarman', 'Physiotherapist', 'Newlands, Cape Town', 'Newlands', -33.9736, 18.4589,
 'halinka-paarman-physiotherapy', 'Halinka Paarman Physiotherapy',
 'Physiotherapy practice at 8 Orange Street, Newlands. Listing compiled from the practice''s own website; not yet claimed by the practitioner.',
 '+27 72 391 1179', 'https://halinka-paarman-physiotherapy.bookem.com', true, false),

(null, 'Sports Science Physiotherapy Centre', 'Physiotherapist', 'Newlands, Cape Town', 'Newlands', -33.9736, 18.4589,
 'sports-science-physiotherapy-centre', 'Sports Science Physiotherapy Centre (SSPC)',
 'Physiotherapy practice at the SSISA Building, Boundary Road, Newlands. Listing compiled from the practice''s own website; not yet claimed.',
 '021 659 5684', 'https://sspc.co.za/', true, false),

(null, 'Newlands Village Physiotherapist', 'Physiotherapist', 'Newlands, Cape Town', 'Newlands', -33.9736, 18.4589,
 'newlands-village-physiotherapist', 'Newlands Village Physiotherapist',
 'Physiotherapy practice at 38 Main Street, Newlands. Listing compiled from the practice''s own website; not yet claimed.',
 '021 685 5688', 'https://newlandsvillagephysiotherapist.co.za/', true, false),

(null, 'Nikki Parker', 'Physiotherapist', 'Observatory, Cape Town', 'Observatory', -33.9394, 18.4696,
 'nikki-parker-physiotherapy', 'Nikki Parker Physiotherapy',
 'Physiotherapy practice at Black River Park South, 2 Fir Street, Observatory, roughly 4km from Rondebosch. Listing compiled from the practice''s own website; not yet claimed.',
 '084 240 2827', 'https://www.nikkiphysio.co.za/appointments', true, false),

(null, 'Origin Physiotherapy', 'Physiotherapist', 'Pinelands, Cape Town', 'Pinelands', -33.9309, 18.5119,
 'origin-physiotherapy', 'Origin Physiotherapy',
 'Physiotherapy practice at 55 Morningside Street, Pinelands, roughly 5km from Rondebosch (borderline for the radius). Listing compiled from the practice''s own website; not yet claimed.',
 '+27 61 497 9680', 'https://origin-physiotherapy.bookem.com', true, false),

(null, 'Russell Whittaker', 'Chiropractor', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'belmont-chiropractic', 'Belmont Chiropractic',
 'Chiropractic practice at Victoria House, 25 Belmont Road, Rondebosch. Listing compiled from the practice''s own website; not yet claimed by the practitioner.',
 '066 461 0558', 'https://belmontchiropractic.co.za/', true, false),

(null, 'Malcolm Taylor', 'Chiropractor', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'rondebosch-chiropractic-centre', 'Rondebosch Chiropractic Centre',
 'Chiropractic practice at 30 Bonair Road, Rondebosch. Listing compiled from the practice''s own website; not yet claimed by the practitioner.',
 '021 686 8238', 'https://rondeboschchiropracticcentre.wordpress.com/', true, false),

(null, 'Claremont Chiropractic Health Centre', 'Chiropractor', 'Claremont, Cape Town', 'Claremont', -33.9814, 18.4642,
 'claremont-chiropractic-health-centre', 'Claremont Chiropractic Health Centre',
 'Chiropractic practice at 6 Herschel Road, Claremont. Listing compiled from the practice group''s website; phone number was not published, not yet claimed.',
 null, 'https://www.chiropractor.co.za/location-claremont-chiropractic-health-centre/', true, false),

(null, 'Mowbray Chiropractic Health Centre', 'Chiropractor', 'Mowbray, Cape Town', 'Mowbray', -33.9483, 18.4685,
 'mowbray-chiropractic-health-centre', 'Mowbray Chiropractic Health Centre',
 'Chiropractic practice at the corner of Access Road and Golf Course Road, Mowbray. Listing compiled from the practice group''s website; phone number was not published, not yet claimed.',
 null, 'https://www.chiropractor.co.za/location-mowbray-chiropractic-health-centre/', true, false),

(null, 'CA Cape Doctors Rondebosch', 'General Practitioner', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'ca-cape-doctors-rondebosch', 'CA Cape Doctors',
 'GP practice at Belmont Square Office Park, 21 Belmont Road, Rondebosch. Listing compiled from the practice''s own website; not yet claimed.',
 '063 448 8991', 'https://capedoctors.co.za/doctor-in-rondebosch-gp-in-rondebosch-doctor-open-24-hours/', true, false),

(null, 'Fatima Parker', 'General Practitioner', 'Claremont, Cape Town', 'Claremont', -33.9814, 18.4642,
 'claremont-medical-practice', 'Claremont Medical Practice',
 'GP practice at 1 Stegman Street, Claremont. Listing compiled from the practice''s own website; not yet claimed by the practitioner.',
 '021 683 1232', 'https://doctorclaremont.co.za/', true, false),

(null, 'Ingress Healthcare', 'General Practitioner', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'ingress-healthcare-rondebosch', 'Ingress Healthcare (Rondebosch Medical Centre)',
 'Multi-doctor GP practice in the Rondebosch Medical Centre precinct. Listing compiled from the practice''s own website; not yet claimed.',
 null, 'https://www.ingresshealthcare.co.za/', true, false),

(null, 'E. Pretorius', 'General Practitioner', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'dr-e-pretorius-rondebosch-medical-centre', 'Rondebosch Medical Centre',
 'General Physician at Room F203, Stonefountain Terrace, Rondebosch Medical Centre. Listing compiled from the medical centre''s shared doctors directory; not yet claimed.',
 '021 532 1436', 'https://www.rondeboschmc.com/doctors.html', true, false),

(null, 'P. Whitfield', 'General Practitioner', 'Rondebosch, Cape Town', 'Rondebosch', -33.9578, 18.4747,
 'dr-p-whitfield-rondebosch-medical-centre', 'Rondebosch Medical Centre',
 'General Physician at Room 302, Summit House, Rondebosch Medical Centre. Listing compiled from the medical centre''s shared doctors directory; not yet claimed.',
 '021 686 8740', 'https://www.rondeboschmc.com/doctors.html', true, false);
