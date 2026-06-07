const checks = [
  {
    name: "frontend",
    url: "http://127.0.0.1:3000/",
    validate: async (response) => {
      const text = await response.text();
      return response.ok && text.toLowerCase().includes("<!doctype html>");
    },
  },
  {
    name: "api tags",
    url: "http://127.0.0.1:3001/api/tags",
    validate: async (response) => {
      const json = await response.json();
      return response.ok && Array.isArray(json.tags);
    },
  },
];

for (const check of checks) {
  const response = await fetch(check.url);
  if (!(await check.validate(response))) {
    throw new Error(`[smoke] ${check.name} failed at ${check.url}`);
  }
  console.log(`[smoke] ${check.name} ok: ${check.url}`);
}
