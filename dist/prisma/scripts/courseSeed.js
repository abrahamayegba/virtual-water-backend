"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Course categories
    const categories = await Promise.all([
        prisma.courseCategory.upsert({
            where: { categoryName: "Water Safety" },
            update: {},
            create: { categoryName: "Water Safety" },
        }),
        prisma.courseCategory.upsert({
            where: { categoryName: "Electrical Safety" },
            update: {},
            create: { categoryName: "Electrical Safety" },
        }),
        prisma.courseCategory.upsert({
            where: { categoryName: "First Aid & Fire Safety" },
            update: {},
            create: { categoryName: "First Aid & Fire Safety" },
        }),
    ]);
    // Lesson types
    const lessonTypes = await Promise.all([
        prisma.lessonType.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1, type: "PDF" },
        }),
        prisma.lessonType.upsert({
            where: { id: 3 },
            update: {},
            create: { id: 3, type: "Video" },
        }),
        prisma.lessonType.upsert({
            where: { id: 4 },
            update: {},
            create: { id: 4, type: "PPT" },
        }),
    ]);
    const coursesData = [
        {
            title: "Water Hygiene Training",
            description: "Learn proper water hygiene practices for safe handling and distribution.",
            categoryId: categories[0].id,
            duration: 180,
            CourseObjectives: {
                create: [
                    { objective: "Understand water contamination risks" },
                    { objective: "Learn proper water handling procedures" },
                    { objective: "Implement water safety measures in workplace" },
                ],
            },
            Lessons: {
                create: [
                    {
                        title: "Introduction to Water Hygiene",
                        content: "Basics of water hygiene and contamination sources.",
                        typeId: lessonTypes[0].id,
                        duration: 45,
                    },
                    {
                        title: "Water Safety Video Guide",
                        content: "Visual guide to water safety procedures.",
                        typeId: lessonTypes[1].id,
                        duration: 30,
                    },
                    {
                        title: "Water Hygiene PPT Overview",
                        content: "Summary of key points in water hygiene.",
                        typeId: lessonTypes[2].id,
                        duration: 25,
                    },
                ],
            },
            Quizzes: {
                create: [
                    createQuiz("Water Hygiene Basics Quiz", 80, [
                        {
                            question: "What is the main cause of water contamination?",
                            correct: 0,
                            options: [
                                "Improper handling",
                                "Boiling water",
                                "Using clean containers",
                                "Filtering water",
                            ],
                        },
                        {
                            question: "Which is safe water storage practice?",
                            correct: 0,
                            options: [
                                "Covered containers",
                                "Open buckets",
                                "Direct sunlight",
                                "Plastic bottles on floor",
                            ],
                        },
                        {
                            question: "Water hygiene prevents which disease?",
                            correct: 0,
                            options: ["Cholera", "Influenza", "Asthma", "Diabetes"],
                        },
                        {
                            question: "Best way to treat contaminated water?",
                            correct: 0,
                            options: [
                                "Boiling",
                                "Adding sugar",
                                "Exposing to air",
                                "Leaving it in sunlight for 5 mins",
                            ],
                        },
                        {
                            question: "Which equipment ensures safe water handling?",
                            correct: 0,
                            options: [
                                "Clean gloves",
                                "Bare hands",
                                "Dirty cloths",
                                "Plastic cups on floor",
                            ],
                        },
                    ]),
                    createQuiz("Water Hygiene Advanced Quiz", 80, [
                        {
                            question: "Cross-contamination occurs when?",
                            correct: 0,
                            options: [
                                "Dirty hands touch clean water",
                                "Water is boiled",
                                "Filtered water is used",
                                "Water is stored in sealed container",
                            ],
                        },
                        {
                            question: "Which practice is unsafe?",
                            correct: 0,
                            options: [
                                "Open storage of water",
                                "Cleaning containers",
                                "Using clean scoops",
                                "Boiling water before use",
                            ],
                        },
                        {
                            question: "Water testing ensures?",
                            correct: 0,
                            options: [
                                "It is safe to drink",
                                "Taste improvement",
                                "Faster boiling",
                                "Color enhancement",
                            ],
                        },
                        {
                            question: "Which is a chemical water contaminant?",
                            correct: 0,
                            options: [
                                "Lead",
                                "Plastic container",
                                "Sunlight",
                                "Filtered sand",
                            ],
                        },
                        {
                            question: "Hand hygiene prevents waterborne disease by?",
                            correct: 0,
                            options: [
                                "Stopping bacteria transfer",
                                "Washing containers only",
                                "Using gloves only",
                                "Boiling water only",
                            ],
                        },
                    ]),
                ],
            },
        },
        {
            title: "Electrical Safety Training",
            description: "Learn safe practices for handling electrical systems and equipment.",
            categoryId: categories[1].id,
            duration: 150,
            CourseObjectives: {
                create: [
                    { objective: "Understand electrical hazards" },
                    { objective: "Apply proper equipment safety" },
                    { objective: "Prevent electrical accidents in workplace" },
                ],
            },
            Lessons: {
                create: [
                    {
                        title: "Electrical Safety Basics",
                        content: "Introduction to electrical risks and safety.",
                        typeId: lessonTypes[0].id,
                        duration: 40,
                    },
                    {
                        title: "Video on Electrical Safety",
                        content: "Demonstration of safe electrical practices.",
                        typeId: lessonTypes[1].id,
                        duration: 35,
                    },
                    {
                        title: "Electrical Safety PPT Overview",
                        content: "Visual summary of key electrical safety measures.",
                        typeId: lessonTypes[2].id,
                        duration: 25,
                    },
                ],
            },
            Quizzes: {
                create: [
                    createQuiz("Electrical Basics Quiz", 80, [
                        {
                            question: "What is a primary electrical hazard?",
                            correct: 0,
                            options: ["Electric shock", "Paper cuts", "Slips", "Drowning"],
                        },
                        {
                            question: "Which tool protects against shocks?",
                            correct: 0,
                            options: [
                                "Insulated gloves",
                                "Metal gloves",
                                "Rubber shoes",
                                "Plastic ruler",
                            ],
                        },
                        {
                            question: "Do not touch electrical wires when?",
                            correct: 0,
                            options: [
                                "They are live",
                                "They are painted",
                                "They are plastic",
                                "They are insulated",
                            ],
                        },
                        {
                            question: "Proper grounding prevents?",
                            correct: 0,
                            options: ["Electric shocks", "Falls", "Cuts", "Drowning"],
                        },
                        {
                            question: "Electrical PPE includes?",
                            correct: 0,
                            options: ["Gloves and goggles", "Hat", "Boots", "Apron"],
                        },
                    ]),
                    createQuiz("Electrical Advanced Quiz", 80, [
                        {
                            question: "Voltage over what is dangerous?",
                            correct: 0,
                            options: ["50V", "5V", "1V", "10V"],
                        },
                        {
                            question: "Overloaded circuits can cause?",
                            correct: 0,
                            options: ["Fire", "Noise", "Dust", "Leak"],
                        },
                        {
                            question: "Lockout-tagout prevents?",
                            correct: 0,
                            options: [
                                "Accidental energization",
                                "Water damage",
                                "Theft",
                                "Noise",
                            ],
                        },
                        {
                            question: "Using wet hands increases risk of?",
                            correct: 0,
                            options: ["Shock", "Cuts", "Slip", "Poisoning"],
                        },
                        {
                            question: "Check cords for?",
                            correct: 0,
                            options: ["Fraying", "Color", "Length", "Brand"],
                        },
                    ]),
                ],
            },
        },
        {
            title: "First Aid Essentials",
            description: "Basic first aid procedures for workplace emergencies.",
            categoryId: categories[2].id,
            duration: 120,
            CourseObjectives: {
                create: [
                    { objective: "Provide basic first aid" },
                    { objective: "Understand CPR procedures" },
                    { objective: "Manage minor injuries effectively" },
                ],
            },
            Lessons: {
                create: [
                    {
                        title: "Introduction to First Aid",
                        content: "Learn core first aid concepts.",
                        typeId: lessonTypes[0].id,
                        duration: 40,
                    },
                    {
                        title: "CPR Video Guide",
                        content: "Step-by-step CPR instructions.",
                        typeId: lessonTypes[1].id,
                        duration: 30,
                    },
                    {
                        title: "First Aid PPT Summary",
                        content: "Visual guide to first aid procedures.",
                        typeId: lessonTypes[2].id,
                        duration: 20,
                    },
                ],
            },
            Quizzes: {
                create: [
                    createQuiz("First Aid Basics Quiz", 80, [
                        {
                            question: "What is the first step in first aid?",
                            correct: 0,
                            options: [
                                "Assess the scene",
                                "Call family",
                                "Move patient",
                                "Take photo",
                            ],
                        },
                        {
                            question: "CPR stands for?",
                            correct: 0,
                            options: [
                                "Cardiopulmonary resuscitation",
                                "Central Pulse Response",
                                "Critical Patient Recovery",
                                "Careful Positioning Routine",
                            ],
                        },
                        {
                            question: "Bandage a wound to?",
                            correct: 0,
                            options: [
                                "Stop bleeding",
                                "Make it look neat",
                                "Prevent smell",
                                "Mark it",
                            ],
                        },
                        {
                            question: "Treat burns by?",
                            correct: 0,
                            options: [
                                "Cool with water",
                                "Cover tightly",
                                "Rub cream immediately",
                                "Expose to sun",
                            ],
                        },
                        {
                            question: "When to call emergency services?",
                            correct: 0,
                            options: [
                                "Severe injury",
                                "Minor scratch",
                                "Paper cut",
                                "Feeling dizzy",
                            ],
                        },
                    ]),
                    createQuiz("First Aid Advanced Quiz", 80, [
                        {
                            question: "Proper CPR rate per minute?",
                            correct: 0,
                            options: ["100-120", "50", "200", "30"],
                        },
                        {
                            question: "Check responsiveness by?",
                            correct: 0,
                            options: [
                                "Tap shoulder",
                                "Ignore",
                                "Call loudly once",
                                "Shake violently",
                            ],
                        },
                        {
                            question: "Use AED when?",
                            correct: 0,
                            options: ["Cardiac arrest", "Coughing", "Broken leg", "Fever"],
                        },
                        {
                            question: "Choking aid involves?",
                            correct: 0,
                            options: [
                                "Heimlich maneuver",
                                "Push chest",
                                "Pour water",
                                "Shake person",
                            ],
                        },
                        {
                            question: "First aid kit must include?",
                            correct: 0,
                            options: [
                                "Bandages and antiseptic",
                                "Candy",
                                "Books",
                                "Scissors only",
                            ],
                        },
                    ]),
                ],
            },
        },
        {
            title: "Fire Safety Awareness",
            description: "Essential fire safety knowledge and emergency procedures.",
            categoryId: categories[2].id,
            duration: 130,
            CourseObjectives: {
                create: [
                    { objective: "Identify fire hazards" },
                    { objective: "Use fire extinguishers properly" },
                    { objective: "Evacuate safely in emergencies" },
                ],
            },
            Lessons: {
                create: [
                    {
                        title: "Fire Hazards Overview",
                        content: "Common workplace fire hazards.",
                        typeId: lessonTypes[0].id,
                        duration: 40,
                    },
                    {
                        title: "Fire Safety Video Guide",
                        content: "Emergency response visual guide.",
                        typeId: lessonTypes[1].id,
                        duration: 35,
                    },
                    {
                        title: "Fire Safety PPT",
                        content: "Visual summary of fire safety rules.",
                        typeId: lessonTypes[2].id,
                        duration: 25,
                    },
                ],
            },
            Quizzes: {
                create: [
                    createQuiz("Fire Safety Basics Quiz", 80, [
                        {
                            question: "Most common workplace fire cause?",
                            correct: 0,
                            options: ["Electrical faults", "Paper", "Plastic", "Clothes"],
                        },
                        {
                            question: "Extinguishers for electrical fire?",
                            correct: 0,
                            options: ["CO2 extinguisher", "Water", "Foam", "Sand"],
                        },
                        {
                            question: "Evacuation assembly point?",
                            correct: 0,
                            options: ["Predefined safe area", "Parking lot", "Lobby", "Roof"],
                        },
                        {
                            question: "Stop, drop, and roll is for?",
                            correct: 0,
                            options: [
                                "Clothing fire",
                                "House fire",
                                "Paper fire",
                                "Car fire",
                            ],
                        },
                        {
                            question: "Smoke alarms alert?",
                            correct: 0,
                            options: ["Fire presence", "Water leak", "Intruder", "Gas"],
                        },
                    ]),
                    createQuiz("Fire Safety Advanced Quiz", 80, [
                        {
                            question: "Use fire extinguisher when?",
                            correct: 0,
                            options: [
                                "Small contained fire",
                                "Big fire",
                                "Flood",
                                "Earthquake",
                            ],
                        },
                        {
                            question: "Do not use water on?",
                            correct: 0,
                            options: [
                                "Electrical fire",
                                "Paper fire",
                                "Wood fire",
                                "Cloth fire",
                            ],
                        },
                        {
                            question: "Emergency exit signs indicate?",
                            correct: 0,
                            options: [
                                "Safe route",
                                "Danger zone",
                                "Fire extinguisher",
                                "AED",
                            ],
                        },
                        {
                            question: "Fire drills help to?",
                            correct: 0,
                            options: [
                                "Practice evacuation",
                                "Learn CPR",
                                "Handle chemicals",
                                "Check temperature",
                            ],
                        },
                        {
                            question: "Fire doors must?",
                            correct: 0,
                            options: [
                                "Stay closed",
                                "Be locked",
                                "Open permanently",
                                "Be blocked",
                            ],
                        },
                    ]),
                ],
            },
        },
        {
            title: "Workplace Hazard Training",
            description: "Identify and manage workplace hazards for safety compliance.",
            categoryId: categories[2].id,
            duration: 160,
            CourseObjectives: {
                create: [
                    { objective: "Recognize common hazards" },
                    { objective: "Implement safety procedures" },
                    { objective: "Reduce workplace accidents" },
                ],
            },
            Lessons: {
                create: [
                    {
                        title: "Introduction to Hazards",
                        content: "Overview of hazards in workplace.",
                        typeId: lessonTypes[0].id,
                        duration: 45,
                    },
                    {
                        title: "Hazard Video Examples",
                        content: "Visual guide to hazards and mitigation.",
                        typeId: lessonTypes[1].id,
                        duration: 35,
                    },
                    {
                        title: "Hazard PPT Summary",
                        content: "Quick reference to workplace hazards.",
                        typeId: lessonTypes[2].id,
                        duration: 30,
                    },
                ],
            },
            Quizzes: {
                create: [
                    createQuiz("Hazard Basics Quiz", 80, [
                        {
                            question: "Slips, trips, and falls are?",
                            correct: 0,
                            options: [
                                "Common hazards",
                                "Rare hazards",
                                "Unlikely hazards",
                                "Imaginary hazards",
                            ],
                        },
                        {
                            question: "Proper PPE helps to?",
                            correct: 0,
                            options: [
                                "Reduce injury",
                                "Increase speed",
                                "Decorate workplace",
                                "Increase hazard",
                            ],
                        },
                        {
                            question: "Report hazards to?",
                            correct: 0,
                            options: ["Supervisor", "Friend", "Cleaning staff", "Visitor"],
                        },
                        {
                            question: "Chemical hazard label color?",
                            correct: 0,
                            options: ["Red/Yellow", "Blue", "Green", "Purple"],
                        },
                        {
                            question: "Emergency procedures include?",
                            correct: 0,
                            options: ["Evacuation", "Resting", "Break time", "Lunch"],
                        },
                    ]),
                    createQuiz("Hazard Advanced Quiz", 80, [
                        {
                            question: "Lockout-tagout prevents?",
                            correct: 0,
                            options: [
                                "Machine energization",
                                "Water spills",
                                "Trips",
                                "Noise",
                            ],
                        },
                        {
                            question: "Electrical hazards include?",
                            correct: 0,
                            options: [
                                "Exposed wires",
                                "Paper cuts",
                                "Slippery floors",
                                "Noise",
                            ],
                        },
                        {
                            question: "Ergonomic hazards affect?",
                            correct: 0,
                            options: ["Muscles and joints", "Vision", "Hearing", "Taste"],
                        },
                        {
                            question: "PPE stands for?",
                            correct: 0,
                            options: [
                                "Personal Protective Equipment",
                                "Primary Practical Education",
                                "Power Protection Electronics",
                                "Public PPE Education",
                            ],
                        },
                        {
                            question: "Fire hazards include?",
                            correct: 0,
                            options: ["Flammable materials", "Wet floor", "Books", "Pens"],
                        },
                    ]),
                ],
            },
        },
    ];
    for (const course of coursesData) {
        await prisma.course.create({ data: course });
    }
    console.log("Seed completed successfully!");
}
function createQuiz(title, passingScore, questions) {
    return {
        title,
        passingScore,
        Questions: {
            create: questions.map((q) => ({
                question: q.question,
                Options: {
                    create: q.options.map((opt, idx) => ({
                        option: opt,
                        isCorrect: idx === q.correct,
                    })),
                },
            })),
        },
    };
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
