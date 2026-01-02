export const WELCOME_MESSAGES = [
  // Bold, confident opener
  `Hey! Let's build you a program that actually works. 💪

No generic templates. No cookie-cutter routines. Just a workout plan designed around YOUR goals, YOUR schedule, and YOUR equipment.

Tell me what you're working toward - building muscle, getting stronger, losing weight, or just feeling better. I'll handle the rest.`,

  // Direct and energetic
  `Ready to stop guessing and start training smart? 🎯

I'm here to create YOUR perfect program. Not someone else's - yours.

What's the goal? Drop some weight? Build some muscle? Get back in shape after a break? Let's hear it.`,

  // Motivational and warm
  `This is where it starts. 🔥

Whatever brought you here today - wanting to look better, feel stronger, or just finally commit to something real - you're in the right place.

Tell me about your goals. Be specific, be vague, ramble if you need to. I'll piece it together and build you something great.`
];

export const getRandomWelcomeMessage = () => {
  const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
  return WELCOME_MESSAGES[randomIndex];
};
