export async function createProposal(postId: number): Promise<{ alreadyExists: boolean }> {
  const res = await fetch(`/api/v0/proposals/waste-posts/${postId}/create/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      "ngrok-skip-browser-warning": "69420",
    },
  });
  if (res.status === 200) return { alreadyExists: true };
  if (res.status === 201) return { alreadyExists: false };
  const err = await res.json().catch(() => ({}));
  throw new Error((err as any)?.detail || `HTTP ${res.status}`);
}