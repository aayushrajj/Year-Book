import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, schema } from "./index";

type ProgramSeed = {
  level: "UG" | "PG";
  degree: string;
  name: string;
  shortName: string;
  specialization?: string;
  sortOrder: number;
  isActive?: boolean;
};

// Order is intentional — it's what appears in the dropdown (within UG / PG groups).
// Sources: https://bitmesra.ac.in/course/ug/1 and https://bitmesra.ac.in/course/pg/1
// Plus older programs (kept with is_active=false so alumni can still find them).
const BIT_MESRA_PROGRAMS: ProgramSeed[] = [
  // ----- Undergraduate -------------------------------------------------
  { level: "UG", degree: "B.Arch",  shortName: "BARCH",      name: "Architecture and Planning",                          sortOrder: 1 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-CSE",  name: "Computer Science and Engineering",                  sortOrder: 10 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-AIML", name: "Artificial Intelligence and Machine Learning",      sortOrder: 11 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-ECE",  name: "Electronics and Communication Engineering",         sortOrder: 12 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-EEE",  name: "Electrical and Electronics Engineering",            sortOrder: 13 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-ME",   name: "Mechanical Engineering",                            sortOrder: 14 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-CE",   name: "Civil Engineering",                                 sortOrder: 15 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-CHE",  name: "Chemical Engineering",                              sortOrder: 16 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-BT",   name: "Biotechnology",                                     sortOrder: 17 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-FET",  name: "Food Engineering and Technology",                   sortOrder: 18 },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-PIE",  name: "Production and Industrial Engineering",             sortOrder: 19 },
  { level: "UG", degree: "B.Pharm", shortName: "BPHARM",     name: "Pharmaceutical Sciences & Technology",              sortOrder: 25 },
  { level: "UG", degree: "B.Sc",    shortName: "BSC-CS",     name: "Computer Science",                                  sortOrder: 30 },
  { level: "UG", degree: "B.Sc",    shortName: "BSC-AIML",   name: "Artificial Intelligence and Machine Learning",      sortOrder: 31 },
  { level: "UG", degree: "B.Sc",    shortName: "BSC-AIDS",   name: "Artificial Intelligence and Data Science",          sortOrder: 32 },
  { level: "UG", degree: "B.Sc",    shortName: "BSC-ANIM",   name: "Animation and Multimedia",                          sortOrder: 33 },
  { level: "UG", degree: "B.Sc",    shortName: "BSC-VC",     name: "Visual Communication",                              sortOrder: 34 },
  { level: "UG", degree: "B.Sc",    shortName: "BSC-CHEM",   name: "Chemistry",                                         sortOrder: 35 },
  { level: "UG", degree: "BBA",     shortName: "BBA",        name: "Business Administration",                           sortOrder: 40 },
  { level: "UG", degree: "BCA",     shortName: "BCA",        name: "Computer Applications",                             sortOrder: 41 },
  { level: "UG", degree: "BHM",     shortName: "BHM",        name: "Hotel Management",                                  sortOrder: 42 },
  { level: "UG", degree: "BHMCT",   shortName: "BHMCT",      name: "Hotel Management and Catering Technology",          sortOrder: 43 },
  { level: "UG", degree: "BMLT",    shortName: "BMLT",       name: "Medical Lab Technology",                            sortOrder: 44 },

  // Older UG programs — kept for alumni (BIT Mesra discontinued / renamed)
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-IT",   name: "Information Technology",                            sortOrder: 190, isActive: false },
  { level: "UG", degree: "B.Tech",  shortName: "BTECH-MME",  name: "Metallurgy and Materials Engineering",              sortOrder: 191, isActive: false },

  // ----- Postgraduate --------------------------------------------------
  // Integrated programs first (still PG-level)
  { level: "PG", degree: "Integrated M.Sc", shortName: "IMSC-MATHCOMP", name: "Mathematics and Computing",                          sortOrder: 1 },
  { level: "PG", degree: "Integrated M.Sc", shortName: "IMSC-PHY",      name: "Physics",                                            sortOrder: 2 },
  { level: "PG", degree: "Integrated M.Sc", shortName: "IMSC-CHEM",     name: "Chemistry",                                          sortOrder: 3 },
  { level: "PG", degree: "Integrated M.Sc", shortName: "IMSC-QEDS",     name: "Quantitative Economics and Data Science",            sortOrder: 4 },
  { level: "PG", degree: "Integrated M.Sc", shortName: "IMSC-FOOD",     name: "Food Technology",                                    sortOrder: 5 },
  { level: "PG", degree: "Integrated MBA",  shortName: "IMBA",          name: "Business Administration",                            sortOrder: 6 },

  // M.Tech (alphabetical-ish, with Mechanical specializations grouped)
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-CSE",         name: "Computer Science and Engineering",         sortOrder: 10 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-CE",          name: "Civil Engineering",                        sortOrder: 11 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-BT",          name: "Biotechnology",                            sortOrder: 12 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-AE",          name: "Aerospace Engineering",                    sortOrder: 13 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-EE",          name: "Electrical Engineering",                   sortOrder: 14 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-EVT",         name: "Electric Vehicle Technology",              sortOrder: 15 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-IC",          name: "Instrumentation & Control",                sortOrder: 16 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-MWE",         name: "Microwave Engineering",                    sortOrder: 17 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-WC",          name: "Wireless Communication",                   sortOrder: 18 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-RS",          name: "Remote Sensing",                           sortOrder: 19 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-PIE",         name: "Production and Industrial Engineering",    sortOrder: 20 },
  // Mechanical Engineering — 4 specializations (kept as distinct rows; group at the UI level)
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-ME-DOME",     name: "Mechanical Engineering", specialization: "Design of Mechanical Equipments", sortOrder: 21 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-ME-HPE",      name: "Mechanical Engineering", specialization: "Heat Power Engineering",          sortOrder: 22 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-ME-ET",       name: "Mechanical Engineering", specialization: "Energy Technology",               sortOrder: 23 },
  { level: "PG", degree: "M.Tech",  shortName: "MTECH-ME-CAAD",     name: "Mechanical Engineering", specialization: "Computer Aided Analysis & Design",sortOrder: 24 },

  // M.Sc
  { level: "PG", degree: "M.Sc",    shortName: "MSC-BT",            name: "Biotechnology",                            sortOrder: 30 },
  { level: "PG", degree: "M.Sc",    shortName: "MSC-CHEM",          name: "Chemistry",                                sortOrder: 31 },
  { level: "PG", degree: "M.Sc",    shortName: "MSC-PHY",           name: "Physics",                                  sortOrder: 32 },
  { level: "PG", degree: "M.Sc",    shortName: "MSC-MATH",          name: "Mathematics",                              sortOrder: 33 },
  { level: "PG", degree: "M.Sc",    shortName: "MSC-GEO",           name: "Geoinformatics",                           sortOrder: 34 },

  // M.Pharm
  { level: "PG", degree: "M.Pharm", shortName: "MPHARM-PCEUTICS",   name: "Pharmaceutics",                            sortOrder: 40 },
  { level: "PG", degree: "M.Pharm", shortName: "MPHARM-PCOL",       name: "Pharmacology",                             sortOrder: 41 },
  { level: "PG", degree: "M.Pharm", shortName: "MPHARM-PQA",        name: "Pharmaceutical Quality Assurance",         sortOrder: 42 },
  { level: "PG", degree: "M.Pharm", shortName: "MPHARM-PCHEM",      name: "Pharmaceutical Chemistry",                 sortOrder: 43 },
  { level: "PG", degree: "M.Pharm", shortName: "MPHARM-PCOG",       name: "Pharmacognosy",                            sortOrder: 44 },

  // Other PG
  { level: "PG", degree: "MCA",     shortName: "MCA",               name: "Master of Computer Applications",          sortOrder: 50 },
  { level: "PG", degree: "MUP",     shortName: "MUP",               name: "Master in Urban Planning",                 sortOrder: 51 },
  { level: "PG", degree: "MBA",     shortName: "MBA",               name: "Master of Business Administration",        sortOrder: 52 },
  { level: "PG", degree: "M.A.",    shortName: "MA-LA",             name: "Liberal Arts",                             sortOrder: 53 },
];

async function main() {
  console.log("Seeding…");

  const [college] = await db
    .insert(schema.colleges)
    .values({
      name: "Birla Institute of Technology, Mesra",
      slug: "bit-mesra",
      emailDomain: "bitmesra.ac.in",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.colleges.slug,
      set: { isActive: true, name: "Birla Institute of Technology, Mesra" },
    })
    .returning();

  if (!college) throw new Error("Failed to upsert BIT Mesra");
  console.log(`  college: ${college.name} (${college.id})`);

  let inserted = 0;
  let updated = 0;
  for (const p of BIT_MESRA_PROGRAMS) {
    const res = await db
      .insert(schema.branches)
      .values({
        collegeId: college.id,
        level: p.level,
        degree: p.degree,
        name: p.name,
        shortName: p.shortName,
        specialization: p.specialization ?? null,
        sortOrder: p.sortOrder,
        isActive: p.isActive ?? true,
      })
      .onConflictDoUpdate({
        target: [schema.branches.collegeId, schema.branches.shortName],
        set: {
          level: p.level,
          degree: p.degree,
          name: p.name,
          specialization: p.specialization ?? null,
          sortOrder: p.sortOrder,
          isActive: p.isActive ?? true,
        },
      })
      .returning({ id: schema.branches.id });
    if (res[0]) (p.isActive === false ? updated++ : inserted++);
  }
  // Reset sort_order on legacy entries (e.g. the original "PE" merged into BTECH-PIE)
  await db.execute(sql`
    delete from public.branches
    where college_id = ${college.id}
      and short_name in ('PE', 'ME', 'CE', 'CHE', 'EEE', 'ECE', 'CSE', 'IT', 'BT', 'MME', 'ARCH', 'PHARM',
                         'MSC-PHY', 'MSC-CHEM', 'MSC-MATH', 'MCA', 'MBA')
      and short_name not in (${sql.join(
        BIT_MESRA_PROGRAMS.map((p) => sql`${p.shortName}`),
        sql`, `,
      )})
  `);

  console.log(`  programs: ${BIT_MESRA_PROGRAMS.length} upserted`);
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
