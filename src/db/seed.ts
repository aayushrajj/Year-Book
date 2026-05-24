import "dotenv/config";
import { db, schema } from "./index";

// BIT Mesra branches as of v1 launch. Short codes are the conventional
// abbreviations students use. Add more here as needed; not exhaustive.
const BIT_MESRA_BRANCHES = [
  { short: "CSE", name: "Computer Science & Engineering" },
  { short: "ECE", name: "Electronics & Communication Engineering" },
  { short: "EEE", name: "Electrical & Electronics Engineering" },
  { short: "ME", name: "Mechanical Engineering" },
  { short: "CE", name: "Civil Engineering" },
  { short: "CHE", name: "Chemical Engineering" },
  { short: "PE", name: "Production Engineering" },
  { short: "MME", name: "Metallurgy & Materials Engineering" },
  { short: "IT", name: "Information Technology" },
  { short: "BT", name: "Biotechnology" },
  { short: "ARCH", name: "Architecture" },
  { short: "PHARM", name: "Pharmacy" },
  { short: "MSC-PHY", name: "M.Sc. Physics" },
  { short: "MSC-CHEM", name: "M.Sc. Chemistry" },
  { short: "MSC-MATH", name: "M.Sc. Mathematics" },
  { short: "MCA", name: "MCA" },
  { short: "MBA", name: "MBA" },
];

async function main() {
  console.log("Seeding…");

  // Upsert BIT Mesra
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

  for (const b of BIT_MESRA_BRANCHES) {
    await db
      .insert(schema.branches)
      .values({
        collegeId: college.id,
        name: b.name,
        shortName: b.short,
      })
      .onConflictDoNothing({
        target: [schema.branches.collegeId, schema.branches.shortName],
      });
  }

  console.log(`  branches: ${BIT_MESRA_BRANCHES.length} seeded`);
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
