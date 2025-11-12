import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const quizId = "cmhvzyfll000tchvwcborc1vp";

  // 2. Seed Questions and Options
  const questionsData = [
    {
      question: "Hot tubs are a high-risk environment for Legionella growth.",
      options: [
        { option: "True", isCorrect: true },
        { option: "False", isCorrect: false },
      ],
    },
    {
      question:
        "Only companies and organisations in specific sectors are required to undertake Legionella risk assessments.",
      options: [
        { option: "True", isCorrect: false },
        { option: "False", isCorrect: true },
      ],
    },
    {
      question: "Water Chlorination is a process?",
      options: [
        {
          option:
            "That involves treating water with sodium hypochlorite to kill off harmful microbes, such as Legionella bacteria.",
          isCorrect: true,
        },
        {
          option: "That occurs when Legionella bacteria build-up in a system.",
          isCorrect: false,
        },
        {
          option: "That causes damage to tanks and water pipes.",
          isCorrect: false,
        },
      ],
    },
    {
      question:
        "Anyone in charge of a premises can be held responsible for not undertaking a Legionella Risk Assessment.",
      options: [
        { option: "True", isCorrect: true },
        { option: "False", isCorrect: false },
      ],
    },
    {
      question:
        "What water temperature is most likely to result in the growth of Legionella bacteria?",
      options: [
        { option: "A. 85-95 C", isCorrect: false },
        { option: "B. 20-45 C", isCorrect: true },
        { option: "C. 60-85 C", isCorrect: false },
        { option: "D. 0-20 C", isCorrect: false },
      ],
    },
    {
      question:
        "Which body is responsible for investigating outbreaks of Legionnaire's disease and bringing prosecutions where shortcomings in risk management are identified?",
      options: [
        { option: "The HSE - (Health and Safety Executive)", isCorrect: true },
        {
          option:
            "CIDOC (The Council for Infectious Diseases and Outbreak Control)",
          isCorrect: false,
        },
        { option: "The Ministry of Justice", isCorrect: false },
        { option: "The Police", isCorrect: false },
      ],
    },
    {
      question: "How did Legionnaires' disease get its name?",
      options: [
        {
          option:
            "Because an outbreak of Legionnaires' disease can usually be traced to a group of around 5,000 Legionella bacteria — a number typical of the amount of soldiers in a traditional Roman Legion.",
          isCorrect: false,
        },
        {
          option:
            "Because Legionella, the name of the bacteria responsible for causing Legionnaires' Disease, is an approximate Latin translation of `waterborne illness.'",
          isCorrect: false,
        },
        {
          option:
            "Because the first identified outbreak occurred at a convention of the American Legion.",
          isCorrect: true,
        },
      ],
    },
    {
      question:
        "What is the full name of Legionella, the bacteria which causes Legionnaires’ Disease?",
      options: [
        { option: "Legionella Phelleumophilia", isCorrect: false },
        { option: "Legionella Pneumophila", isCorrect: true },
        { option: "Legionella Symphoneum", isCorrect: false },
        { option: "Legionella Thophilia", isCorrect: false },
      ],
    },
    {
      question:
        "Records of Legionella monitoring inspections and water treatment should be kept for?",
      options: [
        { option: "5 years", isCorrect: true },
        { option: "6 Months", isCorrect: false },
        { option: "3 Years", isCorrect: false },
        { option: "1 Year", isCorrect: false },
      ],
    },
    {
      question:
        "What city saw the first identified outbreak of Legionnaires' disease?",
      options: [
        { option: "Philadelphia", isCorrect: true },
        { option: "Toronto", isCorrect: false },
        { option: "Manchester", isCorrect: false },
        { option: "Boston", isCorrect: false },
      ],
    },
  ];

  for (const q of questionsData) {
    // Create question with auto-generated ID
    const question = await prisma.question.create({
      data: {
        question: q.question,
        quizId: quizId,
      },
    });

    for (const opt of q.options) {
      await prisma.questionOption.create({
        data: {
          ...opt,
          questionId: question.id,
        },
      });
    }
  }

  console.log("Quiz seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
