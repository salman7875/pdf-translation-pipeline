export async function translateTamilToEnglish(text: string) {
  const apiUrl = `http://localhost:5001/translate`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text }),
    });
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Translation failed:", error);
    return null;
  }
}
