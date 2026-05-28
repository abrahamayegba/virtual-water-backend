import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companyId = "cmpmqnn1w0000chu0i1gtt9co";

const practices = [
  { practiceNumber: "8", practiceName: "Livingston" },
  { practiceNumber: "10", practiceName: "Bolton Horwich" },
  { practiceNumber: "21", practiceName: "Peterborough" },
  { practiceNumber: "25", practiceName: "Huddersfield" },
  { practiceNumber: "26", practiceName: "Fareham Park Gate" },
  { practiceNumber: "34", practiceName: "Exeter" },
  { practiceNumber: "35", practiceName: "Chelmsford" },
  { practiceNumber: "37", practiceName: "New Malden" },
  { practiceNumber: "41", practiceName: "Bournemouth" },
  { practiceNumber: "63", practiceName: "Kings Lynn" },
  { practiceNumber: "65", practiceName: "Christchurch" },
  { practiceNumber: "70", practiceName: "Redditch Trescott Road" },
  { practiceNumber: "73", practiceName: "Basildon" },
  { practiceNumber: "78", practiceName: "Leicester Fosse Park" },
  { practiceNumber: "79", practiceName: "Stratford" },
  { practiceNumber: "83", practiceName: "Slough" },
  { practiceNumber: "96", practiceName: "Kirkcaldy" },
  { practiceNumber: "97", practiceName: "Ayr" },
  { practiceNumber: "101", practiceName: "Bradford Idle (Eccleshill)" },
  { practiceNumber: "102", practiceName: "Bramley" },
  { practiceNumber: "105", practiceName: "Halifax" },
  { practiceNumber: "117", practiceName: "Stafford" },
  { practiceNumber: "119", practiceName: "Hull" },
  { practiceNumber: "125", practiceName: "Doncaster Wheatley" },
  { practiceNumber: "127", practiceName: "Gamston" },
  { practiceNumber: "135", practiceName: "Mapperley" },
  { practiceNumber: "136", practiceName: "Newport" },
  { practiceNumber: "138", practiceName: "South Shields" },
  { practiceNumber: "140", practiceName: "Stockton" },
  { practiceNumber: "142", practiceName: "Prenton" },
  { practiceNumber: "143", practiceName: "Dudley" },
  { practiceNumber: "149", practiceName: "Bolton" },
  { practiceNumber: "154", practiceName: "Shelfield" },
  { practiceNumber: "160", practiceName: "Bitterne" },
  { practiceNumber: "162", practiceName: "Paisley" },
  { practiceNumber: "167", practiceName: "Rayleigh" },
  { practiceNumber: "184", practiceName: "Leigh-on-Sea" },
  { practiceNumber: "185", practiceName: "Rugby" },
  { practiceNumber: "186", practiceName: "Portsmouth" },
  { practiceNumber: "192", practiceName: "Kidderminster" },
  { practiceNumber: "194", practiceName: "Cardiff Llanrumney" },
  { practiceNumber: "197", practiceName: "Grantham" },
  { practiceNumber: "198", practiceName: "Worksop" },
  { practiceNumber: "200", practiceName: "Walton Vale" },
  { practiceNumber: "201", practiceName: "Beverley" },
  { practiceNumber: "202", practiceName: "Castleford" },
  { practiceNumber: "204", practiceName: "Washington" },
  { practiceNumber: "207", practiceName: "York" },
  { practiceNumber: "211", practiceName: "Bishop Auckland" },
  { practiceNumber: "214", practiceName: "Speke" },
];

const usersData = [
  {
    name: "Kayleigh Little",
    email: "kayleigh.little@vets4pets.com",
    practiceNumber: "8",
    role: "Practice Manager",
  },
  {
    name: "Jill Baxter",
    email: "jill.baxter@vetsforpets.com",
    practiceNumber: "10",
    role: "JVP / Registered Veterinary Nurse",
  },
//   {
//     name: "Joseph Wheeldon",
//     email: "joseph.wheeldon@vetsforpets.com",
//     practiceNumber: "21",
//     role: "JVP/Registered Veterinary Nurse",
//   },
//   {
//     name: "Tracey Lowe",
//     email: "tracey.lowe@vetsforpets.com",
//     practiceNumber: "25",
//     role: "Practice Manager",
//   },
//   {
//     name: "Sarah Hanlon",
//     email: "Sarah.0025@vetsforpets.com",
//     practiceNumber: "25",
//     role: "Registered Veterinary Nurse",
//   },
//   {
//     name: "Michelle Taylor",
//     email: "michelle.taylor26@vetsforpets.com",
//     practiceNumber: "26",
//     role: "Practice Manager",
//   },
//   {
//     name: "Cerise Gant",
//     email: "cerise.gant@vetsforpets.com",
//     practiceNumber: "34",
//     role: "Practice Manager",
//   },
//   {
//     name: "Philippa Rowden",
//     email: "Philippa.rowden@vetsforpets.com",
//     practiceNumber: "35",
//     role: "Practice Manager",
//   },
//   {
//     name: "Joolz Pincham",
//     email: "joolz.pincham@vetsforpets.com",
//     practiceNumber: "37",
//     role: "JVP / Registered Veterinary Nurse",
//   },
//   {
//     name: "Leanne Mowlem",
//     email: "leanne.mowlem@vetsforpets.com",
//     practiceNumber: "41",
//     role: "JVP/Practice Manager",
//   },
//   {
//     name: "Lena Garnett",
//     email: "lenagarnett@outlook.com",
//     practiceNumber: "41",
//     role: "Unknown",
//   },
//   {
//     name: "Alison Coombes",
//     email: "alison.coombes@vetsforpets.com",
//     practiceNumber: "63",
//     role: "Practice Manager / Head Registered Veterinary Nurse",
//   },
//   {
//     name: "Kirsty Godsell",
//     email: "Kirsty.godsell@vets4pets.com",
//     practiceNumber: "65",
//     role: "Practice Manager",
//   },
//   {
//     name: "Sarah Nash",
//     email: "Sarah.nash@vets4pets.com",
//     practiceNumber: "65",
//     role: "Senior Registered Veterinary Nurse",
//   },
//   {
//     name: "Gemma Morgan",
//     email: "gemma.morgan@companioncare.co.uk",
//     practiceNumber: "70",
//     role: "Head Registered Veterinary Nurse",
//   },
//   {
//     name: "Stephanie Bassett",
//     email: "stephanie.bassett@vetsforpets.com",
//     practiceNumber: "73",
//     role: "Head of Client Services",
//   },
//   {
//     name: "Karen Carter",
//     email: "karen.carter@vetsforpets.com",
//     practiceNumber: "73",
//     role: "Head of Finance",
//   },
//   {
//     name: "Liz Mason",
//     email: "Liz.mason@vetsforpets.com",
//     practiceNumber: "78",
//     role: "Practice Manager",
//   },
//   {
//     name: "Molly Hawker",
//     email: "Stratford@vetsforpets.com",
//     practiceNumber: "79",
//     role: "Student Veterinary Nurse",
//   },
//   {
//     name: "Amy Smith",
//     email: "Amy.Smith@vets4pets.com",
//     practiceNumber: "83",
//     role: "Practice Manager",
//   },
//   {
//     name: "Dawn Mackie",
//     email: "Dawn.Mackie@vetsforpets.com",
//     practiceNumber: "96",
//     role: "JVP / Head Registered Veterinary Nurse",
//   },
//   {
//     name: "Sandie Hail",
//     email: "Sandie.Hail@vetsforpets.com",
//     practiceNumber: "96",
//     role: "JVP / Practice Manager",
//   },
//   {
//     name: "Zy Ormerod",
//     email: "zy.ormerod@vetsforpets.com",
//     practiceNumber: "97",
//     role: "Registered Veterinary Nurse",
//   },
//   {
//     name: "Tracy Watson",
//     email: "tracy.watson@vets4pets.com",
//     practiceNumber: "101",
//     role: "Practice Manager",
//   },
//   {
//     name: "Isobel Grist",
//     email: "isobel.grist@vetsforpets.com",
//     practiceNumber: "101",
//     role: "Veterinary Care Assistant",
//   },
//   {
//     name: "Sheli Dobbie",
//     email: "sheli.dobbie@vetsforpets.com",
//     practiceNumber: "102",
//     role: "Practice Manager",
//   },
//   {
//     name: "Georgina Threapleton",
//     email: "georgina.threapleton@vetsforpets.com",
//     practiceNumber: "102",
//     role: "Pet Health Advisor",
//   },
//   {
//     name: "Julie Cole",
//     email: "julie.cole@vetsforpets.com",
//     practiceNumber: "105",
//     role: "Senior Client Care Advisor",
//   },
//   {
//     name: "Emma Hunter",
//     email: "Emma.hunter@vetsforpets.com",
//     practiceNumber: "117",
//     role: "Practice Manager",
//   },
//   {
//     name: "Beth Thompson",
//     email: "bethanie.thompson@vets4pets.com",
//     practiceNumber: "119",
//     role: "Practice Manager",
//   },
//   {
//     name: "Deborah Brooks",
//     email: "deborah.brooks@vetsforpets.com",
//     practiceNumber: "119",
//     role: "Head Receptionist",
//   },
//   {
//     name: "Maria-Claudia Candeliere",
//     email: "Maria-Claudia.Candeliere@vetsforpets.com",
//     practiceNumber: "125",
//     role: "JVP / Veterinary Surgeon",
//   },
//   {
//     name: "Louise Stubbs",
//     email: "louise.stubbs@vets4pets.com",
//     practiceNumber: "127",
//     role: "JVP / Registered Veterinary Nurse",
//   },
//   {
//     name: "Kirsty Stephens",
//     email: "kirstybooton@hotmail.com",
//     practiceNumber: "127",
//     role: "Veterinary Care Assistant",
//   },
//   {
//     name: "James Gillham",
//     email: "james.gillham@vetsforpets.com",
//     practiceNumber: "135",
//     role: "Practice Manager",
//   },
//   {
//     name: "Michelle Lawrence",
//     email: "michelle.lawrence@vets4pets.com",
//     practiceNumber: "136",
//     role: "Head Registered Veterinary Nurse / Practice Manager",
//   },
//   {
//     name: "Cath McCarthy",
//     email: "cath.mccarthy@vets4pets.com",
//     practiceNumber: "136",
//     role: "JVP / Veterinary Surgeon",
//   },
//   {
//     name: "Kay Iddon",
//     email: "kay.iddon@vetsforpets.com",
//     practiceNumber: "138",
//     role: "JVP/ Practice Manager",
//   },
//   {
//     name: "Jane Stewart",
//     email: "jane.stewart@vetsforpets.com",
//     practiceNumber: "140",
//     role: "Practice Manager",
//   },
//   {
//     name: "Paul Danby",
//     email: "paul.danby@vetsforpets.com",
//     practiceNumber: "140",
//     role: "Receptionist",
//   },
//   {
//     name: "Deborah Myers",
//     email: "debbie.morgan@vets4pets.com",
//     practiceNumber: "142",
//     role: "Practice Manager",
//   },
//   {
//     name: "Charlotte Shaw",
//     email: "charlotte.shaw@vetsforpets.com",
//     practiceNumber: "142",
//     role: "Registered Veterinary Nurse",
//   },
//   {
//     name: "Karen Morton",
//     email: "karen.morton@vetsforpets.com",
//     practiceNumber: "143",
//     role: "Head Registered Veterinary Nurse",
//   },
//   {
//     name: "Louise Morris",
//     email: "louise.morris@vetsforpets.com",
//     practiceNumber: "149",
//     role: "JVP / Practice Manager",
//   },
//   {
//     name: "Karla Maginn",
//     email: "karla.maginn@vetsforpets.com",
//     practiceNumber: "149",
//     role: "JVP / Registered Veterinary Nurse",
//   },
//   {
//     name: "Andy Potter",
//     email: "andy.potter@vets4pets.com",
//     practiceNumber: "154",
//     role: "JVP / Practice Manager",
//   },
//   {
//     name: "Mark Vince",
//     email: "mark.vince@vets4pets.com",
//     practiceNumber: "160",
//     role: "Registered Veterinary Nurse",
//   },
//   {
//     name: "Sophie Luke",
//     email: "sophie.luke@vets4pets.com",
//     practiceNumber: "162",
//     role: "Practice Manager",
//   },
//   {
//     name: "Katrina Chopper",
//     email: "Katrina.chopper@vets4pets.com",
//     practiceNumber: "162",
//     role: "Veterinary Surgeon",
//   },
//   {
//     name: "Stacey Valente",
//     email: "stacey.valente@vets4pets.com",
//     practiceNumber: "167",
//     role: "Practice Manager",
//   },
];

async function main() {
  console.log("🌱 Seeding Practices (first batch)...");
  for (const p of practices) {
    await prisma.practice.upsert({
      where: {
        practiceNumber_companyId: {
          practiceNumber: p.practiceNumber,
          companyId,
        },
      },
      update: { practiceName: p.practiceName },
      create: {
        practiceNumber: p.practiceNumber,
        practiceName: p.practiceName,
        companyId,
      },
    });
  }

  console.log("👤 Seeding Users (1-50)...");
  for (const u of usersData) {
    const practice = await prisma.practice.findUnique({
      where: {
        practiceNumber_companyId: {
          practiceNumber: u.practiceNumber,
          companyId,
        },
      },
    });

    if (!practice) {
      console.warn(`⚠️ Practice not found: ${u.practiceNumber} - ${u.name}`);
      continue;
    }

    const isPracticeManager =
      u.role.toLowerCase().includes("practice manager") ||
      u.role.toLowerCase().includes("head of");

    const roleId = isPracticeManager
      ? "cmeuae0qi0000chm032g9wp9f"
      : "cmeuae0qo0002chm0s7ojs8fi";

    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, practiceId: practice.id, roleId },
      create: {
        name: u.name,
        email: u.email,
        companyId,
        practiceId: practice.id,
        roleId,
      },
    });

    console.log(`✅ Seeded: ${u.name} (${u.practiceNumber})`);
  }

  console.log("🎉 First 50 users seeded successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
