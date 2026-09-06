export async function translateTamilToEnglish(text: string) {
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ta|en`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.responseData.translatedText;
  } catch (error) {
    console.error("Translation failed:", error);
    return null;
  }
}
