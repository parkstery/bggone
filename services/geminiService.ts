// Client-side now calls our server endpoint instead of using @google/genai in the browser.

export const removeBackground = async (base64Image: string): Promise<string> => {
  const res = await fetch("/api/remove-bg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: base64Image })
  });

  if (!res.ok) {
    const payload = await res.text();
    throw new Error(payload || "Failed to process image on server");
  }

  const data = await res.json();
  if (!data?.result) {
    throw new Error("No result returned from server");
  }

  return data.result; // base64 string (no data: prefix)
};
