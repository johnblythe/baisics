export const WELCOME_MESSAGES = [
  // Original message
  `Hey there! 👋 

I'm excited to help create a fitness program that's perfectly tailored to you. Let's start with what matters most - your story and goals.

💭 Tell me about what brings you here today. What are you hoping to achieve? Feel free to share anything you think would help me design the best possible program for you, such as:

• Your fitness goals
• Current lifestyle and activity level
• Any past experience with working out
• Time constraints or preferences
• Health considerations or injuries
• What's worked (or hasn't worked) for you before

Don't worry about structure - just share what's on your mind, and we'll figure out the perfect plan together!`,

  // More casual, direct variation
  `Hi! Ready to create your perfect workout plan? 🎯

Instead of a boring questionnaire, let's have a real conversation. What's motivating you to start this fitness journey?

Some things that would help me understand you better:
• What are your main fitness goals?
• How active are you currently?
• Have you worked out before?
• How much time can you commit?
• Any injuries or health concerns?

Just chat naturally - I'm here to listen and create a program that fits YOUR life! 💪`,

  // More structured, professional variation
  `Welcome to your personalized fitness consultation! 🌟

I'm here to design a program specifically for you. To create the most effective plan, I'd love to understand your unique situation.

Please share your thoughts on:
• Primary fitness objectives
• Current activity levels
• Exercise history
• Schedule availability
• Physical considerations
• Previous fitness experiences

Your journey is unique, and your program should reflect that. Let's start with what matters most to you.`
];

export const getRandomWelcomeMessage = () => {
  const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
  return WELCOME_MESSAGES[randomIndex];
}; 