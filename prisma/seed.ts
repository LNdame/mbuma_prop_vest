import { loadEnv } from '../lib/load-env';
import pg from 'pg';
import { hashPassword } from '../backend/src/lib/password.js';

loadEnv();

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const q = (text: string, values?: unknown[]) => client.query(text, values);

  /* ── Admin user ─────────────────────────────────────────────── */
  const adminEmail = 'admin@mbuma.co.za';
  const { rows: [existingAdmin] } = await q(
    'SELECT id FROM users WHERE email = $1', [adminEmail]
  );

  let adminId: string;
  if (existingAdmin) {
    adminId = existingAdmin.id;
    console.log('Admin already exists:', adminEmail);
  } else {
    const hash = await hashPassword('Admin1234!');
    const { rows: [newAdmin] } = await q(
      `INSERT INTO users (id, email, password_hash, full_name, role, kyc_status, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, 'admin', 'approved', true)
       RETURNING id`,
      [adminEmail, hash, 'Thabo Khumalo']
    );
    adminId = newAdmin.id;
    console.log('Created admin:', adminEmail);
  }

  /* ── Properties ─────────────────────────────────────────────── */
  const properties = [
    {
      title:            '14 Fern Close, Fourways',
      property_type:    'residential',
      address:          '14 Fern Close, Fourways',
      province:         'Gauteng',
      purchase_price:   4_200_000,
      target_raise:     3_800_000,
      minimum_pledge:   1_000,
      funded_amount:    2_736_000,
      gross_monthly_rent:          34_000,
      operating_expenses_monthly:  5_200,
      net_monthly_rent:            28_800,
      projected_yield_pct:         9.2,
      status:           'open',
      funding_close_date: '2025-09-30',
    },
    {
      title:            'Shop 4, Kyalami Corner',
      property_type:    'commercial',
      address:          'Kyalami Corner Shopping Centre, Midrand',
      province:         'Gauteng',
      purchase_price:   6_000_000,
      target_raise:     5_000_000,
      minimum_pledge:   2_500,
      funded_amount:    1_900_000,
      gross_monthly_rent:          58_000,
      operating_expenses_monthly:  10_500,
      net_monthly_rent:            47_500,
      projected_yield_pct:         10.8,
      status:           'open',
      funding_close_date: '2025-10-31',
    },
    {
      title:            'Unit 7, Sandton Gardens',
      property_type:    'residential',
      address:          'Unit 7 Sandton Gardens, Sandton',
      province:         'Gauteng',
      purchase_price:   3_500_000,
      target_raise:     3_100_000,
      minimum_pledge:   1_500,
      funded_amount:    3_100_000,
      gross_monthly_rent:          29_000,
      operating_expenses_monthly:  4_500,
      net_monthly_rent:            24_500,
      projected_yield_pct:         8.7,
      status:           'funded',
      funding_close_date: '2025-03-31',
    },
  ];

  const propIds: string[] = [];
  for (const p of properties) {
    const { rows: [existing] } = await q(
      'SELECT id FROM properties WHERE title = $1', [p.title]
    );
    if (existing) {
      propIds.push(existing.id);
      console.log('Property already exists:', p.title);
    } else {
      const { rows: [created] } = await q(
        `INSERT INTO properties
           (id, created_by, title, property_type, address, province,
            purchase_price, target_raise, minimum_pledge, funded_amount,
            gross_monthly_rent, operating_expenses_monthly, net_monthly_rent,
            projected_yield_pct, status, funding_close_date)
         VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING id`,
        [
          adminId, p.title, p.property_type, p.address, p.province,
          p.purchase_price, p.target_raise, p.minimum_pledge, p.funded_amount,
          p.gross_monthly_rent, p.operating_expenses_monthly, p.net_monthly_rent,
          p.projected_yield_pct, p.status, p.funding_close_date,
        ]
      );
      propIds.push(created.id);
      console.log('Created property:', p.title);
    }
  }

  /* ── Investors ───────────────────────────────────────────────── */
  const investors = [
    {
      email: 'sipho.khumalo@gmail.com', full_name: 'Sipho Khumalo', phone: '+27821112233',
      profile: { id_number: '8501015009087', id_type: 'id_book', tax_number: '1234567890',
        bank_name: 'FNB', bank_account_number: '62012345678', bank_branch_code: '250655',
        address_line1: '12 Acacia Street', city: 'Sandton', province: 'Gauteng', postal_code: '2196' },
      pledges: [{ idx: 0, amount: 200_000 }, { idx: 2, amount: 150_000 }],
    },
    {
      email: 'precious.nkosi@outlook.com', full_name: 'Precious Nkosi', phone: '+27734567890',
      profile: { id_number: '9203280048085', id_type: 'id_book', tax_number: '9876543210',
        bank_name: 'Standard Bank', bank_account_number: '001234567', bank_branch_code: '051001',
        address_line1: '5 Morningside Drive', city: 'Durban', province: 'KwaZulu-Natal', postal_code: '4001' },
      pledges: [{ idx: 0, amount: 150_000 }],
    },
    {
      email: 'andile.molefe@webmail.co.za', full_name: 'Andile Molefe', phone: '+27617890123',
      profile: { id_number: '7712195001083', id_type: 'id_book', tax_number: '1122334455',
        bank_name: 'Nedbank', bank_account_number: '1234098765', bank_branch_code: '198765',
        address_line1: '88 Jan Smuts Avenue', city: 'Johannesburg', province: 'Gauteng', postal_code: '2193' },
      pledges: [{ idx: 1, amount: 150_000 }, { idx: 2, amount: 150_000 }],
    },
  ];

  for (const inv of investors) {
    const { rows: [existing] } = await q('SELECT id FROM users WHERE email = $1', [inv.email]);
    if (existing) {
      console.log('Investor already exists:', inv.email);
      continue;
    }
    const hash = await hashPassword('Investor1234!');
    const { rows: [user] } = await q(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, kyc_status, kyc_verified_at, is_active)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,'investor','approved',NOW(),true) RETURNING id`,
      [inv.email, hash, inv.full_name, inv.phone]
    );
    await q(
      `INSERT INTO investor_profiles
         (id, user_id, id_number, id_type, tax_number, bank_name, bank_account_number,
          bank_branch_code, address_line1, city, province, postal_code)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        user.id, inv.profile.id_number, inv.profile.id_type, inv.profile.tax_number,
        inv.profile.bank_name, inv.profile.bank_account_number, inv.profile.bank_branch_code,
        inv.profile.address_line1, inv.profile.city, inv.profile.province, inv.profile.postal_code,
      ]
    );
    for (const pl of inv.pledges) {
      await q(
        `INSERT INTO pledges (id, user_id, property_id, amount, status, confirmed_at)
         VALUES (gen_random_uuid(),$1,$2,$3,'confirmed',NOW())`,
        [user.id, propIds[pl.idx], pl.amount]
      );
    }
    console.log('Created investor:', inv.full_name, inv.email);
  }

  console.log('\n✅  Seed complete.');
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
