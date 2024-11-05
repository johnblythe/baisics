import { sendMessage } from "@/utils/chat";

export default async function Home() {
  // Test the Anthropic integration with a simple message
  // const response = await sendMessage([
  //   { role: "user", content: "What's the capital of Rwanda?" },
  // ]);
  const response = null;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Anthropic Test</h1>

      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Response:</h2>
        {response?.success ? (
          <p>{response?.data.content[0].text || "hello!"}</p>
        ) : (
          <p className="text-red-500">Error: {response?.error || "hello!"}</p>
        )}
      </div>
    </main>
  );
}
