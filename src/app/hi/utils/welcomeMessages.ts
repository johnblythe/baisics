export const WELCOME_MESSAGES = [
  // Original message
  `Hey there! 👋 

I'm excited to help create a fitness program that's tailored to you. Let's start with what matters most - your story and goals.

💭 Tell me about what brings you here today. What are you hoping to achieve? Feel free to share anything you think would help me design the best possible program for you!

Don't worry about structure - just share what's on your mind, and we'll chat to figure things out.`,

  // More casual, direct variation
  `Hi! Ready to create your perfect workout plan? 🎯

Let's skip boring questionnaires and just have a real conversation. What's motivating you to start this fitness journey?

Simply chat - I'm here to listen and create a program that fits YOU! 💪`,

  // More structured, professional variation
  `Welcome to your personalized fitness consultation! 🌟

I'm here to design a program specifically for YOU. To create the most effective plan, I'd love to understand your unique motivations and goals.

Your journey is unique, and your program should reflect that. Let's start with what matters most to you.`
];

export const getRandomWelcomeMessage = () => {
  const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
  return WELCOME_MESSAGES[randomIndex];
}; 